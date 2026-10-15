import { TemplateItem } from '../types';

export const mockTemplates: TemplateItem[] = [
  {
    id: 'tpl-1',
    category: 'communication',
    categoryLabel: 'Communication',
    title: 'Weekly family update',
    shortExplanation: 'Synthesizes weekly student wins and areas for growth into kind, personalized email drafts for parents.',
    prompt: 'Every Friday, summarize each student’s progress and draft a warm update for their parents.',
    iconName: 'Mail',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'Every Friday at 3:00 PM',
        description: 'Pulls weekly attendance, formative check-ins, and assignment submissions.'
      },
      {
        type: 'ai_action',
        title: 'Summarize student progress',
        description: 'Highlights key achievements, effort milestones, and specific focus areas.'
      },
      {
        type: 'action',
        title: 'Draft parent update',
        description: 'Prepares an individualized guardian email for teacher review and approval.'
      }
    ]
  },
  {
    id: 'tpl-2',
    category: 'assessment',
    categoryLabel: 'Assessment',
    title: 'Personalized quiz feedback',
    shortExplanation: 'Diagnoses specific question mistakes and creates encouraging, actionable tips for each student.',
    prompt: 'After a quiz is graded, generate personalized feedback and practice tips for every student.',
    iconName: 'GraduationCap',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'When a quiz is graded',
        description: 'Detects newly submitted scores and answer logs from your LMS.'
      },
      {
        type: 'ai_action',
        title: 'Diagnose misconceptions',
        description: 'Pinpoints conceptual hurdles without penalizing student voice.'
      },
      {
        type: 'action',
        title: 'Draft student comments',
        description: 'Writes 2 targeted sentences and attaches relevant review resources.'
      }
    ]
  },
  {
    id: 'tpl-3',
    category: 'student support',
    categoryLabel: 'Student support',
    title: 'Missing work check-in',
    shortExplanation: 'Detects incomplete assignments and drafts gentle, supportive check-in notes for homeroom or advisory.',
    prompt: 'Every morning, identify students with missing assignments and prepare a quiet check-in list.',
    iconName: 'ClockAlert',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'Weekdays at 8:00 AM',
        description: 'Audits student gradebooks for items missing more than 24 hours.'
      },
      {
        type: 'ai_action',
        title: 'Prioritize by urgency',
        description: 'Groups students who need direct 1-on-1 assistance vs. a simple reminder.'
      },
      {
        type: 'action',
        title: 'Draft advisory note',
        description: 'Builds a confidential checklist with tailored conversation starters.'
      }
    ]
  },
  {
    id: 'tpl-4',
    category: 'planning',
    categoryLabel: 'Planning',
    title: 'Lesson reflection',
    shortExplanation: 'Synthesizes student exit tickets to suggest quick review warm-ups for tomorrow’s lesson plan.',
    prompt: 'Every afternoon at 3:30 PM, summarize exit tickets and recommend a 5-minute warm-up for tomorrow.',
    iconName: 'BookOpen',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'Daily at 3:30 PM',
        description: 'Collects exit slip responses from classroom form submissions.'
      },
      {
        type: 'ai_action',
        title: 'Analyze student comprehension',
        description: 'Clusters student understanding into three distinct mastery bands.'
      },
      {
        type: 'action',
        title: 'Draft warm-up prompts',
        description: 'Produces three quick formative opening questions for tomorrow morning.'
      }
    ]
  },
  {
    id: 'tpl-5',
    category: 'assessment',
    categoryLabel: 'Assessment',
    title: 'Progress pattern finder',
    shortExplanation: 'Surfaces subtle trends in student participation, quiz trends, and sudden shifts in engagement.',
    prompt: 'Every two weeks, identify students showing declining engagement or sudden breakthroughs.',
    iconName: 'LineChart',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'Bi-weekly on Monday at 8:00 AM',
        description: 'Evaluates the last 14 days of classroom activity and scores.'
      },
      {
        type: 'ai_action',
        title: 'Detect subtle trend shifts',
        description: 'Flags positive spikes or quiet drop-offs across class periods.'
      },
      {
        type: 'action',
        title: 'Generate insights digest',
        description: 'Provides actionable talking points for department and counselor meetings.'
      }
    ]
  },
  {
    id: 'tpl-6',
    category: 'planning',
    categoryLabel: 'Planning',
    title: 'Monday morning brief',
    shortExplanation: 'Organizes the upcoming week’s deadlines, IEP accommodations, and lab prep into a calm 1-page overview.',
    prompt: 'Create a Monday morning summary of upcoming deadlines, IEP considerations, and student needs.',
    iconName: 'Calendar',
    suggestedSteps: [
      {
        type: 'trigger',
        title: 'Mondays at 7:15 AM',
        description: 'Connects to lesson calendar, roster flags, and department schedule.'
      },
      {
        type: 'ai_action',
        title: 'Map accommodations to lessons',
        description: 'Identifies which students require modified timing or assistive tools.'
      },
      {
        type: 'action',
        title: 'Compile teacher briefing',
        description: 'Prepares a clean, distraction-free morning dashboard card.'
      }
    ]
  }
];
