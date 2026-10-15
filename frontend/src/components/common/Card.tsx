import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:border-stone-300 hover:shadow-hover hover:-translate-y-0.5 cursor-pointer'
    : 'shadow-card';

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/80 ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
