import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Download, 
    Trash2, 
    MessageSquare, 
    PenTool,
    Type,
    Circle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AnnotationTool({ mockup, existingAnnotation, onSave, onClose }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [annotations, setAnnotations] = useState(existingAnnotation?.annotations || []);
    const [tool, setTool] = useState('comment'); // comment, draw, text
    const [currentComment, setCurrentComment] = useState('');
    const [currentText, setCurrentText] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const imageRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = mockup.url;
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            imageRef.current = img;
            
            // Redraw existing annotations
            annotations.forEach(annotation => {
                drawAnnotation(ctx, annotation);
            });
            
            setImageLoaded(true);
        };
    }, [mockup.url]);

    const drawAnnotation = (ctx, annotation) => {
        if (annotation.type === 'comment') {
            // Draw comment pin
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(annotation.x, annotation.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (annotation.type === 'draw') {
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(annotation.startX, annotation.startY);
            ctx.lineTo(annotation.endX, annotation.endY);
            ctx.stroke();
        } else if (annotation.type === 'text') {
            ctx.font = '16px Arial';
            ctx.fillStyle = '#1E40AF';
            ctx.fillText(annotation.text, annotation.x, annotation.y);
        }
    };

    const handleCanvasClick = (e) => {
        if (!imageLoaded) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (tool === 'comment' && currentComment.trim()) {
            const newAnnotation = {
                type: 'comment',
                x,
                y,
                text: currentComment
            };
            
            const ctx = canvas.getContext('2d');
            drawAnnotation(ctx, newAnnotation);
            
            setAnnotations([...annotations, newAnnotation]);
            setCurrentComment('');
        } else if (tool === 'text' && currentText.trim()) {
            const newAnnotation = {
                type: 'text',
                x,
                y,
                text: currentText
            };
            
            const ctx = canvas.getContext('2d');
            drawAnnotation(ctx, newAnnotation);
            
            setAnnotations([...annotations, newAnnotation]);
            setCurrentText('');
        }
    };

    const handleMouseDown = (e) => {
        if (tool !== 'draw' || !imageLoaded) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        canvasRef.current.drawStart = { x, y };
    };

    const handleMouseUp = (e) => {
        if (!isDrawing || tool !== 'draw') return;
        setIsDrawing(false);
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const newAnnotation = {
            type: 'draw',
            startX: canvas.drawStart.x,
            startY: canvas.drawStart.y,
            endX: x,
            endY: y
        };
        
        setAnnotations([...annotations, newAnnotation]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || tool !== 'draw') return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const ctx = canvas.getContext('2d');
        
        // Redraw image and all annotations
        ctx.drawImage(imageRef.current, 0, 0);
        annotations.forEach(annotation => {
            drawAnnotation(ctx, annotation);
        });
        
        // Draw current line
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(canvas.drawStart.x, canvas.drawStart.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageRef.current, 0, 0);
        setAnnotations([]);
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `annotated-mockup-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            onSave({ annotations, exportUrl: dataUrl });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Add Feedback & Annotations</span>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={tool === 'comment' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTool('comment')}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Comment Pin
                        </Button>
                        <Button
                            variant={tool === 'draw' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTool('draw')}
                        >
                            <PenTool className="w-4 h-4 mr-2" />
                            Draw
                        </Button>
                        <Button
                            variant={tool === 'text' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTool('text')}
                        >
                            <Type className="w-4 h-4 mr-2" />
                            Text
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            disabled={exportLoading || annotations.length === 0}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {exportLoading ? 'Exporting...' : 'Export'}
                        </Button>
                    </div>

                    {tool === 'comment' && (
                        <div className="space-y-2">
                            <Label>Comment (click on image to place)</Label>
                            <Textarea
                                value={currentComment}
                                onChange={(e) => setCurrentComment(e.target.value)}
                                placeholder="Enter your feedback comment..."
                                className="h-20"
                            />
                        </div>
                    )}

                    {tool === 'text' && (
                        <div className="space-y-2">
                            <Label>Text Label (click on image to place)</Label>
                            <Input
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                placeholder="Enter text to add to mockup..."
                            />
                        </div>
                    )}

                    {tool === 'draw' && (
                        <p className="text-sm text-gray-600">
                            Click and drag on the image to draw arrows or circles
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="w-full h-auto cursor-crosshair"
                    style={{ maxWidth: '100%' }}
                />
            </div>

            {annotations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Annotations ({annotations.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {annotations.map((annotation, index) => (
                                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-medium">{annotation.type}:</span>{' '}
                                    {annotation.text || 'Drawing'}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}