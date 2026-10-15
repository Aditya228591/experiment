import React from 'react';
import {
  Sparkles,
  Plus,
  Home,
  Layers,
  BookOpen,
  Activity,
  Lightbulb,
  HelpCircle,
  School,
  User,
} from 'lucide-react';
import { ViewType, UserProfile } from '../../types';

export interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onNewAutomation: () => void;
  onOpenHelp: () => void;
  userProfile?: UserProfile;
  onNavigateToAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onNewAutomation,
  onOpenHelp,
  userProfile,
  onNavigateToAuth,
}) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'automations', label: 'My automations', icon: <Layers className="w-4 h-4" /> },
    { id: 'library', label: 'Classroom library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'problem-solution', label: 'Problem & Solution', icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <aside
      className="hidden md:flex md:w-64 flex-col justify-between h-screen sticky top-0 bg-white border-r border-stone-200/80 px-4 py-5 select-none shrink-0"
      aria-label="Main sidebar navigation"
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-forest-100 shadow-sm">
            <Sparkles className="w-5 h-5 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-900 tracking-tight text-base">Classflow</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">Assistant for Educators</p>
          </div>
        </div>

        {/* Primary Action: New Automation */}
        <button
          type="button"
          onClick={onNewAutomation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New automation</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Primary sections">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 ${
                  isActive
                    ? 'bg-forest-50 text-forest-900 font-semibold border border-forest-200/50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-forest-700' : 'text-stone-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Help & Resources + Teacher Profile */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
        >
          <HelpCircle className="w-4 h-4 text-stone-400" aria-hidden="true" />
          <span>Help & resources</span>
        </button>

        {/* Dynamic Teacher Profile Card */}
        {userProfile && userProfile.isLoggedIn ? (
          <button
            type="button"
            onClick={onNavigateToAuth}
            title="Manage account & username"
            className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl bg-canvas hover:bg-stone-100/80 border border-stone-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 group"
          >
            <div className="w-9 h-9 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-forest-100">
              {userProfile.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-stone-900 truncate group-hover:text-forest-900">
                  {userProfile.name}
                </p>
                <span className="text-[10px] text-forest-700 opacity-0 group-hover:opacity-100 font-medium">Edit</span>
              </div>
              <p className="text-[11px] font-mono text-forest-800 truncate">@{userProfile.username}</p>
              {userProfile.school && (
                <div className="flex items-center gap-1 text-[10px] text-stone-500 truncate mt-0.5">
                  <School className="w-2.5 h-2.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <span className="truncate">{userProfile.school}</span>
                </div>
              )}
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNavigateToAuth}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-forest-50 hover:bg-forest-100/80 border border-forest-200/70 text-forest-900 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
          >
            <User className="w-4 h-4 text-forest-700" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </aside>
  );
};
