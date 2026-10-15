import React from 'react';

export interface PageHeadingProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  description,
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200/60 mb-6 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
