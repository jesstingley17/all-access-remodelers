import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Download, Search, Calendar, File } from 'lucide-react';

export default function DocumentViewer({ documents, projects }) {
    const [searchQuery, setSearchQuery] = useState('');

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project?.title || 'Unknown Project';
    };

    const filteredDocuments = documents.filter(doc =>
        doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectName(doc.project_id).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDocumentTypeColor = (type) => {
        const colors = {
            contract: 'bg-blue-100 text-blue-800',
            proposal: 'bg-purple-100 text-purple-800',
            other: 'bg-slate-100 text-slate-800'
        };
        return colors[type] || colors.other;
    };

    const handleDownload = (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (documents.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No documents available yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <File className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 mb-1">{doc.document_name}</h3>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                            <span>{getProjectName(doc.project_id)}</span>
                                            <Badge className={getDocumentTypeColor(doc.document_type)}>
                                                {doc.document_type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>Uploaded {new Date(doc.created_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleDownload(doc.file_url, doc.document_name)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredDocuments.length === 0 && searchQuery && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-slate-500">No documents match your search</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}