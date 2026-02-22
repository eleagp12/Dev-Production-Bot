// src/commands/remind/CancelReminderCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { ReminderService } from '../../services/ReminderService';
import { logger } from '../../utils/logger';

/**
 * CancelReminderCommand - Cancel a reminder
 *
 * Usage: /remind cancel <id>
 */
export class CancelReminderCommand extends Command {
  readonly name = 'remind-cancel';
  readonly description = 'Cancel a reminder';
  readonly usage = '/remind cancel <reminder_id>';
  readonly examples = ['/remind cancel 1', '/remind cancel 5'];

  private reminderService: ReminderService;

  constructor(reminderService: ReminderService) {
    super();
    this.reminderService = reminderService;
  }

  validate(context: CommandContext): boolean {
    const id = context.args.get('id') || context.args.get('0');

    if (!id) {
      return false;
    }

    const numId = typeof id === 'number' ? id : parseInt(id as string);
    if (isNaN(numId) || numId <= 0) {
      return false;
    }

    return true;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const idArg = context.args.get('id') || context.args.get('0');
      const id = typeof idArg === 'number' ? idArg : parseInt(idArg as string);

      // Check if reminder exists
      const existing = await this.reminderService.getReminderById(id);
      if (!existing) {
        return this.error(`Reminder ${id} not found`);
      }

      if (!existing.active) {
        return this.error(`Reminder ${id} is already cancelled`);
      }

      // Cancel the reminder
      const reminder = await this.reminderService.cancelReminder(id);

      const message =
        `🗑️ **Reminder Cancelled**\n\n` +
        `**ID:** ${reminder.id}\n` +
        `**Message:** ${reminder.message}\n` +
        `**Was scheduled for:** ${this.formatDateTime(reminder.scheduledFor)}`;

      return this.success(message, reminder);
    } catch (error) {
      logger.error('Error in CancelReminderCommand:', error);
      return this.error(
        'Failed to cancel reminder',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}
