import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { History, ExternalLink, FileText } from 'lucide-react';

export default function DocumentVersionHistory({ document, onClose }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      // Get all versions of this document (including current)
      const parentId = document.parent_document_id || document.id;
      const allDocs = await base44.entities.ClientDocument.filter({
        created_by: document.created_by
      });
      
      const documentVersions = allDocs.filter(doc => 
        doc.id === parentId || doc.parent_document_id === parentId
      ).sort((a, b) => b.version - a.version);

      setVersions(documentVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      final: 'bg-green-100 text-green-800',
      archived: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History: {document.document_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <p className="text-center text-slate-600">Loading versions...</p>
          ) : versions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No version history available</p>
              </CardContent>
            </Card>
          ) : (
            versions.map((version, index) => (
              <Card key={version.id} className={index === 0 ? 'border-blue-200 bg-blue-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          Version {version.version}
                        </h3>
                        {index === 0 && (
                          <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                        )}
                        <Badge className={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-2">
                        Created: {new Date(version.created_date).toLocaleString()}
                      </p>
                      
                      {version.version_notes && (
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded mt-2">
                          {version.version_notes}
                        </p>
                      )}

                      {version.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {version.description}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(version.file_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}