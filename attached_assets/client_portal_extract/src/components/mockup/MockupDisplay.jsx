import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Grid, Maximize2 } from 'lucide-react';
import MockupViewer from './MockupViewer';

export default function MockupDisplay({ mockups }) {
    const [viewMode, setViewMode] = useState('gallery'); // gallery or carousel

    const handleDownload = (url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `website-mockup-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!mockups || mockups.length === 0) {
        return null;
    }

    if (viewMode === 'carousel') {
        return (
            <MockupViewer 
                mockups={mockups} 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Website Mockups</h2>
                    <p className="text-gray-600">
                        High-resolution previews of how your website could look
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setViewMode('carousel')}
                >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Carousel View
                </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {mockups.map((mockup, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    {mockup.style}
                                </CardTitle>
                                <Badge variant="secondary">{mockup.device}</Badge>
                            </div>
                            {mockup.palette && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {mockup.palette} palette
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative group">
                                <img
                                    src={mockup.url}
                                    alt={`${mockup.style} mockup`}
                                    className="w-full h-auto cursor-pointer"
                                    onClick={() => setViewMode('carousel')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(mockup.url, index);
                                            }}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}