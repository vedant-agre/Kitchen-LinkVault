import React, { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`bg-surface-card text-on-dark text-body-md rounded-none px-4 h-12 border border-hairline focus:outline-none focus:border-on-dark transition-colors duration-200 placeholder:text-muted ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';
