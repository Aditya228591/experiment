import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { AutomationItem, IntegrationConfig } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { OAuthConnectModal } from '../integrations/OAuthConnectModal';
import { useToast } from '../../components/common/Toast';
import {
  Clock,
  CheckCircle2,
  Pause,
  Play,
  Edit3,
  ShieldCheck,
  Lock,
  Mail,
  Sparkles,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface AutomationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation: AutomationItem | null;
  onToggleStatus: (id: string) => void;
  onEdit: (automation: AutomationItem) => void;
  onUpdateIntegration?: (automationId: string, updated: IntegrationConfig) => void;
}

export const AutomationDetailsModal: React.FC<AutomationDetailsModalProps> = ({
  isOpen,
  onClose,
  automation,
  onToggleStatus,
  onEdit,
  onUpdateIntegration,
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'test' | 'architecture'>('process');
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasRunTest, setHasRunTest] = useState(false);
  const { showToast } = useToast();

  if (!automation) return null;

  const isPaused = automation.status === 'paused';
  const isDraft = automation.status === 'draft';
  const integration = automation.integration;

  const handleRunLiveTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setHasRunTest(true);
      showToast({
        title: 'Test execution finished',
        message: 'Processed simulated inbox and categorized emails by priority.',
        type: 'success',
      });
    }, 1400);
  };

  const handleOAuthSuccess = (updatedIntegration: IntegrationConfig) => {
    if (onUpdateIntegration) {
      onUpdateIntegration(automation.id, updatedIntegration);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={automation.name}
        subtitle={automation.summary}
        maxWidth="2xl"
      >
        <div className="space-y-5 py-2">
          {/* Top Status & Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas border border-stone-200/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">Status:</span>
              <Badge
                variant={
                  automation.status === 'active'
                    ? 'green'
                    : automation.status === 'draft'
                      ? 'amber'
                      : 'stone'
                }
                dot
              >
                {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
              </Badge>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-medium">
                {automation.triggerDescription}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isDraft && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onToggleStatus(automation.id)}
                  icon={isPaused ? <Play className="w-3.5 h-3.5 text-forest-700" /> : <Pause className="w-3.5 h-3.5 text-stone-500" />}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(automation);
                }}
                icon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit prompt
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('process')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'process'
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              Full Process & Permissions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'test'
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live Test & Output</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'architecture'
                  ? 'bg-forest-800 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </button>
          </div>

          {/* TAB 1: FULL PROCESS & PERMISSIONS */}
          {activeTab === 'process' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Permission & Integration Banner */}
              {integration && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${integration.connected
                      ? 'bg-emerald-50/60 border-emerald-200/80'
                      : 'bg-amber-50/70 border-amber-200/80'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${integration.connected
                          ? 'bg-white text-emerald-700 border-emerald-200'
                          : 'bg-white text-amber-700 border-amber-200'
                        }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{integration.service}</span>
                        {integration.connected ? (
                          <Badge variant="green" dot>Connected</Badge>
                        ) : (
                          <Badge variant="amber" dot>Permissions Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        {integration.connected
                          ? `Authorized for ${integration.accountName || 'Lincoln Middle School account'}.`
                          : 'To read emails or assignments, Classflow needs read-only OAuth permission.'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {integration.connected ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsOAuthOpen(true)}
                      >
                        Manage access
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsOAuthOpen(true)}
                        icon={<Lock className="w-3.5 h-3.5" />}
                      >
                        Grant access
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step-by-Step Connected Pipeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Step-by-step automation execution pipeline
                </h4>

                <div className="space-y-2.5">
                  {automation.steps.map((step, idx) => {
                    const stepTypes = {
                      trigger: { label: 'Step 1: Scheduled Trigger', badge: 'blue' as const },
                      ai_action: { label: 'Step 2: AI Reasoning & Sorting', badge: 'lavender' as const },
                      action: { label: 'Step 3: Notification & Delivery', badge: 'green' as const },
                    };
                    const cfg = stepTypes[step.type] || { label: `Step ${idx + 1}`, badge: 'stone' as const };

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{step.title}</span>
                          <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Sorting Rules (if applicable) */}
              {automation.priorityRules && (
                <div className="p-4 rounded-xl bg-canvas border border-stone-200/70 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                    <span>Configured Priority Rules</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {automation.priorityRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE TEST & OUTPUT PREVIEW */}
          {activeTab === 'test' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border border-stone-200/70">
                <div>
                  <p className="text-xs font-semibold text-stone-900">Run a simulated execution pass</p>
                  <p className="text-[11px] text-stone-500">Test how incoming data is prioritized and formatted</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isTesting}
                  onClick={handleRunLiveTest}
                  icon={<Zap className="w-3.5 h-3.5 text-emerald-300" />}
                >
                  {hasRunTest ? 'Re-run test' : 'Run test now'}
                </Button>
              </div>

              {/* Prioritized Sample Output */}
              {automation.sampleItems && automation.sampleItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Simulated Email Priority Digest</span>
                    <Badge variant="green" dot>Processed & Ranked</Badge>
                  </div>

                  <div className="space-y-2.5">
                    {automation.sampleItems.map((item, idx) => {
                      const priorityStyles = {
                        high: 'border-l-4 border-l-red-500 bg-red-50/40',
                        medium: 'border-l-4 border-l-amber-500 bg-amber-50/40',
                        low: 'border-l-4 border-l-stone-300 bg-stone-50/60 opacity-80',
                      };

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border border-stone-200/80 shadow-2xs space-y-1 ${priorityStyles[item.priority]}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900">{item.title}</span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : item.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-stone-200 text-stone-600'
                                }`}
                            >
                              {item.priority === 'high' ? 'Priority 1 (Events)' : item.priority === 'medium' ? 'Priority 2 (Updates)' : 'Filtered Spam'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium">{item.source}</p>
                          <p className="text-xs text-stone-700 leading-relaxed pt-0.5">{item.summary}</p>
                          {item.actionRequired && (
                            <div className="pt-1.5 flex items-center gap-1.5 text-xs text-forest-900 font-semibold">
                              <ArrowRight className="w-3.5 h-3.5 text-forest-700" />
                              <span>Action: {item.actionRequired}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200/70 space-y-2 text-xs">
                  <span className="font-semibold text-forest-900">Standard Test Verification</span>
                  <p className="text-forest-800 leading-relaxed">
                    Trigger schedule verified: <strong>{automation.triggerDescription}</strong>. Output formatted and ready to deliver to teacher review inbox.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HOW IT WORKS / PRODUCTION ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-stone-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-200/60 space-y-2">
                <div className="flex items-center gap-2 text-forest-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>How Classflow AI Runs This Automation Behind The Scenes</span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">
                  You described your repetitive task in natural language. Here is how a production automation system executes it from trigger to delivery:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>OAuth2 Authorization (Granting Access)</span>
                  </div>
                  <p className="text-stone-600 pl-7">
                    To access your school Gmail or Outlook inbox, Google requires an OAuth 2.0 consent token with the minimal scope <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">gmail.readonly</code>. This grants read access to message headers without allowing modification or sending.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Scheduled Background Worker (Cron)</span>
                  </div>
                  <p className="text-stone-600 pl-7">
                    A secure backend worker (running Python APScheduler or Celery/Cloud Tasks) wakes up at <strong>Every Sunday at 6:00 PM</strong>. It uses the stored encrypted refresh token to fetch new messages from the last 7 days.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>AI Priority Classification (Gemini API)</span>
                  </div>
                  <p className="text-stone-600 pl-7">
                    The raw email headers and snippets are sent to Gemini with your priority prompt. The model categorizes events and deadlines at the top, class updates in the middle, and suppresses promotional spam.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-[11px] flex items-center justify-center font-bold">4</span>
                    <span>Sunday Evening Notification Dispatch</span>
                  </div>
                  <p className="text-stone-600 pl-7">
                    The final prioritized digest card is delivered to your mobile device via Web Push / ntfy.sh notification and your teacher dashboard feed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{automation.lastRun}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{automation.tasksCompleted} items processed</span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Close process view
            </Button>
          </div>
        </div>
      </Modal>

      {/* OAuth Authorization Modal */}
      {integration && (
        <OAuthConnectModal
          isOpen={isOAuthOpen}
          onClose={() => setIsOAuthOpen(false)}
          integration={integration}
          onSuccess={handleOAuthSuccess}
        />
      )}
    </>
  );
};
