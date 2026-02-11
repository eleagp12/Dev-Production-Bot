// src/commands/todo/DeleteTodoCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { TaskService } from '../../services/TaskService';
import { logger } from '../../utils/logger';

/**
 * DeleteTodoCommand - Delete a task
 *
 * Usage: /todo delete <id>
 */
export class DeleteTodoCommand extends Command {
  readonly name = 'todo-delete';
  readonly description = 'Delete a task';
  readonly usage = '/todo delete <task_id>';
  readonly examples = ['/todo delete 1', '/todo delete 42'];

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

      // Store task info before deletion
      const taskTitle = existingTask.title;

      // Delete the task
      await this.taskService.deleteTask(id);

      const message = `🗑️ **Task Deleted**\n\n` + `**ID:** ${id}\n` + `**Title:** ${taskTitle}`;

      return this.success(message);
    } catch (error) {
      logger.error('Error in DeleteTodoCommand:', error);
      return this.error(
        'Failed to delete task',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
