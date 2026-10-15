import { AutomationItem, IntegrationConfig, UserProfile, NotificationItem } from '../types';

const STORAGE_KEY = 'classflow_automations_v1';
const VAULT_KEY = 'classflow_credential_vault_v1';
const USER_KEY = 'classflow_user_profile_v1';
const NOTIFICATIONS_KEY = 'classflow_notifications_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-default',
  name: 'Alex Rivera',
  username: 'alex_rivera',
  email: 'alex.rivera@lincolnms.edu',
  school: 'Lincoln Middle School',
  role: 'Educator',
  gradeSubject: '6th Grade Math',
  avatarInitials: 'AR',
  isLoggedIn: true,
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Weekly parent updates finished',
    time: '2 hours ago',
    desc: '24 personalized parent updates are drafted and waiting in your review queue.',
    iconType: 'check',
    unread: true,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'notif-2',
    title: 'Missing work check-in completed',
    time: 'Yesterday at 8:00 AM',
    desc: '5 students flagged with overdue lab reports. Advisory note prepared.',
    iconType: 'clock',
    unread: true,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'notif-3',
    title: 'System encryption verified',
    time: '3 days ago',
    desc: 'FERPA & COPPA compliant zero-retention data protection verified.',
    iconType: 'alert',
    unread: true,
    createdAt: Date.now() - 72 * 60 * 60 * 1000,
  },
];

export function loadAutomationsFromStorage(fallback: AutomationItem[]): AutomationItem[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse automations from localStorage:', e);
  }
  return fallback;
}

export function saveAutomationsToStorage(automations: AutomationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
  } catch (e) {
    console.error('Failed to save automations to localStorage:', e);
  }
}

/**
 * Universal Credential Vault:
 * Stores authenticated integrations (OAuth tokens, API keys) so they are shared
 * across all current and future automations without prompting the teacher repeatedly.
 */
export function getVaultIntegrations(): Record<string, IntegrationConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load credential vault:', e);
    return {};
  }
}

export function saveVaultIntegration(integration: IntegrationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const vault = getVaultIntegrations();
    const user = loadUserProfile();
    const key = integration.service.toLowerCase().replace(/[^a-z0-9]/g, '_');
    vault[key] = {
      ...integration,
      connected: true,
      accountName: integration.accountName || user.email || 'teacher@school.edu',
    };
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  } catch (e) {
    console.error('Failed to save to credential vault:', e);
  }
}

export function isServiceConnectedInVault(serviceName: string): { connected: boolean; config?: IntegrationConfig } {
  const vault = getVaultIntegrations();
  const clean = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  for (const [key, config] of Object.entries(vault)) {
    if (key.includes(clean) || clean.includes(key)) {
      return { connected: true, config };
    }
  }
  return { connected: false };
}

/* User Profile Management */
export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user profile from localStorage:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile to localStorage:', e);
  }
}

export function logoutUserProfile(): UserProfile {
  const guest: UserProfile = {
    id: 'guest',
    name: 'Guest Educator',
    username: 'guest',
    email: '',
    school: '',
    role: '',
    gradeSubject: '',
    avatarInitials: 'GE',
    isLoggedIn: false,
  };
  saveUserProfile(guest);
  return guest;
}

/* Notification Management */
export function loadNotificationsFromStorage(): NotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw === null) {
      // First load: seed with initial notifications
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error('Failed to load notifications from localStorage:', e);
  }
  return [];
}

export function saveNotificationsToStorage(notifications: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications to localStorage:', e);
  }
}

export function addNotificationToStorage(item: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem[] {
  const current = loadNotificationsFromStorage();
  const newItem: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
  };
  const updated = [newItem, ...current];
  saveNotificationsToStorage(updated);
  return updated;
}

export function markAllNotificationsReadInStorage(): NotificationItem[] {
  // When user clicks "mark all as read", notifications disappear as requested
  saveNotificationsToStorage([]);
  return [];
}

export function dismissNotificationInStorage(id: string): NotificationItem[] {
  const current = loadNotificationsFromStorage();
  const updated = current.filter((n) => n.id !== id);
  saveNotificationsToStorage(updated);
  return updated;
}
