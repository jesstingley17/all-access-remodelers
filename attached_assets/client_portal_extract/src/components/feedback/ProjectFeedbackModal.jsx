import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';

export default function ProjectFeedbackModal({ project, onClose, onRefresh }) {
    const [feedbackData, setFeedbackData] = useState({
        overall_satisfaction: 0,
        communication_rating: 0,
        quality_rating: 0,
        timeline_rating: 0,
        budget_rating: 0,
        comments: '',
        would_recommend: false,
        areas_for_improvement: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const improvementAreas = [
        'Communication',
        'Timeline Management',
        'Budget Management',
        'Quality of Work',
        'Problem Resolution',
        'Site Cleanliness'
    ];

    const handleRatingChange = (field, value) => {
        setFeedbackData({ ...feedbackData, [field]: value });
    };

    const handleImprovementToggle = (area) => {
        const current = feedbackData.areas_for_improvement;
        if (current.includes(area)) {
            setFeedbackData({
                ...feedbackData,
                areas_for_improvement: current.filter(a => a !== area)
            });
        } else {
            setFeedbackData({
                ...feedbackData,
                areas_for_improvement: [...current, area]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (feedbackData.overall_satisfaction === 0) return;

        setIsSubmitting(true);
        try {
            await base44.entities.ProjectFeedback.create({
                project_id: project.id,
                client_id: project.client_id,
                ...feedbackData
            });

            // Update project status to completed if not already
            if (project.status !== 'completed') {
                await base44.entities.Project.update(project.id, {
                    status: 'completed'
                });
            }

            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
        setIsSubmitting(false);
    };

    const RatingStars = ({ value, onChange, label }) => {
        const [hovered, setHovered] = useState(0);
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                        >
                            <Star
                                className={`w-6 h-6 ${
                                    star <= (hovered || value)
                                        ? 'fill-amber-500 text-amber-500'
                                        : 'text-slate-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Project Satisfaction Survey</DialogTitle>
                    <p className="text-sm text-slate-600 mt-1">
                        Help us improve by sharing your experience with {project.name}
                    </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <RatingStars
                        value={feedbackData.overall_satisfaction}
                        onChange={(val) => handleRatingChange('overall_satisfaction', val)}
                        label="Overall Satisfaction *"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <RatingStars
                            value={feedbackData.communication_rating}
                            onChange={(val) => handleRatingChange('communication_rating', val)}
                            label="Communication"
                        />
                        <RatingStars
                            value={feedbackData.quality_rating}
                            onChange={(val) => handleRatingChange('quality_rating', val)}
                            label="Work Quality"
                        />
                        <RatingStars
                            value={feedbackData.timeline_rating}
                            onChange={(val) => handleRatingChange('timeline_rating', val)}
                            label="Timeline Adherence"
                        />
                        <RatingStars
                            value={feedbackData.budget_rating}
                            onChange={(val) => handleRatingChange('budget_rating', val)}
                            label="Budget Adherence"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Areas for Improvement</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {improvementAreas.map((area) => (
                                <div key={area} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={feedbackData.areas_for_improvement.includes(area)}
                                        onCheckedChange={() => handleImprovementToggle(area)}
                                    />
                                    <label className="text-sm">{area}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Additional Comments</Label>
                        <Textarea
                            value={feedbackData.comments}
                            onChange={(e) => setFeedbackData({...feedbackData, comments: e.target.value})}
                            placeholder="Share any additional thoughts or suggestions..."
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={feedbackData.would_recommend}
                            onCheckedChange={(checked) => setFeedbackData({...feedbackData, would_recommend: checked})}
                        />
                        <label className="text-sm font-medium">
                            I would recommend your services to others
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={feedbackData.overall_satisfaction === 0 || isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}