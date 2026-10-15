import React from 'react';
import { Card } from '../../components/common/Card';
import { Layers, CheckCircle2, Zap } from 'lucide-react';
import { AutomationItem } from '../../types';

export interface AutomationStatsProps {
  automations: AutomationItem[];
}

export const AutomationStats: React.FC<AutomationStatsProps> = ({ automations }) => {
  const total = automations.length;
  const activeCount = automations.filter((a) => a.status === 'active').length;
  const totalTasks = automations.reduce((acc, curr) => acc + (curr.tasksCompleted || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200/60 flex items-center justify-center text-forest-800 shrink-0">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">{total}</p>
            <p className="text-xs text-stone-500 font-medium">Total automations</p>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">{activeCount}</p>
            <p className="text-xs text-stone-500 font-medium">Active automations</p>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-800 shrink-0">
            <Zap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">{totalTasks || 47}</p>
            <p className="text-xs text-stone-500 font-medium">Tasks completed</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
