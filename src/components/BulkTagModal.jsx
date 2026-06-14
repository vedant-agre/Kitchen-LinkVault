import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function BulkTagModal({ isOpen, selectedCount, onClose, onSave }) {
  const [tag, setTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTag('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tag.trim()) return;
    // Format tag: lowercase, replace spaces with hyphens, remove # if they typed it
    const formattedTag = tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/^#/, '');
    onSave(formattedTag);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 p-4">
      <div className="bg-surface-card border border-hairline w-full max-w-md shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-hairline shrink-0">
          <h2 className="text-title-md text-on-dark tracking-tight uppercase flex items-center gap-2">
            <Tag size={20} className="text-m-blue-light" />
            Tag {selectedCount} Links
          </h2>
          <button onClick={onClose} className="text-muted hover:text-on-dark transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">
          <div>
            <label className="block text-label-uppercase text-muted mb-2">Tag Name</label>
            <Input 
              value={tag} 
              onChange={e => setTag(e.target.value)} 
              placeholder="e.g. javascript"
              className="w-full bg-canvas text-body-sm"
              required
              autoFocus
            />
            <p className="text-xs text-muted mt-2">Spaces will be converted to hyphens.</p>
          </div>
        </form>

        <div className="p-4 border-t border-hairline flex justify-end gap-3 shrink-0">
          <Button type="button" onClick={onClose} className="border-hairline text-muted hover:text-on-dark bg-transparent hover:bg-transparent">
            CANCEL
          </Button>
          <Button onClick={handleSubmit} variant="primary">
            ADD TAG
          </Button>
        </div>
      </div>
    </div>
  );
}
