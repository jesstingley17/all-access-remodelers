import React, { useState } from 'react';
import { ClientNote } from '@/api/entities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, StickyNote, Star } from "lucide-react";
import { format } from 'date-fns';

export default function NotesSection({ clientId, notes, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', is_important: false });

  const handleAdd = async () => {
    if (!newNote.content.trim()) return;
    
    try {
      await ClientNote.create({
        client_id: clientId,
        content: newNote.content,
        is_important: newNote.is_important
      });
      setNewNote({ content: '', is_important: false });
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Notes ({notes.length})
        </h3>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
          <Textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newNote.is_important}
                onCheckedChange={(checked) => setNewNote({ ...newNote, is_important: checked })}
              />
              <label className="text-sm text-slate-600">Mark as important</label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map(note => (
            <div key={note.id} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <p className="text-slate-900 flex-1">{note.content}</p>
                {note.is_important && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {format(new Date(note.created_date), 'PPP')}
              </p>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">No notes yet</p>
        )}
      </div>
    </Card>
  );
}