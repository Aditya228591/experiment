import React from 'react';
import { Modal } from '../common/Modal';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  Mail,
  CheckCheck,
  X,
  BellRing,
} from 'lucide-react';
import { Button } from '../common/Button';
import { NotificationItem } from '../../types';

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToActivity: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onDismissNotification: (id: string) => void;
  onClearAll: () => void;
  onSimulateNotification?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToActivity,
  notifications,
  onMarkAllAsRead,
  onDismissNotification,
  onClearAll,
  onSimulateNotification,
}) => {
  const getIcon = (type: NotificationItem['iconType']) => {
    switch (type) {
      case 'check':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'clock':
        return <Clock className="w-4 h-4 text-sky-600" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-forest-700" />;
      case 'mail':
        return <Mail className="w-4 h-4 text-forest-800" />;
      case 'alert':
      default:
        return <AlertCircle className="w-4 h-4 text-stone-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
      subtitle="Real-time updates from your automated classroom workflows"
      maxWidth="md"
    >
      {notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-stone-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </span>
            <div className="flex items-center gap-2">
              {onSimulateNotification && (
                <button
                  type="button"
                  onClick={onSimulateNotification}
                  className="text-xs text-forest-800 hover:text-forest-900 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <BellRing className="w-3 h-3" />
                  <span>+ Test alert</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`group relative p-3.5 rounded-xl border transition-all ${
                  n.unread
                    ? 'bg-forest-50/40 border-forest-200/70 shadow-2xs'
                    : 'bg-stone-50/60 border-stone-200/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-white border border-stone-200/80 shadow-2xs shrink-0 mt-0.5">
                    {getIcon(n.iconType)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-stone-900">{n.title}</p>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => onDismissNotification(n.id)}
                  title="Dismiss notification"
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Action footer */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-stone-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onNavigateToActivity();
              }}
            >
              View activity history
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-stone-500 hover:text-stone-700"
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onMarkAllAsRead}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                Mark all as read
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State when all notifications have disappeared */
        <div className="py-8 px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200/70 text-forest-800 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-stone-900">You're all caught up</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              All notifications have been cleared. When new automations trigger, emails are drafted, or integrations connect, new updates will appear here automatically.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-center gap-3">
            {onSimulateNotification && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSimulateNotification}
              >
                <BellRing className="w-3.5 h-3.5 mr-1 text-forest-700" />
                Send test alert
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
