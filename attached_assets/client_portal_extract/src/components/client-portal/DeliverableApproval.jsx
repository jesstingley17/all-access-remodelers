import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, MessageSquare, Download, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DeliverableApproval({ deliverables, projects, onRefresh }) {
    const [selectedDeliverable, setSelectedDeliverable] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.title || 'Unknown Project';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending_review: 'bg-amber-100 text-amber-800',
            approved: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800',
            revision_requested: 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending_review: 'Pending Review',
            approved: 'Approved',
            rejected: 'Rejected',
            revision_requested: 'Revision Requested'
        };
        return labels[status] || status;
    };

    const handleApprove = async (deliverable) => {
        setIsSubmitting(true);
        try {
            await base44.entities.Deliverable.update(deliverable.id, {
                status: 'approved',
                reviewed_date: new Date().toISOString().split('T')[0],
                client_feedback: feedback || 'Approved'
            });
            setSelectedDeliverable(null);
            setFeedback('');
            onRefresh();
        } catch (error) {
            console.error('Error approving deliverable:', error);
        }
        setIsSubmitting(false);
    };

    const handleReject = async (deliverable) => {
        if (!feedback.trim()) {
            alert('Please provide feedback for rejection');
            return;
        }
        setIsSubmitting(true);
        try {
            await base44.entities.Deliverable.update(deliverable.id, {
                status: 'rejected',
                reviewed_date: new Date().toISOString().split('T')[0],
                client_feedback: feedback
            });
            setSelectedDeliverable(null);
            setFeedback('');
            onRefresh();
        } catch (error) {
            console.error('Error rejecting deliverable:', error);
        }
        setIsSubmitting(false);
    };

    const handleRequestRevision = async (deliverable) => {
        if (!feedback.trim()) {
            alert('Please provide specific revision requests');
            return;
        }
        setIsSubmitting(true);
        try {
            await base44.entities.Deliverable.update(deliverable.id, {
                status: 'revision_requested',
                reviewed_date: new Date().toISOString().split('T')[0],
                client_feedback: feedback
            });
            setSelectedDeliverable(null);
            setFeedback('');
            onRefresh();
        } catch (error) {
            console.error('Error requesting revision:', error);
        }
        setIsSubmitting(false);
    };

    const pendingDeliverables = deliverables.filter(d => d.status === 'pending_review');
    const reviewedDeliverables = deliverables.filter(d => d.status !== 'pending_review');

    return (
        <div className="space-y-6">
            {pendingDeliverables.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Pending Your Review</h2>
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertDescription className="text-amber-800">
                            You have {pendingDeliverables.length} deliverable{pendingDeliverables.length !== 1 ? 's' : ''} waiting for your review and approval.
                        </AlertDescription>
                    </Alert>
                    {pendingDeliverables.map((deliverable) => (
                        <Card key={deliverable.id} className="border-2 border-amber-200">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>{deliverable.title}</CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">{getProjectName(deliverable.project_id)}</p>
                                    </div>
                                    <Badge className={getStatusColor(deliverable.status)}>
                                        {getStatusLabel(deliverable.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {deliverable.description && (
                                    <p className="text-sm text-slate-600">{deliverable.description}</p>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Submitted: {new Date(deliverable.submitted_date || deliverable.created_date).toLocaleDateString()}
                                    </div>
                                    <span>Version {deliverable.version}</span>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => window.open(deliverable.file_url, '_blank')}
                                    className="w-full"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    View/Download {deliverable.file_name}
                                </Button>

                                {selectedDeliverable?.id === deliverable.id ? (
                                    <div className="space-y-3 pt-4 border-t">
                                        <Textarea
                                            placeholder="Add your feedback or comments..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="h-24"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleApprove(deliverable)}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleRequestRevision(deliverable)}
                                                disabled={isSubmitting || !feedback.trim()}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Request Revisions
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(deliverable)}
                                                disabled={isSubmitting || !feedback.trim()}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setSelectedDeliverable(null);
                                                setFeedback('');
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => setSelectedDeliverable(deliverable)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Review & Provide Feedback
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {reviewedDeliverables.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">Previously Reviewed</h2>
                    {reviewedDeliverables.map((deliverable) => (
                        <Card key={deliverable.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{deliverable.title}</CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">{getProjectName(deliverable.project_id)}</p>
                                    </div>
                                    <Badge className={getStatusColor(deliverable.status)}>
                                        {getStatusLabel(deliverable.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-sm text-slate-600">
                                    Reviewed on {new Date(deliverable.reviewed_date || deliverable.updated_date).toLocaleDateString()}
                                </div>
                                {deliverable.client_feedback && (
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <div className="text-sm font-medium text-slate-700 mb-1">Your Feedback:</div>
                                        <div className="text-sm text-slate-600">{deliverable.client_feedback}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {deliverables.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No deliverables yet</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}