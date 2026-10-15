import { AutomationItem } from '../types';

export const initialAutomations: AutomationItem[] = [
  {
    id: 'auto-1',
    name: 'Weekly parent updates',
    triggerDescription: 'Every Friday at 3:00 PM',
    summary: 'Summarizes each student’s weekly milestones and drafts a warm guardian email.',
    status: 'active',
    lastRun: 'Ran 2 hours ago',
    iconName: 'Mail',
    tasksCompleted: 28,
    createdAt: '2026-04-12',
    steps: [
      {
        type: 'trigger',
        title: 'Every Friday at 3:00 PM',
        description: 'Checks this week’s submitted assignments and formative checks.'
      },
      {
        type: 'ai_action',
        title: 'Summarize student progress',
        description: 'Spots wins, gaps, and learning patterns across all student submissions.'
      },
      {
        type: 'action',
        title: 'Draft a parent update',
        description: 'Creates a warm, personalized email for each student’s guardians.'
      }
    ]
  },
  {
    id: 'auto-2',
    name: 'Missing work reminder',
    triggerDescription: 'Weekdays at 8:00 AM',
    summary: 'Scans the LMS queue for late submissions and compiles a morning homeroom check-in list.',
    status: 'active',
    lastRun: 'Ran yesterday',
    iconName: 'ClockAlert',
    tasksCompleted: 19,
    createdAt: '2026-04-20',
    steps: [
      {
        type: 'trigger',
        title: 'Weekdays at 8:00 AM',
        description: 'Evaluates assignments with past-due status in 6th Grade Math & Science.'
      },
      {
        type: 'ai_action',
        title: 'Synthesize overdue items',
        description: 'Categorizes missing items by student and checks for previous extensions.'
      },
      {
        type: 'action',
        title: 'Draft advisory summary',
        description: 'Prepares a student-by-student checklist ready for morning check-in.'
      }
    ]
  },
  {
    id: 'auto-3',
    name: 'Quiz feedback helper',
    triggerDescription: 'When a quiz is graded',
    summary: 'Analyzes individual problem errors and drafts encouraging, specific guidance for students.',
    status: 'draft',
    lastRun: 'Last edited May 18',
    iconName: 'GraduationCap',
    tasksCompleted: 0,
    createdAt: '2026-05-18',
    steps: [
      {
        type: 'trigger',
        title: 'When a quiz is graded',
        description: 'Monitors unit quiz uploads in the teacher gradebook.'
      },
      {
        type: 'ai_action',
        title: 'Diagnose misconceptions',
        description: 'Identifies which mathematical steps caused errors and highlights strong attempts.'
      },
      {
        type: 'action',
        title: 'Draft personalized feedback',
        description: 'Generates two targeted tips and one practice recommendation per learner.'
      }
    ]
  }
];
