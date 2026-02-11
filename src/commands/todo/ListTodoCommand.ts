// src/commands/todo/ListTodoCommand.ts

import { Command } from "../base/Command";
import { CommandContext, CommandResponse } from "../../types/commands.types";
import { TaskService } from "../../services/TaskService";
import { TaskStatus, Priority } from "../../types/services.types";
import { logger } from "../../utils/logger";

/**
 * ListTodoCommand - List all tasks with optional filters
 *
 * Usage: /todo list [options]
 * Options:
 *   --status: pending, in_progress, completed, cancelled
 *   --priority: low, medium, high
 *   --tags: comma-separated tags
 */
export class ListTodoCommand extends Command {
  readonly name = "todo-list";
  readonly description = "List all tasks with optional filters";
  readonly usage =
    "/todo list [--status=pending] [--priority=high] [--tags=backend]";
  readonly examples = [
    "/todo list",
    "/todo list --status=pending",
    "/todo list --priority=high",
    "/todo list --tags=backend,urgent",
    "/todo list --status=pending --priority=high",
  ];

  private taskService: TaskService;

  constructor(taskService: TaskService) {
    super();
    this.taskService = taskService;
  }

  /**
   * Execute the command
   */
  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      // Extract filters
      const statusStr = context.args.get("status") as string | undefined;
      const status = statusStr ? this.parseStatus(statusStr) : undefined;

      const priorityStr = context.args.get("priority") as string | undefined;
      const priority = priorityStr
        ? this.parsePriority(priorityStr)
        : undefined;

      const tagsStr = context.args.get("tags") as string | undefined;
      const tags = tagsStr
        ? tagsStr.split(",").map((t) => t.trim())
        : undefined;

      // Get tasks
      const tasks = await this.taskService.getTasks({
        status,
        priority,
        tags,
      });

      if (tasks.length === 0) {
        return this.success("📭 No tasks found matching your filters");
      }

      // Format response
      const message = this.formatTaskList(tasks);

      return this.success(message, { tasks, count: tasks.length });
    } catch (error) {
      logger.error("Error in ListTodoCommand:", error);
      return this.error(
        "Failed to list tasks",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  /**
   * Parse status string to TaskStatus enum
   */
  private parseStatus(statusStr: string): TaskStatus {
    const normalized = statusStr.toUpperCase();
    switch (normalized) {
      case "PENDING":
        return TaskStatus.PENDING;
      case "IN_PROGRESS":
      case "INPROGRESS":
        return TaskStatus.IN_PROGRESS;
      case "COMPLETED":
        return TaskStatus.COMPLETED;
      case "CANCELLED":
        return TaskStatus.CANCELLED;
      default:
        throw new Error(`Invalid status: ${statusStr}`);
    }
  }

  /**
   * Parse priority string to Priority enum
   */
  private parsePriority(priorityStr: string): Priority {
    const normalized = priorityStr.toUpperCase();
    switch (normalized) {
      case "LOW":
        return Priority.LOW;
      case "MEDIUM":
        return Priority.MEDIUM;
      case "HIGH":
        return Priority.HIGH;
      default:
        throw new Error(`Invalid priority: ${priorityStr}`);
    }
  }

  /**
   * Format task list for display
   */
  private formatTaskList(tasks: any[]): string {
    let message = `📋 **Your Tasks** (${tasks.length})\n\n`;

    // Group by status
    const byStatus = {
      [TaskStatus.PENDING]: tasks.filter(
        (t) => t.status === TaskStatus.PENDING,
      ),
      [TaskStatus.IN_PROGRESS]: tasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS,
      ),
      [TaskStatus.COMPLETED]: tasks.filter(
        (t) => t.status === TaskStatus.COMPLETED,
      ),
      [TaskStatus.CANCELLED]: tasks.filter(
        (t) => t.status === TaskStatus.CANCELLED,
      ),
    };

    for (const [status, statusTasks] of Object.entries(byStatus)) {
      if (statusTasks.length === 0) continue;

      message += `**${this.formatStatus(status as TaskStatus)}** (${statusTasks.length})\n`;

      statusTasks.forEach((task) => {
        message += this.formatTaskItem(task);
      });

      message += "\n";
    }

    return message;
  }

  /**
   * Format single task item
   */
  private formatTaskItem(task: any): string {
    let item = `  ${this.getPriorityIcon(task.priority)} [${task.id}] ${task.title}`;

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const isOverdue =
        dueDate < new Date() && task.status !== TaskStatus.COMPLETED;

      if (isOverdue) {
        item += ` ⚠️ OVERDUE`;
      } else {
        item += ` 📅 ${this.formatShortDate(dueDate)}`;
      }
    }

    if (task.tags && task.tags.length > 0) {
      item += ` 🏷️ ${task.tags.join(", ")}`;
    }

    item += "\n";
    return item;
  }

  /**
   * Get priority icon
   */
  private getPriorityIcon(priority: Priority): string {
    const icons = {
      [Priority.LOW]: "🟢",
      [Priority.MEDIUM]: "🟡",
      [Priority.HIGH]: "🔴",
    };
    return icons[priority];
  }

  /**
   * Format status with emoji
   */
  private formatStatus(status: TaskStatus): string {
    const icons = {
      [TaskStatus.PENDING]: "⏳ Pending",
      [TaskStatus.IN_PROGRESS]: "🔄 In Progress",
      [TaskStatus.COMPLETED]: "✅ Completed",
      [TaskStatus.CANCELLED]: "❌ Cancelled",
    };
    return icons[status];
  }

  /**
   * Format date in short format
   */
  private formatShortDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  }
}
