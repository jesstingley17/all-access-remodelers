import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import MockupForm from '../components/mockup/MockupForm';
import MockupDisplay from '../components/mockup/MockupDisplay';
import ExportPanel from '../components/mockup/ExportPanel';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MockupGenerator() {
    const [mockups, setMockups] = useState([]);
    const [annotations, setAnnotations] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generateMockups = async (formData) => {
        setIsGenerating(true);
        setError(null);
        
        try {
            let logoUrl = null;
            
            // Upload logo if provided
            if (formData.logo) {
                const uploadResult = await base44.integrations.Core.UploadFile({
                    file: formData.logo
                });
                logoUrl = uploadResult.file_url;
            }

            // Build sections list
            const selectedSections = Object.entries(formData.sections)
                .filter(([_, isSelected]) => isSelected)
                .map(([sectionName, _]) => sectionName);

            // Map template to style description
            const templateDescriptions = {
                modern: 'clean, modern, minimalist with bold typography and lots of whitespace',
                classic: 'traditional, elegant, timeless design with refined elements',
                creative: 'bold, artistic, unique layout with creative elements and asymmetric design',
                startup: 'energetic, dynamic, tech-focused with modern gradients and animations feel',
                corporate: 'professional, trustworthy, business-oriented with conservative layout'
            };

            // Generate multiple mockup variations
            const mockupVariations = [
                { style: `${formData.layoutTemplate} - Desktop`, device: 'Desktop' },
                { style: `${formData.layoutTemplate} - Mobile`, device: 'Mobile' }
            ];

            const generatedMockups = [];

            for (const mockupConfig of mockupVariations) {
                const sectionsList = selectedSections.map(s => s.replace('_', ' ')).join(', ');
                
                const prompt = `Create a realistic, high-quality, professional website mockup for a business called "${formData.brandName}". 
                ${formData.tagline ? `Tagline: "${formData.tagline}".` : ''}
                ${formData.aboutText ? `Business description: "${formData.aboutText}".` : ''}
                
                Layout Style: ${templateDescriptions[formData.layoutTemplate]}.
                Color Palette: Use these colors harmoniously - Primary: ${formData.colorPalette.colors[0]}, Secondary: ${formData.colorPalette.colors[1]}, Accent: ${formData.colorPalette.colors[2]}.
                
                Website Sections to Include (in order): ${sectionsList}.
                
                ${logoUrl ? `Include their logo design prominently in the header/navigation area.` : ''}
                ${mockupConfig.device === 'Desktop' ? 'Show a full desktop browser window view (1920x1080 resolution) with all selected sections visible, including navigation bar at top.' : 'Show a mobile phone screen (375x812 resolution) displaying the website in responsive mobile layout.'}
                
                Design Requirements:
                - Make it look like a real, polished, production-ready website screenshot
                - Use modern UI/UX best practices with proper hierarchy and spacing
                - Include realistic placeholder images, icons, and content for each section
                - Ensure professional typography and consistent styling throughout
                - Add subtle shadows, gradients, or effects that match the chosen template style
                - Make the design inspire confidence and look pixel-perfect
                
                The mockup should look like an actual screenshot of a live, professional website.`;

                const result = await base44.integrations.Core.GenerateImage({
                    prompt
                });

                generatedMockups.push({
                    url: result.url,
                    style: mockupConfig.style,
                    device: mockupConfig.device,
                    template: formData.layoutTemplate,
                    palette: formData.colorPalette.name
                });
            }

            setMockups(generatedMockups);
        } catch (err) {
            setError('Failed to generate mockups. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Website Mockup Generator
                    </h1>
                    <p className="text-lg text-gray-600">
                        Upload your logo and content to generate realistic website previews
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <MockupForm 
                            onGenerate={generateMockups}
                            isGenerating={isGenerating}
                        />
                    </div>
                    
                    <div className="lg:col-span-2">
                        {!isGenerating && mockups.length === 0 && (
                            <div className="flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 h-full">
                                <div className="text-center space-y-2">
                                    <div className="text-6xl">🎨</div>
                                    <h3 className="text-xl font-semibold text-gray-700">
                                        Your mockups will appear here
                                    </h3>
                                    <p className="text-gray-500">
                                        Customize your options and click generate to see website previews
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {isGenerating && (
                            <div className="flex items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 h-full">
                                <div className="text-center space-y-4">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                                    <h3 className="text-xl font-semibold text-gray-700">
                                        Creating your mockups...
                                    </h3>
                                    <p className="text-gray-500">
                                        This may take up to 30 seconds
                                    </p>
                                </div>
                            </div>
                        )}

                        {mockups.length > 0 && !isGenerating && (
                            <div className="space-y-6">
                                <MockupDisplay mockups={mockups} />
                                <ExportPanel mockups={mockups} annotations={annotations} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}