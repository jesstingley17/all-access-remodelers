import React from 'react';
import { FileText } from 'lucide-react';
import TemplateManager from '../components/files/TemplateManager';

export default function TemplateLibrary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Template Library
            </h1>
            <p className="text-slate-600 mt-1">
              Create and manage document templates with advanced placeholders
            </p>
          </div>
        </div>

        <TemplateManager />
      </div>
    </div>
  );
}