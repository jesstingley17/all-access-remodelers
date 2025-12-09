import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Send, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ProposalGenerator({ project, client, onClose, onSave }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [proposal, setProposal] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const generateProposal = async () => {
        setIsGenerating(true);
        try {
            const aiResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Generate a professional project proposal based on the following information:

Project: ${project.title}
Client: ${client.name}${client.company ? ` (${client.company})` : ''}
Project Type: ${project.project_type}
Description: ${project.description}
Budget: $${project.budget?.toLocaleString() || 'TBD'}
Estimated Hours: ${project.estimated_hours || 'TBD'} hours
Timeline: ${project.start_date || 'TBD'} to ${project.due_date || 'TBD'}
Priority: ${project.priority}
Additional Notes: ${project.notes || 'N/A'}

Create a comprehensive, professional proposal document with the following sections:
1. Executive Summary - Brief overview of the project and value proposition
2. Scope of Work - Detailed breakdown of deliverables and what's included
3. Timeline & Milestones - Project phases and key dates
4. Budget Breakdown - Itemized costs and payment structure
5. Terms & Conditions - Payment terms, revisions policy, ownership rights

Make it professional, persuasive, and client-focused. Use a warm but professional tone.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        executive_summary: { type: "string" },
                        scope_of_work: { type: "string" },
                        timeline: { type: "string" },
                        budget_breakdown: { type: "string" },
                        terms_and_conditions: { type: "string" },
                        total_amount: { type: "number" }
                    }
                }
            });

            const fullContent = `# ${aiResult.title}

## Executive Summary
${aiResult.executive_summary}

## Scope of Work
${aiResult.scope_of_work}

## Timeline & Milestones
${aiResult.timeline}

## Budget Breakdown
${aiResult.budget_breakdown}

**Total Investment: $${aiResult.total_amount.toLocaleString()}**

## Terms & Conditions
${aiResult.terms_and_conditions}`;

            setProposal({
                ...aiResult,
                content: fullContent
            });
        } catch (error) {
            console.error('Failed to generate proposal:', error);
            alert('Failed to generate proposal. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (sendToClient = false) => {
        setIsSaving(true);
        try {
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);

            const proposalData = {
                project_id: project.id,
                client_id: client.id,
                title: proposal.title,
                content: proposal.content,
                executive_summary: proposal.executive_summary,
                scope_of_work: proposal.scope_of_work,
                timeline: proposal.timeline,
                budget_breakdown: proposal.budget_breakdown,
                terms_and_conditions: proposal.terms_and_conditions,
                total_amount: proposal.total_amount,
                status: sendToClient ? 'sent' : 'draft',
                sent_date: sendToClient ? new Date().toISOString().split('T')[0] : null,
                valid_until: validUntil.toISOString().split('T')[0]
            };

            const savedProposal = await base44.entities.Proposal.create(proposalData);

            if (sendToClient) {
                await base44.integrations.Core.SendEmail({
                    to: client.email,
                    subject: `Proposal: ${proposal.title}`,
                    body: `Dear ${client.name},

Thank you for your interest in working with us. Please find attached our proposal for your project.

${proposal.content}

This proposal is valid until ${validUntil.toLocaleDateString()}.

If you have any questions or would like to discuss the proposal, please don't hesitate to reach out.

Best regards`
                });
            }

            onSave?.(savedProposal);
            alert(sendToClient ? 'Proposal sent to client!' : 'Proposal saved as draft!');
            onClose?.();
        } catch (error) {
            console.error('Failed to save proposal:', error);
            alert('Failed to save proposal. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="w-full max-w-5xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Proposal Generator</span>
                    {proposal && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? 'Preview' : 'Edit'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleSave(true)}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send to Client
                            </Button>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!proposal ? (
                    <div className="text-center py-12 space-y-4">
                        <Sparkles className="w-16 h-16 text-purple-600 mx-auto" />
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Generate Professional Proposal
                            </h3>
                            <p className="text-gray-600 mb-6">
                                AI will create a comprehensive proposal based on your project details
                            </p>
                            <Button
                                size="lg"
                                onClick={generateProposal}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Proposal...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate Proposal
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : editMode ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Proposal Title</Label>
                            <Input
                                value={proposal.title}
                                onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
                            />
                        </div>
                        <Tabs defaultValue="executive">
                            <TabsList className="grid grid-cols-5 w-full">
                                <TabsTrigger value="executive">Summary</TabsTrigger>
                                <TabsTrigger value="scope">Scope</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                <TabsTrigger value="budget">Budget</TabsTrigger>
                                <TabsTrigger value="terms">Terms</TabsTrigger>
                            </TabsList>
                            <TabsContent value="executive" className="space-y-2">
                                <Label>Executive Summary</Label>
                                <Textarea
                                    value={proposal.executive_summary}
                                    onChange={(e) => setProposal({ ...proposal, executive_summary: e.target.value })}
                                    className="h-64"
                                />
                            </TabsContent>
                            <TabsContent value="scope" className="space-y-2">
                                <Label>Scope of Work</Label>
                                <Textarea
                                    value={proposal.scope_of_work}
                                    onChange={(e) => setProposal({ ...proposal, scope_of_work: e.target.value })}
                                    className="h-64"
                                />
                            </TabsContent>
                            <TabsContent value="timeline" className="space-y-2">
                                <Label>Timeline & Milestones</Label>
                                <Textarea
                                    value={proposal.timeline}
                                    onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                                    className="h-64"
                                />
                            </TabsContent>
                            <TabsContent value="budget" className="space-y-2">
                                <Label>Budget Breakdown</Label>
                                <Textarea
                                    value={proposal.budget_breakdown}
                                    onChange={(e) => setProposal({ ...proposal, budget_breakdown: e.target.value })}
                                    className="h-64"
                                />
                                <div className="space-y-2">
                                    <Label>Total Amount ($)</Label>
                                    <Input
                                        type="number"
                                        value={proposal.total_amount}
                                        onChange={(e) => setProposal({ ...proposal, total_amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="terms" className="space-y-2">
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    value={proposal.terms_and_conditions}
                                    onChange={(e) => setProposal({ ...proposal, terms_and_conditions: e.target.value })}
                                    className="h-64"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="prose max-w-none">
                        <ReactMarkdown>{proposal.content}</ReactMarkdown>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}