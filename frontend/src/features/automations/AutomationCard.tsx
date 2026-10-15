import React from 'react';
import { AutomationItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Mail,
  Clock,
  ClockAlert,
  GraduationCap,
  Play,
  Pause,
  Edit3,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';

export interface AutomationCardProps {
  automation: AutomationItem;
  onOpenDetails: (automation: AutomationItem) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (automation: AutomationItem) => void;
}

export const AutomationCard: React.FC<AutomationCardProps> = ({
  automation,
  onOpenDetails,
  onToggleStatus,
  onEdit,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Mail':
        return <Mail className="w-5 h-5 text-forest-700" />;
      case 'ClockAlert':
        return <ClockAlert className="w-5 h-5 text-amber-700" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-forest-700" />;
    }
  };

  const getStatusBadge = (status: AutomationItem['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="green" dot>
            Active
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="amber" dot>
            Draft
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="stone" dot>
            Paused
          </Badge>
        );
    }
  };

  const isPaused = automation.status === 'paused';
  const isDraft = automation.status === 'draft';
  const integration = automation.integration;

  return (
    <Card className="hoverable transition-all border-stone-200/80 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info: Icon, Name, Trigger, Last Run */}
        <div
          className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpenDetails(automation)}
        >
          <div className="w-11 h-11 rounded-xl bg-forest-50/80 border border-forest-200/60 flex items-center justify-center shrink-0 shadow-2xs">
            {getIcon(automation.iconName)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900 tracking-tight hover:text-forest-800 transition-colors">
                {automation.name}
              </h3>
              {getStatusBadge(automation.status)}
              {integration && (
                integration.connected ? (
                  <Badge variant="green" className="text-[10px]">
                    {integration.service} Connected
                  </Badge>
                ) : (
                  <Badge variant="amber" className="text-[10px]" dot>
                    <Lock className="w-2.5 h-2.5 mr-0.5 inline" />
                    Permissions Needed
                  </Badge>
                )
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
              <span className="flex items-center gap-1 font-medium text-stone-700">
                <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                {automation.triggerDescription}
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-stone-500">{automation.lastRun}</span>
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end">
          {/* Pause / Resume control */}
          {!isDraft ? (
            <button
              type="button"
              onClick={() => onToggleStatus(automation.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              title={isPaused ? 'Resume automation' : 'Pause automation'}
              aria-label={isPaused ? `Resume ${automation.name}` : `Pause ${automation.name}`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                  <span>Pause</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-stone-400 italic px-2">Draft mode</span>
          )}

          {/* Edit action */}
          <button
            type="button"
            onClick={() => onEdit(automation)}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
            title="Edit automation prompt"
            aria-label={`Edit ${automation.name}`}
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Open / Full Process control */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenDetails(automation)}
            icon={<ChevronRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            View process
          </Button>
        </div>
      </div>
    </Card>
  );
};
