import { ActivityItem } from '../types';

export const mockActivityStats = {
  hoursSaved: '6.5 hours',
  hoursSavedSubtitle: 'saved this month',
  messagesDrafted: 42,
  messagesDraftedSubtitle: 'messages drafted',
  waitingReview: 24,
  waitingReviewSubtitle: 'items waiting for review',
};

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Weekly parent updates completed',
    description: 'Generated 24 individualized progress updates for Period 2 and Period 3 families. Ready in review inbox.',
    timestamp: 'Today at 3:00 PM',
    iconName: 'CheckCircle2',
    status: 'completed',
    meta: {
      studentCount: 24,
      timeSavedMinutes: 75,
      targetName: 'Period 2 & 3 Math',
    }
  },
  {
    id: 'act-2',
    title: 'Missing work reminder ran',
    description: 'Identified 5 students with overdue science lab reports. Homeroom advisory check-in list compiled.',
    timestamp: 'Yesterday at 8:00 AM',
    iconName: 'Clock',
    status: 'ran',
    meta: {
      studentCount: 5,
      timeSavedMinutes: 20,
      targetName: '6th Grade Science',
    }
  },
  {
    id: 'act-3',
    title: 'Quiz feedback helper edited',
    description: 'Updated feedback tone rules to emphasize positive problem-solving strategies before corrective hints.',
    timestamp: 'May 18 at 4:15 PM',
    iconName: 'FileEdit',
    status: 'edited',
    meta: {
      targetName: 'Fractions & Decimals Quiz',
    }
  },
  {
    id: 'act-4',
    title: 'Parent update approved',
    description: 'Approved and dispatched 18 weekly updates for Period 1 Math after a quick review pass.',
    timestamp: 'May 12 at 3:20 PM',
    iconName: 'Send',
    status: 'approved',
    meta: {
      studentCount: 18,
      timeSavedMinutes: 60,
      targetName: 'Period 1 Math',
    }
  }
];
