// src/commands/todo/DoneTodoCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { TaskService } from '../../services/TaskService';
import { logger } from '../../utils/logger';

/**
 * DoneTodoCommand - Mark a task as completed
 *
 * Usage: /todo done <id>
 */
export class DoneTodoCommand extends Command {
  readonly name = 'todo-done';
  readonly description = 'Mark a task as completed';
  readonly usage = '/todo done <task_id>';
  readonly examples = ['/todo done 1', '/todo done 42'];

  private taskService: TaskService;

  constructor(taskService: TaskService) {
    super();
    this.taskService = taskService;
  }

  /**
   * Validate command input
   */
  validate(context: CommandContext): boolean {
    const id = context.args.get('id') || context.args.get('0');

    if (!id) {
      return false;
    }

    // Check if ID is a valid number
    const numId = typeof id === 'number' ? id : parseInt(id as string);
    if (isNaN(numId) || numId <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Execute the command
   */
  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      // Extract task ID
      const idArg = context.args.get('id') || context.args.get('0');
      const id = typeof idArg === 'number' ? idArg : parseInt(idArg as string);

      // Check if task exists
      const existingTask = await this.taskService.getTaskById(id);
      if (!existingTask) {
        return this.error(`Task ${id} not found`);
      }

      // Complete the task
      const task = await this.taskService.completeTask(id);

      const message =
        `✅ **Task Completed!**\n\n` +
        `**ID:** ${task.id}\n` +
        `**Title:** ${task.title}\n` +
        `**Completed at:** ${this.formatDateTime(task.completedAt!)}`;

      return this.success(message, task);
    } catch (error) {
      logger.error('Error in DoneTodoCommand:', error);
      return this.error(
        'Failed to complete task',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Format date and time
   */
  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
}
