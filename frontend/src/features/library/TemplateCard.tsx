import React from 'react';
import { TemplateItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Mail,
  GraduationCap,
  ClockAlert,
  BookOpen,
  LineChart,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface TemplateCardProps {
  template: TemplateItem;
  onUseTemplate: (template: TemplateItem) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUseTemplate,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return <Mail className="w-5 h-5 text-forest-700" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-700" />;
      case 'ClockAlert':
        return <ClockAlert className="w-5 h-5 text-amber-700" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-emerald-700" />;
      case 'LineChart':
        return <LineChart className="w-5 h-5 text-sky-700" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-forest-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-forest-700" />;
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'communication':
        return 'green' as const;
      case 'assessment':
        return 'lavender' as const;
      case 'planning':
        return 'blue' as const;
      case 'student support':
      case 'support':
        return 'amber' as const;
      default:
        return 'stone' as const;
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full hoverable border-stone-200/80 p-5 sm:p-6 transition-all duration-200">
      <div className="space-y-3.5">
        {/* Header: Icon & Category */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-forest-50/80 border border-forest-200/60 flex items-center justify-center shrink-0 shadow-2xs">
            {getIcon(template.iconName)}
          </div>
          <Badge variant={getCategoryBadgeVariant(template.category)}>
            {template.categoryLabel}
          </Badge>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-semibold text-stone-900 tracking-tight mb-1.5">
            {template.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {template.shortExplanation}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-400 font-medium">3 automated steps</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onUseTemplate(template)}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          iconPosition="right"
          className="hover:border-forest-600 hover:text-forest-900"
        >
          Use this template
        </Button>
      </div>
    </Card>
  );
};
