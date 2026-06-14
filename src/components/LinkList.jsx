import React from 'react';
import { LinkCard } from './ui/LinkCard';

export function LinkList({ links, viewMode, selectedLinks = [], onToggleSelect, onEdit, onDelete, onStatusToggle, onClickLink }) {
  if (!links || links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-display-sm text-on-dark mb-4">NO LINKS FOUND</h3>
        <p className="text-body-md text-muted max-w-md">
          This category is empty or no links match your search. Paste a URL above to add something new.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
        {links.map(link => (
          <LinkCard 
            key={link.id} 
            link={link} 
            viewMode="grid" 
            isSelected={selectedLinks.includes(link.id)}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit} 
            onDelete={onDelete} 
            onStatusToggle={onStatusToggle}
            onClickLink={onClickLink}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-hairline pb-24">
      {links.map(link => (
        <LinkCard 
          key={link.id} 
          link={link} 
          viewMode="list" 
          isSelected={selectedLinks.includes(link.id)}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit} 
          onDelete={onDelete} 
          onStatusToggle={onStatusToggle}
          onClickLink={onClickLink}
        />
      ))}
    </div>
  );
}
