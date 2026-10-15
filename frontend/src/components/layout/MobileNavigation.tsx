import React from 'react';
import {
  Sparkles,
  Plus,
  Home,
  Layers,
  BookOpen,
  Activity,
  Lightbulb,
  Bell,
  UserPlus,
} from 'lucide-react';
import { ViewType, UserProfile } from '../../types';

export interface MobileNavigationProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onNewAutomation: () => void;
  onOpenNotifications: () => void;
  onOpenInvite: () => void;
  unreadCount?: number;
  userProfile?: UserProfile;
  onNavigateToAuth?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeView,
  onNavigate,
  onNewAutomation,
  onOpenNotifications,
  onOpenInvite,
  unreadCount = 0,
  userProfile,
  onNavigateToAuth,
}) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'automations', label: 'My automations', icon: <Layers className="w-4 h-4" /> },
    { id: 'library', label: 'Classroom library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'problem-solution', label: 'Problem & Solution', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-stone-200/80 shadow-xs">
      {/* Compact Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center text-forest-100 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-300" aria-hidden="true" />
          </div>
          <span className="font-semibold text-stone-900 tracking-tight text-base">Classflow AI</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenInvite}
            aria-label="Invite teammates"
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-forest-700 text-white text-[9px] font-bold flex items-center justify-center" />
            )}
          </button>

          {userProfile && (
            <button
              type="button"
              onClick={onNavigateToAuth}
              aria-label="User account"
              className="w-7 h-7 rounded-lg bg-forest-800 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs"
            >
              {userProfile.avatarInitials}
            </button>
          )}

          <button
            type="button"
            onClick={onNewAutomation}
            aria-label="New automation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-forest-800 text-white text-xs font-medium shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Horizontally scrollable tabs */}
      <nav
        className="flex items-center gap-1 px-4 overflow-x-auto no-scrollbar border-t border-stone-100 py-1"
        aria-label="Mobile navigation tabs"
      >
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-forest-50 text-forest-900 font-semibold border border-forest-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <span className={isActive ? 'text-forest-700' : 'text-stone-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
