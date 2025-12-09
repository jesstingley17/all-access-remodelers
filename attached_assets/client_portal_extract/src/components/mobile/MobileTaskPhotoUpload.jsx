import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, X, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MobileTaskPhotoUpload({ task, onUploadComplete }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const handleFileSelect = async (event, type) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);

            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            const location = await captureLocation();
            
            const photo = {
                url: file_url,
                type: type,
                uploaded_at: new Date().toISOString(),
                location: location,
                file_name: file.name
            };

            setUploadedPhotos(prev => [...prev, photo]);
            
            const currentPhotos = task.photos || [];
            await base44.entities.ConstructionTask.update(task.id, {
                photos: [...currentPhotos, file_url]
            });

            setPreviewUrl(null);
            if (onUploadComplete) {
                onUploadComplete(photo);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        setIsUploading(false);
    };

    const captureLocation = () => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    () => resolve(null)
                );
            } else {
                resolve(null);
            }
        });
    };

    const openCamera = () => {
        fileInputRef.current?.click();
    };

    const openVideoCamera = () => {
        videoInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Task Documentation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e, 'photo')}
                    className="hidden"
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={(e) => handleFileSelect(e, 'video')}
                    className="hidden"
                />

                {task && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="font-medium text-sm text-blue-900">{task.title}</div>
                        <div className="text-xs text-blue-700 mt-1">
                            {task.description || 'No description'}
                        </div>
                    </div>
                )}

                {previewUrl && (
                    <div className="relative">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        onClick={openCamera}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Camera className="w-4 h-4 mr-2" />
                        )}
                        Photo
                    </Button>
                    <Button 
                        onClick={openVideoCamera}
                        disabled={isUploading}
                        variant="outline"
                        className="w-full"
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Camera className="w-4 h-4 mr-2" />
                        )}
                        Video
                    </Button>
                </div>

                {uploadedPhotos.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">
                            Uploaded ({uploadedPhotos.length})
                        </div>
                        {uploadedPhotos.map((photo, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <div className="flex-1 text-sm">
                                    <div className="font-medium text-green-900">{photo.type}</div>
                                    <div className="text-xs text-green-700">
                                        {new Date(photo.uploaded_at).toLocaleTimeString()}
                                        {photo.location && ' • Location tagged'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}