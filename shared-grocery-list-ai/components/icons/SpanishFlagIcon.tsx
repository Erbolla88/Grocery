
import React from 'react';

export const SpanishFlagIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 5C0 2.23858 2.23858 0 5 0H31C33.7614 0 36 2.23858 36 5V31C36 33.7614 33.7614 36 31 36H5C2.23858 36 0 33.7614 0 31V5Z" fill="#FFDA44"/>
      <path d="M0 9H36V0H0V9Z" fill="#D80027"/>
      <path d="M0 36H36V27H0V36Z" fill="#D80027"/>
  </svg>
);
