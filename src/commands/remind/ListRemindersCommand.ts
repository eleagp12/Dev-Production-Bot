// src/commands/remind/ListRemindersCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { ReminderService } from '../../services/ReminderService';
import { ReminderFrequency } from '../../types/services.types';
import { logger } from '../../utils/logger';

/**
 * ListRemindersCommand - List all active reminders
 *
 * Usage: /remind list [--all]
 */
export class ListRemindersCommand extends Command {
  readonly name = 'remind-list';
  readonly description = 'List all reminders';
  readonly usage = '/remind list [--all]';
  readonly examples = ['/remind list', '/remind list --all'];

  private reminderService: ReminderService;

  constructor(reminderService: ReminderService) {
    super();
    this.reminderService = reminderService;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const showAll = context.args.has('all');

      const reminders = showAll
        ? await this.reminderService.getAllReminders()
        : await this.reminderService.getActiveReminders();

      if (reminders.length === 0) {
        return this.success(
          `📭 No ${showAll ? '' : 'active '}reminders found.\n\n` +
            `Create one with \`/remind create "message" at <time>\``
        );
      }

      // Separate active and inactive
      const active = reminders.filter(r => r.active);
      const inactive = reminders.filter(r => !r.active);

      let message = `⏰ **Your Reminders** (${reminders.length})\n\n`;

      // Active reminders
      if (active.length > 0) {
        message += `**📌 Active** (${active.length})\n`;
        active.forEach(reminder => {
          message += this.formatReminder(reminder);
        });
        message += '\n';
      }

      // Inactive reminders (if showing all)
      if (showAll && inactive.length > 0) {
        message += `**✓ Completed** (${inactive.length})\n`;
        inactive.forEach(reminder => {
          message += this.formatReminder(reminder);
        });
      }

      message += `\nUse \`/remind cancel <id>\` to cancel a reminder.`;

      return this.success(message, { reminders, count: reminders.length });
    } catch (error) {
      logger.error('Error in ListRemindersCommand:', error);
      return this.error(
        'Failed to list reminders',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Format single reminder
   */
  private formatReminder(reminder: any): string {
    const now = new Date();
    const scheduled = new Date(reminder.scheduledFor);
    const isPast = scheduled < now;
    const isUpcoming = scheduled > now && scheduled.getTime() - now.getTime() < 24 * 60 * 60 * 1000;

    let item = `  [${reminder.id}] ${reminder.message}`;

    // Status indicator
    if (!reminder.active) {
      item += ` ✓`;
    } else if (isPast) {
      item += ` ⚠️ OVERDUE`;
    } else if (isUpcoming) {
      item += ` 🔔 SOON`;
    }

    // Time
    item += `\n      📅 ${this.formatDateTime(scheduled)}`;

    // Recurring badge
    if (reminder.recurring && reminder.frequency) {
      item += ` ${this.getRecurringBadge(reminder.frequency)}`;
    }

    item += '\n';
    return item;
  }

  /**
   * Get recurring badge
   */
  private getRecurringBadge(freq: ReminderFrequency): string {
    const badges = {
      [ReminderFrequency.DAILY]: '🔄 Daily',
      [ReminderFrequency.WEEKLY]: '🔄 Weekly',
      [ReminderFrequency.MONTHLY]: '🔄 Monthly',
    };
    return badges[freq];
  }

  /**
   * Format date and time
   */
  private formatDateTime(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));

    // If within 24 hours, show relative time
    if (diffHours >= 0 && diffHours < 24) {
      const diffMinutes = Math.floor(diff / (1000 * 60));
      if (diffMinutes < 60) {
        return `in ${diffMinutes} min`;
      }
      return `in ${diffHours}h`;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}
