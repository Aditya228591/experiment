import React from 'react';
import { Bell, UserPlus, ChevronRight } from 'lucide-react';
import { ViewType, UserProfile } from '../../types';

export interface HeaderProps {
  activeView: ViewType;
  onOpenNotifications: () => void;
  onOpenInvite: () => void;
  unreadCount?: number;
  userProfile?: UserProfile;
  onNavigateToAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenNotifications,
  onOpenInvite,
  unreadCount = 0,
  userProfile,
  onNavigateToAuth,
}) => {
  const viewLabels: Record<ViewType, string> = {
    home: 'Home',
    automations: 'My automations',
    library: 'Classroom library',
    activity: 'Activity',
    'problem-solution': 'Problem & Solution',
    resources: 'Help & resources',
    auth: 'Teacher Account & Profile',
  };

  return (
    <header className="hidden md:flex items-center justify-between h-16 px-8 bg-white/80 backdrop-blur-xs border-b border-stone-200/80 sticky top-0 z-30">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-stone-500">
        <span className="font-medium text-stone-600 hover:text-stone-900 transition-colors">Classflow AI</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
        <span className="font-semibold text-stone-900" aria-current="page">
          {viewLabels[activeView] || 'Overview'}
        </span>
      </nav>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Invite Teammates Button */}
        <button
          type="button"
          onClick={onOpenInvite}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 text-xs font-medium transition-all shadow-2xs hover:border-stone-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
        >
          <UserPlus className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
          <span>Invite teammates</span>
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label={`View notifications, ${unreadCount} unread`}
          className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-forest-700 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
              aria-hidden="true"
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account / Profile */}
        {userProfile && (
          <button
            type="button"
            onClick={onNavigateToAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
            title="Account & Profile Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-forest-800 text-white font-bold text-[11px] flex items-center justify-center">
              {userProfile.avatarInitials}
            </div>
            <span className="text-xs font-semibold text-stone-800">
              {userProfile.isLoggedIn ? `@${userProfile.username}` : 'Sign In'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
