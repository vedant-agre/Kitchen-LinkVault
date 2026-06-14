import React from 'react';

export function CategoryTab({ 
  category, 
  isActive, 
  onClick 
}) {
  return (
    <button
      onClick={() => onClick(category)}
      className={`text-label-uppercase py-3 flex items-center justify-between w-full text-left transition-colors duration-200 cursor-pointer rounded-none outline-none relative group ${
        isActive ? 'text-on-dark' : 'text-body hover:text-body-strong'
      }`}
    >
      <div className="flex items-center gap-3">
        {category.color && (
          <span 
            className="w-2 h-2 rounded-none" 
            style={{ backgroundColor: category.color }} 
          />
        )}
        <span className="truncate">{category.name}</span>
      </div>
      
      {/* Active Indicator (M-Stripe or white bar) */}
      {isActive && (
        <div className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red" />
      )}
    </button>
  );
}
