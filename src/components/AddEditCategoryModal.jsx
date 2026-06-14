import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CATEGORY_COLORS } from '../lib/constants';

export function AddEditCategoryModal({ isOpen, mode, category, initialIsDeleting, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7e7e7e');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setName(category.name || '');
        setColor(category.color || '#7e7e7e');
      } else {
        setName('');
        setColor('#7e7e7e');
      }
      setIsDeleting(initialIsDeleting || false);
    }
  }, [isOpen, mode, category, initialIsDeleting]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
  };

  const handleClose = () => {
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 p-4">
      <div className="bg-surface-card border border-hairline w-full max-w-md shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-hairline shrink-0">
          <h2 className="text-title-md text-on-dark tracking-tight uppercase">
            {isDeleting ? 'Delete Category' : (mode === 'edit' ? 'Edit Category' : 'Add Category')}
          </h2>
          <button onClick={handleClose} className="text-muted hover:text-on-dark transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {isDeleting ? (
          <>
            <div className="p-6">
              <p className="text-body-sm text-on-dark mb-4">
                Are you sure you want to delete the category <strong className="text-white">"{category?.name}"</strong>?
              </p>
              <p className="text-body-sm text-muted">
                All links in this category will be moved to <strong>Unsorted</strong>.
              </p>
            </div>
            <div className="p-4 border-t border-hairline flex justify-end gap-3 shrink-0 bg-surface-card">
              <Button type="button" onClick={() => setIsDeleting(false)} className="border-hairline text-muted hover:text-on-dark bg-transparent hover:bg-transparent">
                CANCEL
              </Button>
              <Button onClick={() => onDelete(category)} className="!bg-[#e22718] hover:!bg-[#c22114] !text-white !border-[#e22718]">
                DELETE CATEGORY
              </Button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-6">
              <div>
                <label className="block text-label-uppercase text-muted mb-2">Category Name</label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-canvas text-body-sm"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-label-uppercase text-muted mb-2">Category Color</label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {CATEGORY_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-6 h-6 cursor-pointer transition-all box-border"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? '2px solid white' : '1px solid transparent',
                        outlineOffset: '-2px',
                        borderRadius: '0'
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-hairline flex items-center justify-between shrink-0">
              {mode === 'edit' && category && category.name?.toLowerCase() !== 'unsorted' ? (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="text-label-uppercase text-[#e22718] hover:text-[#c22114] transition-colors flex items-center gap-2 font-bold text-xs tracking-widest"
                >
                  <Trash2 size={16} /> DELETE
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button type="button" onClick={handleClose} className="border-hairline text-muted hover:text-on-dark bg-transparent hover:bg-transparent">
                  CANCEL
                </Button>
                <Button onClick={handleSubmit} variant="primary">
                  SAVE
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
