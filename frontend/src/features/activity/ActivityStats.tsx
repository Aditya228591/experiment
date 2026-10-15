import React from 'react';
import { Card } from '../../components/common/Card';
import { Clock, MailCheck, Inbox } from 'lucide-react';
import { mockActivityStats } from '../../data/mockActivities';

export const ActivityStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200/60 flex items-center justify-center text-forest-800 shrink-0">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">
              {mockActivityStats.hoursSaved}
            </p>
            <p className="text-xs text-stone-500 font-medium">
              {mockActivityStats.hoursSavedSubtitle}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shrink-0">
            <MailCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">
              {mockActivityStats.messagesDrafted}
            </p>
            <p className="text-xs text-stone-500 font-medium">
              {mockActivityStats.messagesDraftedSubtitle}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="bg-white border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 shrink-0">
            <Inbox className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-900 tracking-tight">
              {mockActivityStats.waitingReview}
            </p>
            <p className="text-xs text-stone-500 font-medium">
              {mockActivityStats.waitingReviewSubtitle}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
