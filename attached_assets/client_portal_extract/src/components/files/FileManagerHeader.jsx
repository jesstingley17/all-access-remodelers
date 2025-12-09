import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileUp, FileText } from 'lucide-react';

export default function FileManagerHeader({ onUpload, onGenerate }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">File Manager</h1>
        <p className="text-slate-600 mt-1 font-medium">Organize, store, and manage all your project and client files securely.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onGenerate}>
          <FileText className="w-4 h-4 mr-2" />
          Generate from Template
        </Button>
        <Button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700">
          <FileUp className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>
    </div>
  );
}