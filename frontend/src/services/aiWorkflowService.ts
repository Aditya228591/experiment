import { WorkflowData, StepType, IntegrationConfig } from '../types';
import { isServiceConnectedInVault } from './storageService';

/**
 * Validates the raw response structure to ensure it matches the required Workflow schema.
 */
export function validateWorkflowResponse(data: unknown): data is WorkflowData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.trim() === '') {
    return false;
  }

  if (typeof obj.summary !== 'string' || obj.summary.trim() === '') {
    return false;
  }

  if (!Array.isArray(obj.steps) || obj.steps.length === 0) {
    return false;
  }

  const validTypes: StepType[] = ['trigger', 'ai_action', 'action'];

  for (const step of obj.steps) {
    if (!step || typeof step !== 'object') return false;
    const s = step as Record<string, unknown>;
    if (!validTypes.includes(s.type as StepType)) return false;
    if (typeof s.title !== 'string' || s.title.trim() === '') return false;
    if (typeof s.description !== 'string' || s.description.trim() === '') return false;
  }

  return true;
}

/**
 * Universal app integration detector that infers required service, auth mechanism,
 * and read-only permission scopes from any prompt.
 */
function detectUniversalIntegration(prompt: string): IntegrationConfig {
  const lower = prompt.toLowerCase();

  // 1. Google Calendar
  if (lower.includes('calendar') || lower.includes('schedule event') || lower.includes('meeting')) {
    return {
      service: 'Google Calendar',
      type: 'calendar',
      icon: 'Calendar',
      authMechanism: 'oauth2',
      connected: false,
      requiredScopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      description: 'Read-only access to inspect your daily class schedules, parent conferences, and school calendar events.'
    };
  }

  // 2. Google Drive / Docs / Sheets
  if (lower.includes('drive') || lower.includes('sheet') || lower.includes('doc') || lower.includes('slide')) {
    return {
      service: 'Google Drive & Workspace',
      type: 'collaboration',
      icon: 'Folder',
      authMechanism: 'oauth2',
      connected: false,
      requiredScopes: ['https://www.googleapis.com/auth/drive.readonly'],
      description: 'Read-only access to scan student lesson materials, rubric spreadsheets, and assignment attachments.'
    };
  }

  // 3. Canvas LMS / Blackboard / Grading Portal
  if (lower.includes('canvas') || lower.includes('blackboard') || lower.includes('lms') || lower.includes('gradebook')) {
    return {
      service: 'Canvas LMS',
      type: 'lms',
      icon: 'GraduationCap',
      authMechanism: 'api_key',
      apiKeyLabel: 'Canvas Personal Access Token',
      keyInstructions: 'Generate in Canvas under Account Settings > Approved Integrations > New Access Token.',
      connected: false,
      requiredScopes: ['courses:read', 'assignments:read', 'submissions:read'],
      description: 'Read-only access to sync course assignments, student submissions, and rubric scores.'
    };
  }

  // 4. Slack
  if (lower.includes('slack')) {
    return {
      service: 'Slack Workspace',
      type: 'collaboration',
      icon: 'MessageSquare',
      authMechanism: 'oauth2',
      connected: false,
      requiredScopes: ['channels:read', 'chat:write'],
      description: 'Permission to post automated morning briefings to your department or team channel.'
    };
  }

  // 5. Notion
  if (lower.includes('notion')) {
    return {
      service: 'Notion Workspace',
      type: 'collaboration',
      icon: 'BookOpen',
      authMechanism: 'api_key',
      apiKeyLabel: 'Notion Internal Integration Secret',
      keyInstructions: 'Create an integration at notion.so/my-integrations and invite it to your lesson database.',
      connected: false,
      requiredScopes: ['read_content', 'update_content'],
      description: 'Access to sync lesson reflections and curriculum unit notes directly into your Notion database.'
    };
  }

  // 6. Microsoft 365 / Outlook / Teams
  if (lower.includes('teams') || lower.includes('outlook') || lower.includes('microsoft')) {
    return {
      service: 'Microsoft 365 / Outlook',
      type: 'email',
      icon: 'Mail',
      authMechanism: 'oauth2',
      connected: false,
      requiredScopes: ['Mail.Read', 'Calendars.Read'],
      description: 'Read-only access to inspect your Microsoft Exchange inbox and calendar.'
    };
  }

  // 7. Gmail / Email
  if (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox') || lower.includes('spam')) {
    return {
      service: 'Google Workspace / Gmail',
      type: 'email',
      icon: 'Mail',
      authMechanism: 'oauth2',
      connected: false,
      requiredScopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      description: 'Read-only access to inspect message headers, dates, and snippets. Classflow cannot send or delete emails.'
    };
  }

  // 8. Custom / Third-party Apps (e.g. Trello, Airtable, Discord, GitHub, Zoom, Remind, ClassDojo)
  const appKeywords = ['trello', 'airtable', 'discord', 'github', 'zoom', 'asana', 'remind', 'classdojo', 'edpuzzle'];
  for (const app of appKeywords) {
    if (lower.includes(app)) {
      const capitalized = app.charAt(0).toUpperCase() + app.slice(1);
      return {
        service: `${capitalized} Integration`,
        type: 'custom',
        icon: 'Sparkles',
        authMechanism: 'api_key',
        apiKeyLabel: `${capitalized} API Key or Personal Access Token`,
        keyInstructions: `Retrieve your API access token from your ${capitalized} developer or integration settings.`,
        connected: false,
        requiredScopes: ['read_only'],
        description: `Read-only access to sync events and tasks from ${capitalized} without modifying any records.`
      };
    }
  }

  // Default: Google Classroom LMS
  return {
    service: 'Google Classroom & LMS',
    type: 'classroom',
    icon: 'School',
    authMechanism: 'oauth2',
    connected: true,
    accountName: 'teacher@school.edu',
    requiredScopes: ['https://www.googleapis.com/auth/classroom.rosters.readonly'],
    description: 'Read-only access to view classroom rosters and student coursework status.'
  };
}

/**
 * Intelligent mock workflow generator that parses natural language intent.
 */
function generateIntelligentMockWorkflow(prompt: string): WorkflowData {
  const lower = prompt.toLowerCase();
  let workflow: WorkflowData;

  // Pattern 0: Email priority summary / Sunday notification
  if (lower.includes('email') || lower.includes('inbox') || lower.includes('sunday') || lower.includes('spam')) {
    workflow = {
      name: "Sunday evening email priority digest",
      summary: "Filters and categorizes your weekly emails by priority (events and updates first, spam filtered to the bottom) and delivers a notification every Sunday evening.",
      integration: detectUniversalIntegration(prompt),
      priorityRules: [
        "Priority 1: School events, faculty deadlines, and calendar invitations",
        "Priority 2: Student academic notes, guardian questions, and department updates",
        "Priority 3: Filtered spam, marketing newsletters, and automated software receipts"
      ],
      sampleItems: [
        {
          priority: "high",
          category: "Events & Deadlines",
          title: "District Curriculum Review Meeting",
          source: "From: Principal Vance (pvance@lincolnms.edu)",
          summary: "Mandatory department meeting on Tuesday at 4:15 PM in the Library Media Center.",
          actionRequired: "Review attached Math unit pacing guide before Tuesday."
        },
        {
          priority: "high",
          category: "Events & Deadlines",
          title: "Quarter 3 Gradebook Verification Window",
          source: "From: Registrar's Office",
          summary: "Mid-quarter grade inputs must be finalized by Friday at 5:00 PM.",
          actionRequired: "Lock student formative marks by Friday."
        },
        {
          priority: "medium",
          category: "Updates & Student Notes",
          title: "Lucas Chen's Math Support Plan",
          source: "From: Sarah Chen (Parent)",
          summary: "Thanked you for the Friday note and requested extra practice worksheets for coordinate geometry.",
          actionRequired: "Reply with student portal practice links."
        },
        {
          priority: "low",
          category: "Filtered / Low Priority",
          title: "14 Promotional & Newsletter Emails Filtered",
          source: "EdTech Digest, Scholastic Book Fair News, Software Receipts",
          summary: "Grouped and suppressed so they do not clutter your weekend focus."
        }
      ],
      steps: [
        {
          type: "trigger",
          title: "Every Sunday at 6:00 PM",
          description: "Initiates the weekly email audit scheduled before Monday morning."
        },
        {
          type: "ai_action",
          title: "Prioritize emails by urgency",
          description: "Sorts messages into events & deadlines first, student updates second, and filters spam to the bottom."
        },
        {
          type: "action",
          title: "Send Sunday evening notification",
          description: "Delivers a calm, structured digest card directly to your notification tray and teacher feed."
        }
      ]
    };
  }

  // Pattern 1: Parent update / Friday progress
  else if (lower.includes('parent') || lower.includes('friday') || lower.includes('update') || lower.includes('family')) {
    workflow = {
      name: "Your weekly progress update",
      summary: "Creates personalized weekly progress messages for families based on class activity.",
      integration: detectUniversalIntegration(prompt),
      steps: [
        {
          type: "trigger",
          title: "Every Friday at 3:00 PM",
          description: "Checks this week’s submitted assignments, attendance, and milestone marks."
        },
        {
          type: "ai_action",
          title: "Summarize student progress",
          description: "Spots wins, gaps, and learning patterns across 6th-grade math units."
        },
        {
          type: "action",
          title: "Draft parent update",
          description: "Creates a warm, personalized email for each student's guardians ready for teacher review."
        }
      ]
    };
  }

  // Pattern 2: Quiz feedback / Assessment
  else if (lower.includes('quiz') || lower.includes('grade') || lower.includes('test') || lower.includes('feedback')) {
    workflow = {
      name: "Personalized quiz feedback assistant",
      summary: "Generates encouraging, individualized feedback whenever student assessments are submitted.",
      integration: detectUniversalIntegration(prompt),
      steps: [
        {
          type: "trigger",
          title: "When a quiz is graded",
          description: "Fires automatically when scores are entered into the classroom gradebook."
        },
        {
          type: "ai_action",
          title: "Diagnose concept mastery",
          description: "Analyzes incorrect answers to identify specific misconceptions and highlight student strengths."
        },
        {
          type: "action",
          title: "Draft formative student comments",
          description: "Writes 2-3 constructive sentences with targeted review links for each student portal."
        }
      ]
    };
  }

  // Pattern 3: Missing work / assignments / attendance
  else if (lower.includes('missing') || lower.includes('assignment') || lower.includes('late') || lower.includes('overdue')) {
    workflow = {
      name: "Missing work morning check-in",
      summary: "Identifies students with incomplete tasks and prepares gentle, supportive reminders.",
      integration: detectUniversalIntegration(prompt),
      steps: [
        {
          type: "trigger",
          title: "Weekdays at 8:00 AM",
          description: "Scans active Google Classroom and LMS queues for assignments overdue >24 hours."
        },
        {
          type: "ai_action",
          title: "Group by urgency and student history",
          description: "Identifies whether students have consecutive missing items or just a single deadline slip."
        },
        {
          type: "action",
          title: "Draft morning advisory checklist",
          description: "Prepares a discrete desk-side checklist and warm follow-up notes for homeroom check-in."
        }
      ]
    };
  }

  // Pattern 4: Monday morning / planning / week ahead
  else if (lower.includes('monday') || lower.includes('morning') || lower.includes('week') || lower.includes('plan')) {
    workflow = {
      name: "Monday morning classroom briefing",
      summary: "Synthesizes upcoming unit milestones, IEP accommodations, and supply checklists.",
      integration: detectUniversalIntegration(prompt),
      steps: [
        {
          type: "trigger",
          title: "Every Monday at 7:15 AM",
          description: "Retrieves schedule, unit calendar, and student support flags for the upcoming week."
        },
        {
          type: "ai_action",
          title: "Synthesize focus areas & accommodations",
          description: "Correlates planned labs with individual student support notes and deadlines."
        },
        {
          type: "action",
          title: "Generate daily digest card",
          description: "Delivers a single 1-page high-priority summary to your teacher dashboard."
        }
      ]
    };
  }

  // Pattern 5: Lesson reflection / exit ticket
  else if (lower.includes('lesson') || lower.includes('exit ticket') || lower.includes('reflection')) {
    workflow = {
      name: "Daily lesson & exit ticket synthesizer",
      summary: "Processes student exit slips to gauge conceptual grasp before tomorrow's lesson.",
      integration: detectUniversalIntegration(prompt),
      steps: [
        {
          type: "trigger",
          title: "Daily at 3:45 PM",
          description: "Collects submitted digital exit tickets from the end-of-period prompt."
        },
        {
          type: "ai_action",
          title: "Cluster student comprehension levels",
          description: "Categorizes responses into mastery, partial understanding, and common roadblocks."
        },
        {
          type: "action",
          title: "Suggest warm-up adjustments",
          description: "Drafts three 5-minute review questions for tomorrow's opening routine."
        }
      ]
    };
  }

  // Generic parsed prompt
  else {
    const cleanTitle = prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt;
    const detectedIntegration = detectUniversalIntegration(prompt);

    workflow = {
      name: cleanTitle,
      summary: `Automates workflow based on teacher request: "${prompt}"`,
      integration: detectedIntegration,
      steps: [
        {
          type: "trigger",
          title: "Scheduled or event-based trigger",
          description: `Monitors ${detectedIntegration.service} events matching your instructions.`
        },
        {
          type: "ai_action",
          title: "AI Analysis & Synthesis",
          description: "Processes data with strict privacy safeguards and pedagogical intent."
        },
        {
          type: "action",
          title: "Draft educator review package",
          description: "Prepares output for teacher approval before any message or record is finalized."
        }
      ]
    };
  }

  // --- UNIVERSAL CREDENTIAL VAULT CHECK ---
  // If the user already authenticated this service in any previous automation,
  // automatically mark it as connected so they don't have to re-enter keys or re-auth!
  if (workflow.integration) {
    const vault = isServiceConnectedInVault(workflow.integration.service);
    if (vault.connected) {
      workflow.integration.connected = true;
      if (vault.config?.accountName) {
        workflow.integration.accountName = vault.config.accountName;
      }
    }
  }

  return workflow;
}

export interface ConvertPromptOptions {
  apiEndpoint?: string;
  signal?: AbortSignal;
}

/**
 * API abstraction for converting a teacher's natural-language request into structured workflow JSON.
 * Validates the AI response before returning. Automatically falls back to mock generator if no backend is reachable.
 */
export async function convertPromptToWorkflow(
  prompt: string,
  options?: ConvertPromptOptions
): Promise<WorkflowData> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error('Prompt cannot be empty. Please describe what repetitive task you would like to automate.');
  }

  const endpoint = options?.apiEndpoint || (typeof window !== 'undefined' ? (window as any).__CLASSFLOW_API_ENDPOINT__ : null);

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmed }),
        signal: options?.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const rawJson = await response.json();

      if (validateWorkflowResponse(rawJson)) {
        return rawJson;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.info('Backend API unavailable. Using client universal mock abstraction:', err.message);
    }
  }

  // Simulate realistic AI generation latency (1200ms)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const generated = generateIntelligentMockWorkflow(trimmed);

  if (!validateWorkflowResponse(generated)) {
    throw new Error('Generated workflow failed internal schema validation.');
  }

  return generated;
}
