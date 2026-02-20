// src/types/services.types.ts

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ReminderFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// ─── Task Types ───────────────────────────────────────────────────────────────

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ─── Focus Session Types ──────────────────────────────────────────────────────

export interface CreateFocusSessionDTO {
  duration: number;
  breakTime?: number;
}

export interface FocusSession {
  id: number;
  duration: number;
  breakTime: number;
  startedAt: Date;
  completedAt?: Date;
  interrupted: boolean;
  notes?: string;
}

export interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  completionRate: number;
  longestStreak: number;
  currentStreak: number;
}

// ─── Reminder Types ───────────────────────────────────────────────────────────

export interface CreateReminderDTO {
  message: string;
  scheduledFor: Date;
  recurring?: boolean;
  frequency?: ReminderFrequency;
}

export interface Reminder {
  id: number;
  message: string;
  scheduledFor: Date;
  recurring: boolean;
  frequency?: ReminderFrequency;
  active: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

// ─── Stats Types ──────────────────────────────────────────────────────────────

export interface ProductivityStats {
  date: Date;
  tasksCompleted: number;
  focusMinutes: number;
  focusSessions: number;
  productivityScore: number;
}

export interface StatsFilter {
  startDate: Date;
  endDate: Date;
}

export interface ProductivitySummary {
  period: 'day' | 'week' | 'month';
  tasksCompleted: number;
  tasksCreated: number;
  completionRate: number;
  totalFocusMinutes: number;
  totalFocusSessions: number;
  averageSessionLength: number;
  productivityScore: number;
  topTags: Array<{ tag: string; count: number }>;
  dailyBreakdown?: ProductivityStats[];
}
