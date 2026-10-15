import React from 'react';

export interface BadgeProps {
  variant?: 'green' | 'amber' | 'blue' | 'lavender' | 'stone';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'green',
  children,
  className = '',
  dot = false,
}) => {
  const styles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    blue: 'bg-sky-50 text-sky-800 border-sky-200/80',
    lavender: 'bg-purple-50 text-purple-800 border-purple-200/80',
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const dotStyles = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-sky-500',
    lavender: 'bg-purple-500',
    stone: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};
