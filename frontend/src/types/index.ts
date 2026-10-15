export type ViewType = 'home' | 'automations' | 'library' | 'activity' | 'problem-solution' | 'resources' | 'auth';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  school?: string;
  role?: string;
  gradeSubject?: string;
  avatarInitials: string;
  isLoggedIn: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  desc: string;
  iconType: 'check' | 'clock' | 'alert' | 'zap' | 'sparkles' | 'mail';
  unread: boolean;
  createdAt: number;
}

export type StepType = 'trigger' | 'ai_action' | 'action';

export interface WorkflowStep {
  type: StepType;
  title: string;
  description: string;
  config?: Record<string, any>;
}

export type AuthMechanism = 'oauth2' | 'api_key' | 'webhook';

export interface IntegrationConfig {
  id?: string;
  service: string;
  type: 'email' | 'classroom' | 'lms' | 'calendar' | 'notifications' | 'collaboration' | 'custom';
  authMechanism?: AuthMechanism;
  apiKeyLabel?: string;
  apiKeyValue?: string;
  keyInstructions?: string;
  icon: string;
  connected: boolean;
  requiredScopes: string[];
  accountName?: string;
  description: string;
}

export interface PriorityItem {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  source: string;
  summary: string;
  actionRequired?: string;
}

export interface WorkflowData {
  id?: string;
  name: string;
  summary: string;
  steps: WorkflowStep[];
  prompt?: string;
  status?: 'active' | 'draft' | 'paused';
  createdAt?: string;
  lastRun?: string;
  tasksCompleted?: number;
  integration?: IntegrationConfig;
  priorityRules?: string[];
  sampleItems?: PriorityItem[];
}

export type AutomationStatus = 'active' | 'draft' | 'paused';

export interface AutomationItem {
  id: string;
  name: string;
  triggerDescription: string;
  summary: string;
  status: AutomationStatus;
  lastRun: string;
  iconName: string;
  tasksCompleted: number;
  steps: WorkflowStep[];
  createdAt: string;
  prompt?: string;
  integration?: IntegrationConfig;
  priorityRules?: string[];
  sampleItems?: PriorityItem[];
}

export type TemplateCategory = 'all' | 'communication' | 'assessment' | 'planning' | 'student support';

export interface TemplateItem {
  id: string;
  category: TemplateCategory;
  categoryLabel: string;
  title: string;
  shortExplanation: string;
  prompt: string;
  iconName: string;
  suggestedSteps: WorkflowStep[];
  integration?: IntegrationConfig;
}

export type ActivityStatus = 'completed' | 'ran' | 'edited' | 'approved' | 'pending';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  iconName: string;
  status: ActivityStatus;
  meta?: {
    studentCount?: number;
    timeSavedMinutes?: number;
    targetName?: string;
  };
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
