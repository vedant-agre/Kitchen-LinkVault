import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const baseStyles = "text-button px-8 h-12 flex items-center justify-center transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-on-dark focus:ring-offset-1 focus:ring-offset-canvas";
  
  const variants = {
    primary: "bg-canvas text-on-dark border border-hairline hover:border-on-dark hover:bg-surface-card",
    outline: "bg-transparent text-on-dark border border-on-dark hover:bg-on-dark hover:text-canvas",
    icon: "bg-surface-card text-on-dark rounded-full w-12 h-12 p-0 flex items-center justify-center hover:bg-surface-elevated border border-hairline",
    text: "bg-transparent text-on-dark hover:text-body-strong px-0 h-auto"
  };

  const roundedClass = variant === 'icon' ? 'rounded-full' : 'rounded-none';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${roundedClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
