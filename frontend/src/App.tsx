import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider, useToast } from './components/common/Toast';
import { PageHeading } from './components/common/PageHeading';
import { Button } from './components/common/Button';
import { PromptBuilder } from './features/home/PromptBuilder';
import { WorkflowPreview } from './features/home/WorkflowPreview';
import { TrustCard } from './features/home/TrustCard';
import { AutomationStats } from './features/automations/AutomationStats';
import { AutomationCard } from './features/automations/AutomationCard';
import { AutomationDetailsModal } from './features/automations/AutomationDetailsModal';
import { TemplateFilter } from './features/library/TemplateFilter';
import { TemplateCard } from './features/library/TemplateCard';
import { ActivityStats } from './features/activity/ActivityStats';
import { ActivityTimeline } from './features/activity/ActivityTimeline';
import { AuthPage } from './features/auth/AuthPage';
import { ProblemSolutionPage } from './features/problem-solution/ProblemSolutionPage';

import {
  ViewType,
  WorkflowData,
  AutomationItem,
  TemplateCategory,
  TemplateItem,
  UserProfile,
  NotificationItem,
} from './types';
import { initialAutomations } from './data/mockAutomations';
import { mockTemplates } from './data/mockTemplates';
import { initialActivities } from './data/mockActivities';
import { convertPromptToWorkflow } from './services/aiWorkflowService';
import {
  loadAutomationsFromStorage,
  saveAutomationsToStorage,
  loadUserProfile,
  saveUserProfile,
  loadNotificationsFromStorage,
  saveNotificationsToStorage,
  addNotificationToStorage,
  markAllNotificationsReadInStorage,
  dismissNotificationInStorage,
} from './services/storageService';
import { Plus, SlidersHorizontal, CheckCircle2, ArrowRight } from 'lucide-react';

const defaultSuggestedWorkflow: WorkflowData = {
  name: 'Your weekly progress update',
  summary: 'Summarizes each student’s weekly progress and drafts a warm update for their parents.',
  steps: [
    {
      type: 'trigger',
      title: 'Every Friday at 3:00 PM',
      description: 'Checks this week’s submitted assignments',
    },
    {
      type: 'ai_action',
      title: 'Summarize student progress',
      description: 'Spots wins, gaps, and learning patterns',
    },
    {
      type: 'action',
      title: 'Draft a parent update',
      description: 'Creates a warm, personalized email for each student',
    },
  ],
};

const MainApplication: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [promptText, setPromptText] = useState('');
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [isAiBuilding, setIsAiBuilding] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData>(defaultSuggestedWorkflow);

  const [newlyBuiltAutomation, setNewlyBuiltAutomation] = useState<AutomationItem | null>(null);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadNotificationsFromStorage()
  );

  // Automations state
  const [automations, setAutomations] = useState<AutomationItem[]>(() =>
    loadAutomationsFromStorage(initialAutomations)
  );
  const [automationFilter, setAutomationFilter] = useState<'all' | 'active' | 'drafts'>('all');
  const [inspectingAutomation, setInspectingAutomation] = useState<AutomationItem | null>(null);

  // Template Library state
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all');

  const { showToast } = useToast();

  // Persist automations to localStorage whenever updated
  useEffect(() => {
    saveAutomationsToStorage(automations);
  }, [automations]);

  // Handler: "New automation" action
  const handleNewAutomation = () => {
    setActiveView('home');
    setFocusTrigger((prev) => prev + 1);
  };

  // User Auth Handler
  const handleAuthSuccess = (updatedUser: UserProfile) => {
    setUserProfile(updatedUser);
    saveUserProfile(updatedUser);
    const updatedNotifs = addNotificationToStorage({
      title: `Signed in as @${updatedUser.username}`,
      desc: `Active identity set to ${updatedUser.name} (${updatedUser.email || 'guest'}).`,
      time: 'Just now',
      iconType: 'sparkles',
      unread: true,
    });
    setNotifications(updatedNotifs);
  };

  // Notification Handlers
  const handleMarkAllAsRead = () => {
    // When user clicks "mark all as read", notifications disappear as requested
    markAllNotificationsReadInStorage();
    setNotifications([]);
    showToast({
      title: 'Notifications cleared',
      message: 'All notifications have been marked as read and cleared.',
      type: 'info',
    });
  };

  const handleDismissNotification = (id: string) => {
    const updated = dismissNotificationInStorage(id);
    setNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    saveNotificationsToStorage([]);
    setNotifications([]);
    showToast({
      title: 'Notifications cleared',
      message: 'Notification inbox is now clear.',
      type: 'info',
    });
  };

  const handleSimulateNotification = () => {
    const alerts: Array<{ title: string; desc: string; iconType: NotificationItem['iconType'] }> = [
      {
        title: 'Sunday evening email summary ready',
        desc: 'Classflow AI prioritized 4 urgent parent emails, 6 school notices, and filtered out 15 promotional items.',
        iconType: 'mail',
      },
      {
        title: 'Student check-in completed',
        desc: 'Lucas Chen & 2 other students completed overdue math modules. Celebration drafts ready.',
        iconType: 'check',
      },
      {
        title: 'Weekly parent updates ready',
        desc: '24 personalized parent updates drafted and waiting in your 1-click review queue.',
        iconType: 'sparkles',
      },
    ];
    const item = alerts[Math.floor(Math.random() * alerts.length)];
    const updated = addNotificationToStorage({
      title: item.title,
      desc: item.desc,
      time: 'Just now',
      iconType: item.iconType,
      unread: true,
    });
    setNotifications(updated);
    showToast({
      title: 'New notification arrived',
      message: item.title,
      type: 'info',
    });
  };

  // Handler: Build automation from prompt
  const handleBuildAutomation = async (prompt: string) => {
    setIsAiBuilding(true);
    try {
      const generated = await convertPromptToWorkflow(prompt);
      setCurrentWorkflow(generated);

      // Create new automation item immediately and add to My automations
      const newAuto: AutomationItem = {
        id: `auto-${Date.now()}`,
        name: generated.name,
        triggerDescription: generated.steps[0]?.title || 'Scheduled trigger',
        summary: generated.summary,
        status: 'active',
        lastRun: 'Just configured • Next run scheduled',
        iconName: generated.integration?.type === 'email' ? 'Mail' : 'Sparkles',
        tasksCompleted: 0,
        createdAt: new Date().toISOString().split('T')[0],
        steps: generated.steps,
        prompt: prompt,
        integration: generated.integration,
        priorityRules: generated.priorityRules,
        sampleItems: generated.sampleItems,
      };

      setAutomations((prev) => [
        newAuto,
        ...prev.filter((a) => a.name.toLowerCase() !== newAuto.name.toLowerCase()),
      ]);
      setNewlyBuiltAutomation(newAuto);

      // Add dynamic notification for new automation
      const updatedNotifs = addNotificationToStorage({
        title: `Automation created: "${generated.name}"`,
        desc: `New workflow with ${generated.steps.length} steps is now active in My Automations.`,
        time: 'Just now',
        iconType: 'zap',
        unread: true,
      });
      setNotifications(updatedNotifs);

      showToast({
        title: 'Automation updated in "My automations"',
        message: `“${generated.name}” is now active in your dashboard.`,
        type: 'success',
      });
    } finally {
      setIsAiBuilding(false);
    }
  };

  // Handler: Update integration connection state
  const handleUpdateIntegration = (automationId: string, updated: any) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === automationId ? { ...a, integration: updated } : a))
    );
    if (inspectingAutomation && inspectingAutomation.id === automationId) {
      setInspectingAutomation((prev) => (prev ? { ...prev, integration: updated } : null));
    }
    const updatedNotifs = addNotificationToStorage({
      title: `Connected: ${updated.service}`,
      desc: 'Permissions granted & securely stored in your Universal Credential Vault.',
      time: 'Just now',
      iconType: 'check',
      unread: true,
    });
    setNotifications(updatedNotifs);
  };

  // Handler: Toggle active/pause status
  const handleToggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'paused' : 'active';
          showToast({
            title: `Automation ${nextStatus === 'active' ? 'resumed' : 'paused'}`,
            message: `“${a.name}” is now ${nextStatus}.`,
            type: 'info',
          });
          const updatedNotifs = addNotificationToStorage({
            title: `Automation ${nextStatus}: "${a.name}"`,
            desc: `Workflow status switched to ${nextStatus}.`,
            time: 'Just now',
            iconType: 'clock',
            unread: true,
          });
          setNotifications(updatedNotifs);
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Handler: Edit automation (redirects prompt to builder)
  const handleEditAutomation = (automation: AutomationItem) => {
    setInspectingAutomation(null);
    setPromptText(automation.prompt || automation.summary);
    setActiveView('home');
    setFocusTrigger((prev) => prev + 1);
    showToast({
      title: 'Loaded in builder',
      message: `Prompt for "${automation.name}" is ready to edit.`,
      type: 'info',
    });
  };

  // Handler: Use template
  const handleUseTemplate = (template: TemplateItem) => {
    setPromptText(template.prompt);
    setActiveView('home');
    setFocusTrigger((prev) => prev + 1);
    showToast({
      title: 'Template loaded',
      message: `“${template.title}” is ready. Click "Build my automation" to preview.`,
      type: 'info',
    });
  };

  // Save current preview to automations
  const handleSavePreview = (workflow: WorkflowData) => {
    const newAuto: AutomationItem = {
      id: `auto-${Date.now()}`,
      name: workflow.name,
      triggerDescription: workflow.steps[0]?.title || 'Scheduled trigger',
      summary: workflow.summary,
      status: 'active',
      lastRun: 'Never',
      iconName: 'Sparkles',
      tasksCompleted: 0,
      createdAt: new Date().toISOString().split('T')[0],
      steps: workflow.steps,
      prompt: promptText || workflow.summary,
      integration: workflow.integration,
      priorityRules: workflow.priorityRules,
      sampleItems: workflow.sampleItems,
    };

    setAutomations((prev) => [newAuto, ...prev]);
    const updatedNotifs = addNotificationToStorage({
      title: `Saved: "${workflow.name}"`,
      desc: 'Added to your active automations list.',
      time: 'Just now',
      iconType: 'check',
      unread: true,
    });
    setNotifications(updatedNotifs);

    showToast({
      title: 'Saved to My automations',
      message: `“${workflow.name}” is now added to your dashboard.`,
      type: 'success',
    });
  };

  // Filter automations
  const filteredAutomations = automations.filter((a) => {
    if (automationFilter === 'active') return a.status === 'active';
    if (automationFilter === 'drafts') return a.status === 'draft' || a.status === 'paused';
    return true;
  });

  // Filter templates
  const filteredTemplates = mockTemplates.filter((t) => {
    if (templateCategory === 'all') return true;
    return t.category === templateCategory;
  });

  // Calculate template counts
  const templateCounts = {
    all: mockTemplates.length,
    communication: mockTemplates.filter((t) => t.category === 'communication').length,
    assessment: mockTemplates.filter((t) => t.category === 'assessment').length,
    planning: mockTemplates.filter((t) => t.category === 'planning').length,
    'student support': mockTemplates.filter((t) => t.category === 'student support').length,
  };

  return (
    <AppShell
      activeView={activeView}
      onNavigate={setActiveView}
      onNewAutomation={handleNewAutomation}
      userProfile={userProfile}
      notifications={notifications}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDismissNotification={handleDismissNotification}
      onClearAllNotifications={handleClearAllNotifications}
      onSimulateNotification={handleSimulateNotification}
    >
      {/* VIEW 1: HOME */}
      {activeView === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Main Hero Header */}
          <PageHeading
            title="What can we take off your plate?"
            description="Describe a repetitive teaching process in plain English. Classflow AI turns it into a human-supervised automation."
          />

          {/* Natural Language Prompt Builder */}
          <PromptBuilder
            initialPrompt={promptText}
            onBuild={handleBuildAutomation}
            isLoading={isAiBuilding}
            focusTrigger={focusTrigger}
          />

          {/* Auto-Sync Banner when an automation was just built */}
          {newlyBuiltAutomation && (
            <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200/80 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-forest-800 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-forest-900">
                    Automation saved to "My automations"
                  </p>
                  <p className="text-xs text-forest-800/80">
                    "{newlyBuiltAutomation.name}" has been configured with {newlyBuiltAutomation.steps.length} steps.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectingAutomation(newlyBuiltAutomation)}
                  className="bg-white hover:bg-forest-100/50 text-forest-900 border-forest-200"
                >
                  View full process
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveView('automations')}
                >
                  <span>Go to My automations</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* 3-Step Connected Workflow Preview */}
          <WorkflowPreview
            workflow={currentWorkflow}
            onSaveToAutomations={handleSavePreview}
            isSaved={automations.some((a) => a.name === currentWorkflow.name)}
          />

          {/* Trust and Safety Guarantee Card */}
          <TrustCard />
        </div>
      )}

      {/* VIEW 2: MY AUTOMATIONS */}
      {activeView === 'automations' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeading
              title="My automations"
              description="Review, inspect, pause, or edit your running classroom workflows."
            />
            <Button variant="primary" size="sm" onClick={handleNewAutomation}>
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create automation</span>
            </Button>
          </div>

          {/* Metric Stats Cards */}
          <AutomationStats automations={automations} />

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100/80 text-xs">
              <button
                type="button"
                onClick={() => setAutomationFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  automationFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({automations.length})
              </button>
              <button
                type="button"
                onClick={() => setAutomationFilter('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  automationFilter === 'active'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Active ({automations.filter((a) => a.status === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setAutomationFilter('drafts')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  automationFilter === 'drafts'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Drafts ({automations.filter((a) => a.status === 'draft' || a.status === 'paused').length})
              </button>
            </div>
          </div>

          {/* Automations List */}
          <div className="space-y-3">
            {filteredAutomations.length > 0 ? (
              filteredAutomations.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onOpenDetails={setInspectingAutomation}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditAutomation}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200/80 space-y-3">
                <SlidersHorizontal className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-sm font-semibold text-stone-800">No automations found</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  There are no automations matching the "{automationFilter}" filter.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setAutomationFilter('all')}>
                  Show all automations
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CLASSROOM LIBRARY */}
      {activeView === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <PageHeading
            title="Classroom library"
            description="Explore tested automation ideas curated for teacher workflows. Click any template to customize."
          />

          {/* Category Filters */}
          <TemplateFilter
            selectedCategory={templateCategory}
            onSelectCategory={setTemplateCategory}
            counts={templateCounts}
          />

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUseTemplate={handleUseTemplate}
              />
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: ACTIVITY */}
      {activeView === 'activity' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <PageHeading
            title="Activity"
            description="Audit recent automated runs, time saved, and items queued for teacher review."
          />

          {/* Summary Cards */}
          <ActivityStats />

          {/* Activity Timeline */}
          <ActivityTimeline activities={initialActivities} />
        </div>
      )}

      {/* VIEW 5: TEACHER ACCOUNT & LOGIN/SIGNUP */}
      {activeView === 'auth' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AuthPage
            currentUser={userProfile}
            onAuthSuccess={handleAuthSuccess}
            onNavigateHome={() => setActiveView('home')}
          />
        </div>
      )}

      {/* VIEW 6: PROBLEM & SOLUTION ARCHITECTURAL SHOWCASE */}
      {activeView === 'problem-solution' && (
        <ProblemSolutionPage onNavigate={setActiveView} />
      )}

      {/* Details Modal */}
      <AutomationDetailsModal
        isOpen={!!inspectingAutomation}
        onClose={() => setInspectingAutomation(null)}
        automation={inspectingAutomation}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditAutomation}
        onUpdateIntegration={handleUpdateIntegration}
      />
    </AppShell>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApplication />
    </ToastProvider>
  );
}
