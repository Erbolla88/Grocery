
import React from 'react';

// The className prop is added to allow for flexible sizing of the icon
// in different parts of the application.
interface IconProps {
  className?: string;
}

export const PlusIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
