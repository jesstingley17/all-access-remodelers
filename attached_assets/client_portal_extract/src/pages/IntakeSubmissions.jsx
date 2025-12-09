import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    Mail, 
    Phone, 
    Building2, 
    Clock, 
    DollarSign,
    CheckCircle2,
    Eye,
    Sparkles,
    Loader2,
    FileEdit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ProposalGenerator from '../components/proposals/ProposalGenerator';
import { automatedProjectOnboarding } from '../components/projects/ProjectOnboarding';

export default function IntakeSubmissions() {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [convertingId, setConvertingId] = useState(null);
    const [proposalModalOpen, setProposalModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const queryClient = useQueryClient();

    const { data: submissions = [], isLoading } = useQuery({
        queryKey: ['intakeSubmissions'],
        queryFn: () => base44.entities.IntakeForm.list('-created_date'),
        initialData: []
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => base44.entities.IntakeForm.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['intakeSubmissions'] });
        }
    });

    const convertToProjectMutation = useMutation({
        mutationFn: async (submission) => {
            // Use AI to extract and structure project information
            const aiAnalysis = await base44.integrations.Core.InvokeLLM({
                prompt: `Analyze this client intake form and extract structured project information:

Client Name: ${submission.client_name}
Company: ${submission.company_name || 'N/A'}
Email: ${submission.email}
Phone: ${submission.phone || 'N/A'}
Project Type: ${submission.project_type}
Description: ${submission.project_description}
Budget Range: ${submission.budget_range || 'N/A'}
Timeline: ${submission.timeline || 'N/A'}
Target Audience: ${submission.target_audience || 'N/A'}
Brand Colors: ${submission.brand_colors || 'N/A'}
Additional Notes: ${submission.additional_notes || 'N/A'}

Extract and return the following information:
1. A clear project title (concise, professional)
2. A comprehensive project description incorporating all relevant details
3. Estimated budget (numeric value in dollars based on budget range)
4. Estimated hours (realistic estimate based on project type and scope)
5. Priority level (urgent/high/medium/low based on timeline)
6. Suggested start date (format: YYYY-MM-DD, today or near future)
7. Suggested due date (format: YYYY-MM-DD, based on timeline)
8. Additional notes combining target audience, brand preferences, and other details`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        budget: { type: "number" },
                        estimated_hours: { type: "number" },
                        priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
                        start_date: { type: "string" },
                        due_date: { type: "string" },
                        notes: { type: "string" }
                    }
                }
            });

            // Create client first
            const client = await base44.entities.Client.create({
                name: submission.client_name,
                email: submission.email,
                phone: submission.phone,
                company: submission.company_name,
                status: 'active'
            });

            // Create project with AI-extracted information
            const project = await base44.entities.Project.create({
                title: aiAnalysis.title,
                description: aiAnalysis.description,
                project_type: submission.project_type,
                client_id: client.id,
                budget: aiAnalysis.budget,
                estimated_hours: aiAnalysis.estimated_hours,
                priority: aiAnalysis.priority,
                start_date: aiAnalysis.start_date,
                due_date: aiAnalysis.due_date,
                status: 'planning',
                notes: aiAnalysis.notes
            });

            // Update intake form status
            await base44.entities.IntakeForm.update(submission.id, { status: 'converted' });

            // Trigger automated onboarding
            await automatedProjectOnboarding(project, client);

            return { client, project };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['intakeSubmissions'] });
            setConvertingId(null);
            // Open proposal generator
            setSelectedProject(result.project);
            setSelectedClient(result.client);
            setProposalModalOpen(true);
        },
        onError: (error) => {
            console.error('Conversion failed:', error);
            setConvertingId(null);
            alert('Failed to convert to project. Please try again.');
        }
    });

    const handleConvertToProject = async (submission) => {
        setConvertingId(submission.id);
        convertToProjectMutation.mutate(submission);
    };

    const filteredSubmissions = selectedStatus === 'all' 
        ? submissions 
        : submissions.filter(s => s.status === selectedStatus);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        reviewed: 'bg-blue-100 text-blue-800',
        converted: 'bg-green-100 text-green-800'
    };

    const budgetLabels = {
        under_1k: 'Under $1,000',
        '1k_5k': '$1,000 - $5,000',
        '5k_10k': '$5,000 - $10,000',
        '10k_20k': '$10,000 - $20,000',
        '20k_plus': '$20,000+'
    };

    const timelineLabels = {
        urgent: 'Urgent (ASAP)',
        '1_2_weeks': '1-2 Weeks',
        '2_4_weeks': '2-4 Weeks',
        '1_2_months': '1-2 Months',
        flexible: 'Flexible'
    };

    const projectTypeLabels = {
        logo_design: 'Logo Design',
        website_design: 'Website Design',
        branding: 'Branding Package',
        mockup: 'Mockup Creation',
        full_package: 'Full Package',
        other: 'Other'
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-lg">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Intake Form Submissions</h1>
                        <p className="text-gray-600 mt-1">Review and manage client intake forms</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={selectedStatus === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedStatus('all')}
                        >
                            All ({submissions.length})
                        </Button>
                        <Button
                            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                            onClick={() => setSelectedStatus('pending')}
                        >
                            Pending ({submissions.filter(s => s.status === 'pending').length})
                        </Button>
                        <Button
                            variant={selectedStatus === 'reviewed' ? 'default' : 'outline'}
                            onClick={() => setSelectedStatus('reviewed')}
                        >
                            Reviewed ({submissions.filter(s => s.status === 'reviewed').length})
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{submission.client_name}</CardTitle>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge className={statusColors[submission.status]}>
                                                    {submission.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {projectTypeLabels[submission.project_type]}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {submission.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateStatusMutation.mutate({ 
                                                        id: submission.id, 
                                                        status: 'reviewed' 
                                                    })}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Mark Reviewed
                                                </Button>
                                            )}
                                            {submission.status === 'reviewed' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConvertToProject(submission)}
                                                    disabled={convertingId === submission.id}
                                                >
                                                    {convertingId === submission.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Converting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            AI Convert to Project
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{submission.email}</span>
                                            </div>
                                            {submission.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{submission.phone}</span>
                                                </div>
                                            )}
                                            {submission.company_name && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>{submission.company_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {submission.budget_range && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{budgetLabels[submission.budget_range]}</span>
                                                </div>
                                            )}
                                            {submission.timeline && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{timelineLabels[submission.timeline]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {submission.project_description && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Project Description</h4>
                                            <p className="text-gray-600 text-sm">{submission.project_description}</p>
                                        </div>
                                    )}

                                    {submission.target_audience && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Target Audience</h4>
                                            <p className="text-gray-600 text-sm">{submission.target_audience}</p>
                                        </div>
                                    )}

                                    {submission.brand_colors && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Preferred Colors</h4>
                                            <p className="text-gray-600 text-sm">{submission.brand_colors}</p>
                                        </div>
                                    )}

                                    {submission.inspiration_links && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Inspiration Links</h4>
                                            <p className="text-gray-600 text-sm whitespace-pre-line">{submission.inspiration_links}</p>
                                        </div>
                                    )}

                                    {submission.additional_notes && (
                                        <div className="pt-4 border-t">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Additional Notes</h4>
                                            <p className="text-gray-600 text-sm">{submission.additional_notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions found</h3>
                                <p className="text-gray-500">
                                    {selectedStatus === 'all' 
                                        ? 'No intake forms have been submitted yet.'
                                        : `No ${selectedStatus} submissions.`}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={proposalModalOpen} onOpenChange={setProposalModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Generate Proposal</DialogTitle>
                    </DialogHeader>
                    {selectedProject && selectedClient && (
                        <ProposalGenerator
                            project={selectedProject}
                            client={selectedClient}
                            onClose={() => setProposalModalOpen(false)}
                            onSave={() => {
                                setProposalModalOpen(false);
                                queryClient.invalidateQueries();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}