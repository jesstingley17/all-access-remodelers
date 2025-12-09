import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function TemplateEditorModal({ template, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    category: template?.category || 'other',
    content: template?.content || '',
    placeholders: template?.placeholders || []
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPlaceholder = () => {
    setFormData({
      ...formData,
      placeholders: [...formData.placeholders, { 
        key: '', 
        label: '', 
        type: 'text', 
        required: false,
        dataSource: '',
        condition: ''
      }]
    });
  };

  const handleUpdatePlaceholder = (index, field, value) => {
    const updated = [...formData.placeholders];
    updated[index][field] = value;
    setFormData({ ...formData, placeholders: updated });
  };

  const handleRemovePlaceholder = (index) => {
    const updated = formData.placeholders.filter((_, i) => i !== index);
    setFormData({ ...formData, placeholders: updated });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in name and content');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...formData,
        is_custom: true,
        is_public: false
      };

      if (template?.id) {
        await base44.entities.DocumentTemplate.update(template.id, data);
      } else {
        await base44.entities.DocumentTemplate.create(data);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
    setIsSaving(false);
  };

  const insertPlaceholder = (key, type) => {
    let syntax = `{{${key}}}`;
    
    if (type === 'table') {
      syntax = `{{table:${key}}}`;
    } else if (type === 'conditional') {
      syntax = `{{#if ${key}}}\nContent when true\n{{/if}}`;
    }
    
    setFormData({
      ...formData,
      content: formData.content + syntax
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Project Report"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="meeting_minutes">Meeting Minutes</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Template Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              placeholder="Write your template content here. Use {{placeholder_name}} for dynamic values."
              className="font-mono text-sm"
            />
            <div className="text-xs text-slate-500 mt-2 space-y-1 bg-slate-50 p-3 rounded">
              <p className="font-semibold">Placeholder Syntax:</p>
              <p>• Simple: {`{{client_name}}`}</p>
              <p>• Table: {`{{table:project_tasks}}`}</p>
              <p>• Conditional: {`{{#if budget > 10000}} Premium client {{/if}}`}</p>
              <p>• If/Else: {`{{#if status == "active"}} Active {{else}} Inactive {{/if}}`}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Advanced Placeholders</Label>
              <Button size="sm" variant="outline" onClick={handleAddPlaceholder}>
                <Plus className="w-4 h-4 mr-1" />
                Add Placeholder
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.placeholders.map((placeholder, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-3 items-end">
                        <div>
                          <Label className="text-xs">Key</Label>
                          <Input
                            value={placeholder.key}
                            onChange={(e) => handleUpdatePlaceholder(index, 'key', e.target.value)}
                            placeholder="client_name"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={placeholder.label}
                            onChange={(e) => handleUpdatePlaceholder(index, 'label', e.target.value)}
                            placeholder="Client Name"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select 
                            value={placeholder.type} 
                            onValueChange={(val) => handleUpdatePlaceholder(index, 'type', val)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="table">Table</SelectItem>
                              <SelectItem value="conditional">Conditional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={placeholder.required}
                            onChange={(e) => handleUpdatePlaceholder(index, 'required', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => insertPlaceholder(placeholder.key, placeholder.type)}
                            disabled={!placeholder.key}
                          >
                            Insert
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePlaceholder(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {placeholder.type === 'table' && (
                        <div>
                          <Label className="text-xs">Table Data Source</Label>
                          <Select 
                            value={placeholder.dataSource || ''} 
                            onValueChange={(val) => handleUpdatePlaceholder(index, 'dataSource', val)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select data source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="project_tasks">Project Tasks</SelectItem>
                              <SelectItem value="time_entries">Time Entries</SelectItem>
                              <SelectItem value="project_expenses">Project Expenses</SelectItem>
                              <SelectItem value="deliverables">Deliverables</SelectItem>
                              <SelectItem value="team_members">Team Members</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-slate-500 mt-1">
                            Generates a table from {placeholder.dataSource ? placeholder.dataSource.replace('_', ' ') : 'selected data'}
                          </p>
                        </div>
                      )}

                      {placeholder.type === 'conditional' && (
                        <div>
                          <Label className="text-xs">Condition Expression</Label>
                          <Input
                            value={placeholder.condition || ''}
                            onChange={(e) => handleUpdatePlaceholder(index, 'condition', e.target.value)}
                            placeholder="e.g., budget > 10000"
                            className="text-sm"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Use syntax: {`{{#if condition}} text {{/if}}`} or {`{{#if condition}} text {{else}} other {{/if}}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}