import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { updateLink } from '../lib/db';

export function EditLinkModal({ link, categories, user, onClose, onSaveSuccess }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setNote(link.note || '');
      setCategoryId(link.categoryId || '');
      setUrl(link.url || '');
    }
  }, [link]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      await updateLink(user.uid, link.id, {
        title,
        note,
        categoryId,
        url
      });
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update link.");
    } finally {
      setLoading(false);
    }
  };

  if (!link) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 p-4">
      <div className="bg-surface-card border border-hairline w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-hairline shrink-0">
          <h2 className="text-title-md text-on-dark tracking-tight">EDIT LINK</h2>
          <button onClick={onClose} className="text-muted hover:text-on-dark transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-label-uppercase text-muted mb-2">URL</label>
            <Input 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              className="w-full bg-canvas text-body-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-label-uppercase text-muted mb-2">Title</label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-canvas text-body-sm"
            />
          </div>

          <div>
            <label className="block text-label-uppercase text-muted mb-2">Note / Description</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              className="w-full h-24 bg-canvas border border-hairline focus:border-on-dark text-on-dark p-3 text-body-sm focus:outline-none resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-label-uppercase text-muted mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 bg-canvas border border-hairline text-body-sm text-on-dark focus:outline-none focus:border-m-blue-light rounded-none uppercase tracking-widest appearance-none"
            >
              <option value="" disabled>Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `└ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="p-4 border-t border-hairline flex justify-end gap-3 shrink-0">
          <Button type="button" onClick={onClose} className="border-hairline text-muted hover:text-on-dark bg-transparent hover:bg-transparent">
            CANCEL
          </Button>
          <Button onClick={handleSubmit} variant="primary" disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </div>
    </div>
  );
}
