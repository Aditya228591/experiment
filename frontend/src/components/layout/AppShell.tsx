import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { NotificationModal } from './NotificationModal';
import { InviteTeammatesModal } from './InviteTeammatesModal';
import { HelpResourcesModal } from './HelpResourcesModal';
import { ViewType, UserProfile, NotificationItem } from '../../types';

export interface AppShellProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onNewAutomation: () => void;
  userProfile?: UserProfile;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onDismissNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onSimulateNotification?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onNavigate,
  onNewAutomation,
  userProfile,
  notifications,
  onMarkAllAsRead,
  onDismissNotification,
  onClearAllNotifications,
  onSimulateNotification,
  children,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-canvas text-stone-800 flex flex-col md:flex-row antialiased">
      {/* Skip to Content for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-forest-800 text-white rounded-lg shadow-md"
      >
        Skip to main content
      </a>

      {/* Persistent Desktop Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={onNavigate}
        onNewAutomation={onNewAutomation}
        onOpenHelp={() => setIsHelpOpen(true)}
        userProfile={userProfile}
        onNavigateToAuth={() => onNavigate('auth')}
      />

      {/* Mobile Top Navigation */}
      <MobileNavigation
        activeView={activeView}
        onNavigate={onNavigate}
        onNewAutomation={onNewAutomation}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        unreadCount={unreadCount}
        userProfile={userProfile}
        onNavigateToAuth={() => onNavigate('auth')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Desktop Top Header */}
        <Header
          activeView={activeView}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
          unreadCount={unreadCount}
          userProfile={userProfile}
          onNavigateToAuth={() => onNavigate('auth')}
        />

        {/* Dynamic View Body */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToActivity={() => onNavigate('activity')}
        notifications={notifications}
        onMarkAllAsRead={onMarkAllAsRead}
        onDismissNotification={onDismissNotification}
        onClearAll={onClearAllNotifications}
        onSimulateNotification={onSimulateNotification}
      />

      <InviteTeammatesModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <HelpResourcesModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
