import React from 'react';
import { WorkflowStep } from '../../types';
import { Clock, Sparkles, Send, ArrowDown } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export interface WorkflowStepCardProps {
  step: WorkflowStep;
  index: number;
  isLast: boolean;
}

export const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({
  step,
  index,
  isLast,
}) => {
  const stepConfigs = {
    trigger: {
      label: 'Trigger',
      badgeVariant: 'blue' as const,
      icon: <Clock className="w-4 h-4 text-sky-700" />,
      bgIcon: 'bg-sky-50 border-sky-200/80',
    },
    ai_action: {
      label: 'AI Action',
      badgeVariant: 'lavender' as const,
      icon: <Sparkles className="w-4 h-4 text-purple-700" />,
      bgIcon: 'bg-purple-50 border-purple-200/80',
    },
    action: {
      label: 'Action',
      badgeVariant: 'green' as const,
      icon: <Send className="w-4 h-4 text-emerald-700" />,
      bgIcon: 'bg-emerald-50 border-emerald-200/80',
    },
  };

  const currentConfig = stepConfigs[step.type] || stepConfigs.action;

  return (
    <div className="relative">
      <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-stone-300 transition-colors">
        {/* Step Number & Icon */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentConfig.bgIcon} shrink-0 shadow-2xs`}
          >
            {currentConfig.icon}
          </div>
          <span className="text-[10px] font-bold text-stone-400 mt-1.5 uppercase tracking-wider">
            Step {index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={currentConfig.badgeVariant} dot>
              {currentConfig.label}
            </Badge>
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-stone-900 tracking-tight">
            {step.title}
          </h4>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* Visual Connector to Next Step */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-forest-50 border border-forest-200/70 text-forest-700 shadow-2xs">
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
};
