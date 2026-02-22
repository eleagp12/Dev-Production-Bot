// src/commands/remind/CreateReminderCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { ReminderService } from '../../services/ReminderService';
import { ReminderFrequency } from '../../types/services.types';
import { logger } from '../../utils/logger';

/**
 * CreateReminderCommand - Create a new reminder
 *
 * Usage: /remind create "<message>" <when> [--recurring=daily]
 * Examples:
 *   /remind create "Team meeting" at 2pm
 *   /remind create "Daily standup" at 9am --recurring=daily
 */
export class CreateReminderCommand extends Command {
  readonly name = 'remind-create';
  readonly description = 'Create a new reminder';
  readonly usage = '/remind create "<message>" <when> [--recurring=daily|weekly|monthly]';
  readonly examples = [
    '/remind create "Team meeting" at 2pm',
    '/remind create "Daily standup" at 9am --recurring=daily',
    '/remind create "Weekly review" tomorrow at 3pm --recurring=weekly',
    '/remind create "Submit report" --date=2024-12-31 --time=5pm',
  ];

  private reminderService: ReminderService;

  constructor(reminderService: ReminderService) {
    super();
    this.reminderService = reminderService;
  }

  validate(context: CommandContext): boolean {
    const message = context.args.get('message') || context.args.get('0');
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return false;
    }
    return true;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      // Extract message
      const message = (context.args.get('message') || context.args.get('0')) as string;

      // Parse time
      const scheduledFor = this.parseTime(context);
      if (!scheduledFor) {
        return this.error(
          'Invalid time format',
          'Use formats like: "at 2pm", "tomorrow at 9am", "--date=2024-12-31 --time=5pm"'
        );
      }

      // Check if time is in the past
      if (scheduledFor < new Date()) {
        return this.error('Cannot schedule reminder in the past');
      }

      // Parse recurring options
      const recurringArg = context.args.get('recurring') as string | undefined;
      const recurring = !!recurringArg;
      const frequency = recurringArg ? this.parseFrequency(recurringArg) : undefined;

      // Create reminder
      const reminder = await this.reminderService.createReminder({
        message: message.trim(),
        scheduledFor,
        recurring,
        frequency,
      });

      // Format response
      const responseMessage =
        `⏰ **Reminder Created!**\n\n` +
        `**Message:** ${reminder.message}\n` +
        `**Scheduled:** ${this.formatDateTime(reminder.scheduledFor)}\n` +
        (reminder.recurring
          ? `**Recurring:** ${this.formatFrequency(reminder.frequency!)}\n`
          : `**Type:** One-time\n`) +
        `**ID:** ${reminder.id}\n\n` +
        `Use \`/remind list\` to see all reminders.`;

      return this.success(responseMessage, reminder);
    } catch (error) {
      logger.error('Error in CreateReminderCommand:', error);
      return this.error(
        'Failed to create reminder',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Parse time from various formats
   */
  private parseTime(context: CommandContext): Date | null {
    // Check for explicit date/time args
    const dateArg = context.args.get('date') as string | undefined;
    const timeArg = context.args.get('time') as string | undefined;

    if (dateArg) {
      const date = new Date(dateArg);
      if (timeArg) {
        const time = this.parseTimeString(timeArg);
        if (time) {
          date.setHours(time.hours, time.minutes, 0, 0);
        }
      }
      return isNaN(date.getTime()) ? null : date;
    }

    // Parse natural language from raw input
    const rawInput = context.rawInput.toLowerCase();

    // "at <time>" pattern
    const atMatch = rawInput.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (atMatch) {
      const now = new Date();
      let hours = parseInt(atMatch[1]);
      const minutes = atMatch[2] ? parseInt(atMatch[2]) : 0;
      const meridiem = atMatch[3];

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const scheduled = new Date(now);
      scheduled.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduled < now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      return scheduled;
    }

    // "tomorrow at <time>" pattern
    if (rawInput.includes('tomorrow')) {
      const timeMatch = rawInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (timeMatch) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridiem = timeMatch[3];

        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;

        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow;
      }
    }

    // "in <N> minutes/hours/days" pattern
    const inMatch = rawInput.match(/in\s+(\d+)\s+(minute|hour|day)s?/i);
    if (inMatch) {
      const amount = parseInt(inMatch[1]);
      const unit = inMatch[2].toLowerCase();
      const scheduled = new Date();

      switch (unit) {
        case 'minute':
          scheduled.setMinutes(scheduled.getMinutes() + amount);
          break;
        case 'hour':
          scheduled.setHours(scheduled.getHours() + amount);
          break;
        case 'day':
          scheduled.setDate(scheduled.getDate() + amount);
          break;
      }

      return scheduled;
    }

    return null;
  }

  /**
   * Parse time string like "2pm", "14:30", "9:00am"
   */
  private parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  /**
   * Parse frequency string
   */
  private parseFrequency(freq: string): ReminderFrequency {
    const normalized = freq.toLowerCase();
    switch (normalized) {
      case 'daily':
      case 'day':
        return ReminderFrequency.DAILY;
      case 'weekly':
      case 'week':
        return ReminderFrequency.WEEKLY;
      case 'monthly':
      case 'month':
        return ReminderFrequency.MONTHLY;
      default:
        return ReminderFrequency.DAILY;
    }
  }

  /**
   * Format date and time
   */
  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  /**
   * Format frequency
   */
  private formatFrequency(freq: ReminderFrequency): string {
    const labels = {
      [ReminderFrequency.DAILY]: '📅 Daily',
      [ReminderFrequency.WEEKLY]: '📅 Weekly',
      [ReminderFrequency.MONTHLY]: '📅 Monthly',
    };
    return labels[freq];
  }
}
