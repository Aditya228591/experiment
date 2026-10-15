import React, { useState } from 'react';
import { ActivityItem, ActivityStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import {
  CheckCircle2,
  Clock,
  FileEdit,
  Send,
  Eye,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';

export interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const { showToast } = useToast();

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="green">Completed</Badge>;
      case 'ran':
        return <Badge variant="blue">Executed</Badge>;
      case 'edited':
        return <Badge variant="lavender">Edited</Badge>;
      case 'approved':
        return <Badge variant="green">Approved</Badge>;
      default:
        return <Badge variant="stone">{status}</Badge>;
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-sky-700" />;
      case 'FileEdit':
        return <FileEdit className="w-4 h-4 text-purple-700" />;
      case 'Send':
        return <Send className="w-4 h-4 text-emerald-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-forest-700" />;
    }
  };

  const handleApproveAll = () => {
    showToast({
      title: 'Batch approved',
      message: 'Draft parent updates have been queued for sending.',
      type: 'success',
    });
    setSelectedActivity(null);
  };

  return (
    <>
      <Card className="border-stone-200/80 p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-stone-900 tracking-tight">Recent activity log</h2>
          </div>
          <span className="text-xs text-stone-400 font-medium">Sorted by newest</span>
        </div>

        <div className="divide-y divide-stone-100">
          {activities.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 hover:bg-stone-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-canvas border border-stone-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                  {getIcon(item.iconName)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-stone-900 tracking-tight">
                      {item.title}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="font-medium text-stone-500">{item.timestamp}</span>
                    {item.meta?.targetName && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          {item.meta.targetName}
                        </span>
                      </>
                    )}
                    {item.meta?.timeSavedMinutes && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          Saved ~{item.meta.timeSavedMinutes}m
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedActivity(item)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  View details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title={selectedActivity.title}
          subtitle={selectedActivity.timestamp}
          maxWidth="md"
        >
          <div className="space-y-4 py-2 text-xs sm:text-sm text-stone-700">
            <div className="p-3.5 rounded-xl bg-canvas border border-stone-200/70 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Event summary</span>
              <p className="leading-relaxed">{selectedActivity.description}</p>
            </div>

            {selectedActivity.meta?.studentCount && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-stone-500 block">Students impacted</span>
                  <span className="text-base font-bold text-stone-900">{selectedActivity.meta.studentCount} students</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-stone-500 block">Teacher time saved</span>
                  <span className="text-base font-bold text-emerald-700">~{selectedActivity.meta.timeSavedMinutes} minutes</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
              {selectedActivity.status === 'completed' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-3.5 h-3.5" />}
                  onClick={handleApproveAll}
                >
                  Review & dispatch drafts
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
