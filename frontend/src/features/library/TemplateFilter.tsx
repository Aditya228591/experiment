import React from 'react';
import { TemplateCategory } from '../../types';

export interface TemplateFilterProps {
  selectedCategory: TemplateCategory;
  onSelectCategory: (category: TemplateCategory) => void;
  counts: Record<TemplateCategory, number>;
}

export const TemplateFilter: React.FC<TemplateFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'all', label: 'All templates' },
    { id: 'communication', label: 'Communication' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'planning', label: 'Planning' },
    { id: 'student support', label: 'Student support' },
  ];

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6"
      role="tablist"
      aria-label="Filter templates by category"
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = counts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 ${
              isSelected
                ? 'bg-forest-800 text-white shadow-2xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-300'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                isSelected ? 'bg-forest-900 text-forest-200' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
