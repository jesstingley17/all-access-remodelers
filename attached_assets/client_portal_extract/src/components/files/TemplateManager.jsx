import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';
import TemplateEditorModal from './TemplateEditorModal';

export default function TemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.DocumentTemplate.list();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await base44.entities.DocumentTemplate.delete(id);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicate = async (template) => {
    try {
      const { id, created_date, updated_date, created_by, ...templateData } = template;
      await base44.entities.DocumentTemplate.create({
        ...templateData,
        name: `${template.name} (Copy)`
      });
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      proposal: 'bg-purple-100 text-purple-800',
      invoice: 'bg-green-100 text-green-800',
      report: 'bg-orange-100 text-orange-800',
      meeting_minutes: 'bg-yellow-100 text-yellow-800',
      brief: 'bg-pink-100 text-pink-800',
      nda: 'bg-red-100 text-red-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return <p className="text-center text-slate-600">Loading templates...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Template Manager</h2>
          <p className="text-slate-600 mt-1">Create and manage custom document templates</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={`mt-2 ${getCategoryColor(template.category)}`}>
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {template.content.substring(0, 100)}...
              </p>
              
              {template.placeholders?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">
                    {template.placeholders.length} placeholder{template.placeholders.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => { setEditingTemplate(template); setShowEditor(true); }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No templates yet</h3>
            <p className="text-slate-500 mb-6">Create your first custom document template</p>
            <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {showEditor && (
        <TemplateEditorModal
          template={editingTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
          onSave={loadTemplates}
        />
      )}
    </div>
  );
}