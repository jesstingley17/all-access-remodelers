import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export default function MockupForm({ onGenerate, isGenerating }) {
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [tagline, setTagline] = useState('');
    const [aboutText, setAboutText] = useState('');
    const [layoutTemplate, setLayoutTemplate] = useState('modern');
    const [colorPalette, setColorPalette] = useState('blue');
    const [sections, setSections] = useState({
        hero: true,
        features: true,
        about: false,
        services: false,
        testimonials: false,
        pricing: false,
        team: false,
        gallery: false,
        contact: false,
        footer: true
    });

    const layoutTemplates = [
        { id: 'modern', name: 'Modern', description: 'Clean and minimalist with bold typography' },
        { id: 'classic', name: 'Classic', description: 'Traditional layout with elegant design' },
        { id: 'creative', name: 'Creative', description: 'Bold and artistic with unique layouts' },
        { id: 'startup', name: 'Startup', description: 'Energetic and dynamic tech-focused' },
        { id: 'corporate', name: 'Corporate', description: 'Professional and trustworthy business look' }
    ];

    const colorPalettes = [
        { id: 'blue', name: 'Ocean Blue', colors: ['#3B82F6', '#1E40AF', '#DBEAFE'] },
        { id: 'purple', name: 'Royal Purple', colors: ['#8B5CF6', '#6D28D9', '#EDE9FE'] },
        { id: 'green', name: 'Nature Green', colors: ['#10B981', '#059669', '#D1FAE5'] },
        { id: 'orange', name: 'Sunset Orange', colors: ['#F59E0B', '#D97706', '#FEF3C7'] },
        { id: 'pink', name: 'Vibrant Pink', colors: ['#EC4899', '#DB2777', '#FCE7F3'] },
        { id: 'teal', name: 'Cool Teal', colors: ['#14B8A6', '#0D9488', '#CCFBF1'] },
        { id: 'red', name: 'Bold Red', colors: ['#EF4444', '#DC2626', '#FEE2E2'] },
        { id: 'slate', name: 'Modern Slate', colors: ['#64748B', '#475569', '#F1F5F9'] }
    ];

    const websiteSections = [
        { id: 'hero', name: 'Hero Section', description: 'Main banner with headline and CTA' },
        { id: 'features', name: 'Features', description: 'Highlight key features or benefits' },
        { id: 'about', name: 'About Us', description: 'Company story and mission' },
        { id: 'services', name: 'Services', description: 'Products or services offered' },
        { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews and feedback' },
        { id: 'pricing', name: 'Pricing', description: 'Pricing tables or plans' },
        { id: 'team', name: 'Team', description: 'Team members or staff' },
        { id: 'gallery', name: 'Gallery', description: 'Image gallery or portfolio' },
        { id: 'contact', name: 'Contact', description: 'Contact form and information' },
        { id: 'footer', name: 'Footer', description: 'Links and copyright information' }
    ];

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSectionToggle = (sectionId) => {
        setSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedPalette = colorPalettes.find(p => p.id === colorPalette);
        onGenerate({
            logo,
            brandName,
            tagline,
            aboutText,
            layoutTemplate,
            colorPalette: selectedPalette,
            sections
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create Your Website Mockup</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="logo">Upload Logo</Label>
                        <div className="flex items-center gap-4">
                            <label
                                htmlFor="logo"
                                className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-400" />
                                )}
                            </label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    Upload your logo to include it in the mockup
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name *</Label>
                        <Input
                            id="brandName"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="Enter your brand name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            placeholder="Your business tagline or slogan"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="aboutText">About Your Business</Label>
                        <Textarea
                            id="aboutText"
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            placeholder="Describe what your business does..."
                            className="h-24"
                        />
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-3">
                        <Label>Layout Template</Label>
                        <RadioGroup value={layoutTemplate} onValueChange={setLayoutTemplate}>
                            <div className="grid gap-3">
                                {layoutTemplates.map(template => (
                                    <div key={template.id} className="flex items-start space-x-3">
                                        <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                                        <Label htmlFor={template.id} className="cursor-pointer flex-1">
                                            <div className="font-semibold">{template.name}</div>
                                            <div className="text-sm text-gray-500">{template.description}</div>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-3">
                        <Label>Color Palette</Label>
                        <div className="grid gap-3">
                            {colorPalettes.map(palette => (
                                <div
                                    key={palette.id}
                                    onClick={() => setColorPalette(palette.id)}
                                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        colorPalette === palette.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div>
                                        <div className="font-medium">{palette.name}</div>
                                        <div className="flex gap-1 mt-2">
                                            {palette.colors.map((color, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-8 h-8 rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {colorPalette === palette.id && (
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-3">
                        <Label>Website Sections to Include</Label>
                        <p className="text-sm text-gray-500">Select which sections to include in your mockup</p>
                        <div className="grid gap-3">
                            {websiteSections.map(section => (
                                <div key={section.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={section.id}
                                        checked={sections[section.id]}
                                        onCheckedChange={() => handleSectionToggle(section.id)}
                                    />
                                    <Label htmlFor={section.id} className="cursor-pointer flex-1">
                                        <div className="font-medium">{section.name}</div>
                                        <div className="text-sm text-gray-500">{section.description}</div>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isGenerating || !brandName}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Mockups...
                            </>
                        ) : (
                            'Generate Mockups'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}