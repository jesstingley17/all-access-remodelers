import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronLeft, 
    ChevronRight, 
    Grid, 
    Maximize2,
    Download,
    MessageSquare,
    X
} from 'lucide-react';
import AnnotationTool from './AnnotationTool';

export default function MockupViewer({ mockups, viewMode, onViewModeChange }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAnnotation, setShowAnnotation] = useState(false);
    const [annotations, setAnnotations] = useState({});

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : mockups.length - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < mockups.length - 1 ? prev + 1 : 0));
    };

    const handleAnnotationSave = (index, annotationData) => {
        setAnnotations(prev => ({
            ...prev,
            [index]: annotationData
        }));
    };

    if (viewMode === 'carousel') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Your Website Mockups</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewModeChange('gallery')}
                        >
                            <Grid className="w-4 h-4 mr-2" />
                            Gallery View
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="text-sm">
                                            {mockups[selectedIndex].device}
                                        </Badge>
                                        <Badge variant="outline" className="text-sm">
                                            {mockups[selectedIndex].style}
                                        </Badge>
                                        {mockups[selectedIndex].palette && (
                                            <Badge className="text-sm bg-purple-100 text-purple-800">
                                                {mockups[selectedIndex].palette}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setShowAnnotation(!showAnnotation)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            {showAnnotation ? 'Hide' : 'Add'} Feedback
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setIsFullscreen(true)}
                                        >
                                            <Maximize2 className="w-4 h-4 mr-2" />
                                            Full View
                                        </Button>
                                    </div>
                                </div>

                                {showAnnotation ? (
                                    <AnnotationTool
                                        mockup={mockups[selectedIndex]}
                                        existingAnnotation={annotations[selectedIndex]}
                                        onSave={(data) => handleAnnotationSave(selectedIndex, data)}
                                        onClose={() => setShowAnnotation(false)}
                                    />
                                ) : (
                                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                                        <img
                                            src={mockups[selectedIndex].url}
                                            alt={`Mockup ${selectedIndex + 1}`}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handlePrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6 text-gray-700" />
                                </button>
                            </div>

                            <div className="p-4 bg-white border-t">
                                <div className="flex items-center justify-center gap-2">
                                    {mockups.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`h-2 rounded-full transition-all ${
                                                index === selectedIndex 
                                                    ? 'w-8 bg-blue-600' 
                                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-2">
                                    {selectedIndex + 1} of {mockups.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {mockups.map((mockup, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                                    index === selectedIndex 
                                        ? 'border-blue-600 shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                <img
                                    src={mockup.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-auto"
                                />
                                {annotations[index] && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-orange-500">
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            Annotated
                                        </Badge>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {isFullscreen && (
                    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={mockups[selectedIndex].url}
                            alt="Full size mockup"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                )}
            </div>
        );
    }

    return null;
}