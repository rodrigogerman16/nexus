import { toDateKey } from "@/lib/utils";
import type {
  ActivityItem,
  AppNotification,
  CalendarEvent,
  ChatMessage,
  Goal,
  Habit,
  Note,
  Project,
  Task,
} from "@/lib/store/types";

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};
const isoAt = (n: number, hour = 9, minute = 0) => {
  const d = daysFromNow(n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const seedProjects: Project[] = [
  {
    id: "proj_launch",
    name: "Product Launch",
    description: "Ship the v2 onboarding, pricing page, and launch-week comms.",
    color: "#ff6b3d",
    icon: "Rocket",
    status: "active",
    deadline: isoAt(6, 17, 0),
    isFavorite: true,
    lastAccessedAt: isoAt(0, 8, 30),
    createdAt: isoAt(-21),
  },
  {
    id: "proj_health",
    name: "Health & Fitness",
    description: "Half-marathon training block and weekly meal prep.",
    color: "#4cc98a",
    icon: "HeartPulse",
    status: "active",
    isFavorite: false,
    lastAccessedAt: isoAt(-1, 18, 0),
    createdAt: isoAt(-60),
  },
  {
    id: "proj_learning",
    name: "Learning",
    description: "Working through a reading list and a few deep-focus chapters.",
    color: "#6c6472",
    icon: "BookOpen",
    status: "active",
    isFavorite: true,
    lastAccessedAt: isoAt(-3, 20, 0),
    createdAt: isoAt(-45),
  },
  {
    id: "proj_home",
    name: "Home",
    description: "Small repairs and the apartment renovation punch list.",
    color: "#f0bc4e",
    icon: "Home",
    status: "planning",
    isFavorite: false,
    lastAccessedAt: isoAt(-8),
    createdAt: isoAt(-90),
  },
];

export const seedTasks: Task[] = [
  {
    id: "task_1",
    title: "Finalize onboarding flow copy",
    description: "Tighten up the microcopy for the first-run experience.",
    projectId: "proj_launch",
    status: "in_progress",
    priority: "high",
    dueDate: isoAt(0, 17, 0),
    estimatedDurationMinutes: 90,
    tags: ["copy", "ux"],
    position: 0,
    createdAt: isoAt(-3),
  },
  {
    id: "task_1a",
    title: "Rewrite empty states",
    parentTaskId: "task_1",
    projectId: "proj_launch",
    status: "completed",
    priority: "medium",
    estimatedDurationMinutes: 45,
    tags: [],
    position: 0,
    createdAt: isoAt(-2),
  },
  {
    id: "task_1b",
    title: "Get copy reviewed by Sam",
    parentTaskId: "task_1",
    projectId: "proj_launch",
    status: "todo",
    priority: "medium",
    tags: [],
    position: 1,
    createdAt: isoAt(-2),
  },
  {
    id: "task_2",
    title: "Review pricing page design",
    projectId: "proj_launch",
    status: "todo",
    priority: "medium",
    dueDate: isoAt(1, 12, 0),
    estimatedDurationMinutes: 45,
    tags: ["design"],
    position: 1,
    createdAt: isoAt(-2),
  },
  {
    id: "task_3",
    title: "Ship command palette keyboard nav",
    projectId: "proj_launch",
    status: "todo",
    priority: "critical",
    dueDate: isoAt(0, 15, 0),
    estimatedDurationMinutes: 120,
    tags: ["engineering"],
    position: 2,
    createdAt: isoAt(-1),
  },
  {
    id: "task_4",
    title: "Morning run — 5k",
    projectId: "proj_health",
    status: "todo",
    priority: "low",
    dueDate: isoAt(0, 7, 0),
    estimatedDurationMinutes: 30,
    tags: ["fitness"],
    position: 3,
    createdAt: isoAt(-5),
  },
  {
    id: "task_5",
    title: "Meal prep for the week",
    projectId: "proj_health",
    status: "todo",
    priority: "medium",
    dueDate: isoAt(2, 18, 0),
    estimatedDurationMinutes: 60,
    tags: ["food"],
    position: 4,
    createdAt: isoAt(-2),
  },
  {
    id: "task_6",
    title: "Finish 'Deep Work' chapter 4",
    projectId: "proj_learning",
    status: "in_progress",
    priority: "low",
    dueDate: isoAt(3, 20, 0),
    tags: ["reading"],
    position: 5,
    createdAt: isoAt(-6),
  },
  {
    id: "task_7",
    title: "Fix the leaking kitchen faucet",
    projectId: "proj_home",
    status: "todo",
    priority: "medium",
    dueDate: isoAt(1, 10, 0),
    tags: ["repair"],
    position: 6,
    createdAt: isoAt(-1),
  },
  {
    id: "task_8",
    title: "Book dentist appointment",
    projectId: "proj_home",
    status: "completed",
    priority: "low",
    dueDate: isoAt(-1, 9, 0),
    estimatedDurationMinutes: 30,
    tags: [],
    position: 7,
    createdAt: isoAt(-8),
  },
  {
    id: "task_9",
    title: "Draft investor update email",
    projectId: "proj_launch",
    status: "todo",
    priority: "high",
    dueDate: isoAt(0, 16, 0),
    estimatedDurationMinutes: 30,
    tags: ["writing"],
    position: 8,
    createdAt: isoAt(-1),
  },
  {
    id: "task_10",
    title: "Look into a standing desk for the home office",
    projectId: "proj_home",
    status: "inbox",
    priority: "low",
    tags: [],
    position: 9,
    createdAt: isoAt(0, 8, 15),
  },
];

export const seedNotes: Note[] = [
  {
    id: "note_1",
    title: "Launch week checklist",
    content: `# Launch Week Checklist

- [x] Finalize pricing tiers
- [x] Confirm press embargo date
- [ ] Record product demo video
- [ ] Prep support team FAQ doc
- [ ] Schedule social posts

> Keep the announcement thread focused on the *problem*, not the feature list.`,
    tags: ["launch", "planning"],
    pinned: true,
    createdAt: isoAt(-6),
    updatedAt: isoAt(-1),
  },
  {
    id: "note_2",
    title: "1:1 notes — Sam",
    content: `## Topics
- Roadmap prioritization for Q3
- Hiring plan for design team

## Action items
1. Share updated roadmap doc by Friday
2. Loop in recruiting on the senior designer req`,
    tags: ["meetings"],
    pinned: false,
    createdAt: isoAt(-4),
    updatedAt: isoAt(-4),
  },
  {
    id: "note_3",
    title: "Reading list",
    content: `- *Deep Work* — Cal Newport (in progress)
- *Shape Up* — Basecamp
- *The Design of Everyday Things* — Don Norman

Notes go here as I read...`,
    tags: ["personal", "books"],
    pinned: false,
    createdAt: isoAt(-10),
    updatedAt: isoAt(-2),
  },
  {
    id: "note_4",
    title: "Apartment renovation ideas",
    content: `## Kitchen
- Warm wood tones, matte black hardware
- Open shelving on the north wall

## Living room
- Swap the overhead lighting for a floor + table lamp combo
- Look into a low-profile sectional`,
    tags: ["home"],
    pinned: true,
    createdAt: isoAt(-12),
    updatedAt: isoAt(-3),
  },
];

export const seedEvents: CalendarEvent[] = [
  {
    id: "event_1",
    title: "Standup",
    start: isoAt(0, 9, 30),
    end: isoAt(0, 9, 45),
    color: "#6c6472",
  },
  {
    id: "event_2",
    title: "Design review — pricing page",
    start: isoAt(1, 11, 0),
    end: isoAt(1, 12, 0),
    color: "#ff6b3d",
  },
  {
    id: "event_3",
    title: "1:1 with Sam",
    start: isoAt(2, 14, 0),
    end: isoAt(2, 14, 30),
    color: "#4cc98a",
  },
  {
    id: "event_4",
    title: "Dentist appointment",
    start: isoAt(-1, 9, 0),
    end: isoAt(-1, 9, 30),
    color: "#f0bc4e",
  },
  {
    id: "event_5",
    title: "Investor update call",
    start: isoAt(0, 16, 30),
    end: isoAt(0, 17, 0),
    color: "#ff6b3d",
  },
  {
    id: "event_6",
    title: "Team offsite planning",
    start: isoAt(4, 10, 0),
    end: isoAt(4, 15, 0),
    color: "#6c6472",
  },
];

function habitCompletions(pattern: number[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  pattern.forEach((offset) => {
    map[toDateKey(daysFromNow(offset))] = true;
  });
  return map;
}

export const seedHabits: Habit[] = [
  {
    id: "habit_1",
    name: "Morning run",
    color: "#4cc98a",
    frequency: "daily",
    targetPerWeek: 5,
    completions: habitCompletions([-1, -2, -3, -5, -6]),
    createdAt: isoAt(-30),
  },
  {
    id: "habit_2",
    name: "Read 20 minutes",
    color: "#6c6472",
    frequency: "daily",
    targetPerWeek: 7,
    completions: habitCompletions([0, -1, -2, -3, -4, -5, -6]),
    createdAt: isoAt(-45),
  },
  {
    id: "habit_3",
    name: "No screens after 10pm",
    color: "#ff6b3d",
    frequency: "daily",
    targetPerWeek: 6,
    completions: habitCompletions([-1, -3, -4]),
    createdAt: isoAt(-20),
  },
  {
    id: "habit_4",
    name: "Meditate",
    color: "#f0bc4e",
    frequency: "daily",
    targetPerWeek: 4,
    completions: habitCompletions([-2, -6]),
    createdAt: isoAt(-15),
  },
];

export const seedGoals: Goal[] = [
  {
    id: "goal_1",
    title: "Run a half marathon",
    description: "Build up long-run distance and race in the fall.",
    progress: 62,
    targetDate: isoAt(75),
    linkedHabitIds: ["habit_1"],
  },
  {
    id: "goal_2",
    title: "Read 24 books this year",
    progress: 41,
    targetDate: isoAt(140),
    linkedHabitIds: ["habit_2"],
  },
  {
    id: "goal_3",
    title: "Ship the v2 product launch",
    description: "Get the new onboarding and pricing live.",
    progress: 78,
    targetDate: isoAt(6),
    linkedHabitIds: [],
  },
];

export const seedNotifications: AppNotification[] = [
  {
    id: "notif_1",
    type: "task_due",
    title: "\"Ship command palette keyboard nav\" is due today",
    body: "Due at 3:00 PM — Product Launch",
    isRead: false,
    createdAt: isoAt(0, 8, 0),
  },
  {
    id: "notif_2",
    type: "ai_suggestion",
    title: "NEXUS suggests blocking focus time",
    body: "You have a light gap before the investor call — want it blocked off?",
    isRead: false,
    createdAt: isoAt(0, 8, 2),
  },
  {
    id: "notif_3",
    type: "calendar_reminder",
    title: "Design review — pricing page starts in 1 hour",
    isRead: false,
    createdAt: isoAt(1, 10, 0),
  },
  {
    id: "notif_4",
    type: "project_update",
    title: "\"Product Launch\" is 78% complete",
    body: "3 tasks remaining before the deadline.",
    isRead: true,
    createdAt: isoAt(-1, 17, 30),
  },
  {
    id: "notif_5",
    type: "task_completed",
    title: "\"Book dentist appointment\" completed",
    isRead: true,
    createdAt: isoAt(-1, 9, 5),
  },
];

export const seedActivities: ActivityItem[] = [
  {
    id: "activity_1",
    type: "ai_briefing",
    description: "NEXUS generated your daily briefing",
    createdAt: isoAt(0, 8, 0),
  },
  {
    id: "activity_2",
    type: "task_completed",
    description: "Completed \"Book dentist appointment\"",
    projectId: "proj_home",
    taskId: "task_8",
    createdAt: isoAt(-1, 9, 5),
  },
  {
    id: "activity_3",
    type: "note_created",
    description: "Created note \"Apartment renovation ideas\"",
    projectId: "proj_home",
    createdAt: isoAt(-3, 11, 20),
  },
  {
    id: "activity_4",
    type: "project_updated",
    description: "Updated \"Product Launch\" deadline",
    projectId: "proj_launch",
    createdAt: isoAt(-1, 16, 40),
  },
  {
    id: "activity_5",
    type: "task_created",
    description: "Created task \"Draft investor update email\"",
    projectId: "proj_launch",
    taskId: "task_9",
    createdAt: isoAt(-1, 9, 10),
  },
  {
    id: "activity_6",
    type: "event_created",
    description: "Scheduled \"Team offsite planning\"",
    createdAt: isoAt(-2, 13, 0),
  },
  {
    id: "activity_7",
    type: "project_created",
    description: "Created project \"Product Launch\"",
    projectId: "proj_launch",
    createdAt: isoAt(-21, 9, 0),
  },
  {
    id: "activity_8",
    type: "task_completed",
    description: "Completed \"Rewrite empty states\"",
    projectId: "proj_launch",
    taskId: "task_1a",
    createdAt: isoAt(-2, 10, 30),
  },
];

export const seedChatMessages: ChatMessage[] = [
  {
    id: "msg_1",
    role: "assistant",
    content:
      "Morning. You've got 3 urgent items today, including the pricing page review at 11am tomorrow. Want a rundown of your day?",
    createdAt: isoAt(0, 8, 0),
  },
  {
    id: "msg_2",
    role: "user",
    content: "Yeah, give me the rundown.",
    createdAt: isoAt(0, 8, 1),
  },
  {
    id: "msg_3",
    role: "assistant",
    content:
      "Here's today at a glance:\n\n- **3 tasks due today** — onboarding copy, command palette keyboard nav, investor update email\n- **2 meetings** — standup at 9:30, investor call at 4:30\n- **Habits** — you're on a streak for reading, 1 more day locks in the week\n\nWant me to block focus time before the investor call?",
    createdAt: isoAt(0, 8, 2),
  },
];
