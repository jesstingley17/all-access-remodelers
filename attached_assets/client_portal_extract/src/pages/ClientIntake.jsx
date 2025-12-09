import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ClientIntake() {
    const [formData, setFormData] = useState({
        client_name: '',
        company_name: '',
        email: '',
        phone: '',
        project_type: '',
        project_description: '',
        budget_range: '',
        timeline: '',
        target_audience: '',
        brand_colors: '',
        inspiration_links: '',
        additional_notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await base44.entities.IntakeForm.create({
                ...formData,
                status: 'pending'
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
                        <p className="text-gray-600">
                            Your intake form has been submitted successfully. We'll review your information and get back to you shortly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-3xl mx-auto space-y-6 py-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">Client Intake Form</h1>
                    <p className="text-lg text-gray-600">
                        Tell us about your project so we can provide the best service
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>How can we reach you?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="client_name">Full Name *</Label>
                                <Input
                                    id="client_name"
                                    value={formData.client_name}
                                    onChange={(e) => handleChange('client_name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                    id="company_name"
                                    value={formData.company_name}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                    placeholder="Acme Inc."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Tell us about what you need</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="project_type">Project Type *</Label>
                                <Select
                                    value={formData.project_type}
                                    onValueChange={(value) => handleChange('project_type', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="logo_design">Logo Design</SelectItem>
                                        <SelectItem value="website_design">Website Design</SelectItem>
                                        <SelectItem value="branding">Branding Package</SelectItem>
                                        <SelectItem value="mockup">Mockup Creation</SelectItem>
                                        <SelectItem value="full_package">Full Package (Logo + Website)</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="project_description">Project Description *</Label>
                                <Textarea
                                    id="project_description"
                                    value={formData.project_description}
                                    onChange={(e) => handleChange('project_description', e.target.value)}
                                    placeholder="Describe your project in detail..."
                                    className="h-32"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget_range">Budget Range</Label>
                                    <Select
                                        value={formData.budget_range}
                                        onValueChange={(value) => handleChange('budget_range', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="under_1k">Under $1,000</SelectItem>
                                            <SelectItem value="1k_5k">$1,000 - $5,000</SelectItem>
                                            <SelectItem value="5k_10k">$5,000 - $10,000</SelectItem>
                                            <SelectItem value="10k_20k">$10,000 - $20,000</SelectItem>
                                            <SelectItem value="20k_plus">$20,000+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timeline">Timeline</Label>
                                    <Select
                                        value={formData.timeline}
                                        onValueChange={(value) => handleChange('timeline', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
                                            <SelectItem value="1_2_weeks">1-2 Weeks</SelectItem>
                                            <SelectItem value="2_4_weeks">2-4 Weeks</SelectItem>
                                            <SelectItem value="1_2_months">1-2 Months</SelectItem>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>Help us understand your vision</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="target_audience">Target Audience</Label>
                                <Textarea
                                    id="target_audience"
                                    value={formData.target_audience}
                                    onChange={(e) => handleChange('target_audience', e.target.value)}
                                    placeholder="Who is your target audience?"
                                    className="h-24"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand_colors">Preferred Brand Colors</Label>
                                <Input
                                    id="brand_colors"
                                    value={formData.brand_colors}
                                    onChange={(e) => handleChange('brand_colors', e.target.value)}
                                    placeholder="e.g., Blue, Gold, White"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="inspiration_links">Inspiration Links</Label>
                                <Textarea
                                    id="inspiration_links"
                                    value={formData.inspiration_links}
                                    onChange={(e) => handleChange('inspiration_links', e.target.value)}
                                    placeholder="Share links to designs you like (one per line)"
                                    className="h-24"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additional_notes">Additional Notes</Label>
                                <Textarea
                                    id="additional_notes"
                                    value={formData.additional_notes}
                                    onChange={(e) => handleChange('additional_notes', e.target.value)}
                                    placeholder="Anything else you'd like us to know?"
                                    className="h-24"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Intake Form'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}