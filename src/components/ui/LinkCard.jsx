import React from 'react';
import { ExternalLink, Trash2, Edit2, Bookmark, CheckSquare, Square, CheckCircle, Circle } from 'lucide-react';

export function LinkCard({ link, viewMode = 'grid', isSelected, onToggleSelect, onEdit, onDelete, onStatusToggle, onClickLink }) {
  const isGrid = viewMode === 'grid';
  
  const handleLinkClick = (e) => {
    e.preventDefault();
    onClickLink(link);
  };

  const getStatusIcon = () => {
    if (link.status === 'read') return <CheckCircle size={16} className="text-success" />;
    if (link.status === 'to-revisit') return <Circle size={16} className="text-warning" />;
    return <Bookmark size={16} className="text-muted" />;
  };

  if (!isGrid) {
    return (
      <div className={`flex items-center gap-4 py-4 border-b border-hairline group transition-colors cursor-default ${isSelected ? 'bg-surface-elevated' : 'hover:bg-surface-elevated'}`}>
        <button onClick={() => onToggleSelect(link.id)} className="text-muted hover:text-on-dark transition-colors pl-2">
          {isSelected ? <CheckSquare size={18} className="text-m-blue-light" /> : <Square size={18} />}
        </button>
        
        {link.favicon ? (
          <img src={link.favicon} alt="" className="w-6 h-6 rounded-none object-contain" />
        ) : (
          <div className="w-6 h-6 flex items-center justify-center bg-surface-card text-muted">
            <Bookmark size={14} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <a href={link.url} onClick={handleLinkClick} className="block text-body-md text-on-dark truncate hover:text-body-strong transition-colors">
            {link.title || link.url}
          </a>
          <div className="text-caption text-muted truncate mt-1 flex items-center gap-2">
            <span>{new URL(link.url).hostname}</span>
            {link.source && <span className="px-1 border border-hairline text-[10px] uppercase">{link.source}</span>}
            {link.tags?.length > 0 && `• ${link.tags.join(', ')}`}
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pr-2">
          <button onClick={() => onStatusToggle(link)} className="p-2 text-muted hover:text-on-dark transition-colors" title="Toggle Status">
            {getStatusIcon()}
          </button>
          <button onClick={() => onEdit(link)} className="p-2 text-muted hover:text-on-dark transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(link)} className="p-2 text-muted hover:text-m-red transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`flex flex-col h-full rounded-none group transition-colors border overflow-hidden relative ${isSelected ? 'bg-surface-elevated border-m-blue-light' : 'bg-surface-card border-hairline hover:bg-surface-elevated'}`}>
      <button 
        onClick={() => onToggleSelect(link.id)} 
        className="absolute top-2 left-2 z-10 text-muted hover:text-on-dark transition-colors bg-canvas/80 p-1"
      >
        {isSelected ? <CheckSquare size={20} className="text-m-blue-light" /> : <Square size={20} />}
      </button>

      {link.previewImage ? (
        <a href={link.url} onClick={handleLinkClick} className="block w-full h-40 overflow-hidden shrink-0 relative border-b border-hairline bg-canvas">
          <img 
            src={link.previewImage} 
            alt={link.title} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${link.status === 'read' ? 'opacity-50 grayscale' : ''}`}
            loading="lazy"
          />
        </a>
      ) : (
        <a href={link.url} onClick={handleLinkClick} className="block w-full h-40 bg-surface-elevated shrink-0 flex items-center justify-center border-b border-hairline">
           {link.favicon ? (
             <img src={link.favicon} alt="" className="w-16 h-16 object-contain opacity-50" />
           ) : (
             <Bookmark className="w-12 h-12 text-muted" />
           )}
        </a>
      )}
      
      <div className="p-lg flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-2">
          {link.favicon && (
            <img src={link.favicon} alt="" className="w-4 h-4 mt-1 object-contain shrink-0" />
          )}
          <a href={link.url} onClick={handleLinkClick} className="text-title-md text-on-dark line-clamp-2 hover:text-body-strong transition-colors flex-1">
            {link.title || link.url}
          </a>
        </div>
        
        {link.note && (
          <p className="text-body-sm text-body line-clamp-3 mb-4 flex-1">
            {link.note}
          </p>
        )}
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-hairline-strong">
          <div className="text-caption text-muted truncate max-w-[50%] flex items-center gap-2">
            <span>{new URL(link.url).hostname}</span>
            {link.source && <span className="px-1 border border-hairline text-[10px] uppercase hidden sm:inline-block">{link.source}</span>}
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={() => onStatusToggle(link)} className="p-2 text-muted hover:text-on-dark transition-colors" title="Toggle Status">
              {getStatusIcon()}
            </button>
            <button onClick={() => onEdit(link)} className="p-2 text-muted hover:text-on-dark transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(link)} className="p-2 text-muted hover:text-m-red transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
