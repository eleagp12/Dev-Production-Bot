// src/commands/todo/AddTodoCommand.ts

import { Command } from "../base/Command";
import { CommandContext, CommandResponse } from "../../types/commands.types";
import { TaskService } from "../../services/TaskService";
import { Priority } from "../../types/services.types";
import { logger } from "../../utils/logger";

/**
 * AddTodoCommand - Create a new task
 *
 * Usage: /todo add "Task title" [options]
 * Options:
 *   --priority, -p: low, medium, high
 *   --due, -d: YYYY-MM-DD
 *   --tags, -t: comma-separated tags
 *   --description: task description
 */
export class AddTodoCommand extends Command {
  readonly name = "todo-add";
  readonly description = "Add a new task to your todo list";
  readonly usage =
    '/todo add "<title>" [--priority=high] [--due=2024-12-31] [--tags=urgent,backend]';
  readonly examples = [
    '/todo add "Implement user authentication"',
    '/todo add "Fix bug in payment" --priority=high --due=2024-12-15',
    '/todo add "Refactor API" --tags=backend,cleanup --priority=medium',
    '/todo add "Write documentation" --description="Update API docs with new endpoints"',
  ];

  private taskService: TaskService;

  constructor(taskService: TaskService) {
    super();
    this.taskService = taskService;
  }

  /**
   * Validate command input
   */
  validate(context: CommandContext): boolean {
    const title = context.args.get("title") || context.args.get("0");

    if (!title || typeof title !== "string") {
      return false;
    }

    if (title.trim().length === 0) {
      return false;
    }

    // Validate priority if provided
    const priority = context.args.get("priority") || context.args.get("p");
    if (priority && !["low", "medium", "high"].includes(priority as string)) {
      return false;
    }

    return true;
  }

  /**
   * Execute the command
   */
  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      // Extract title (can be positional or named argument)
      const title = (context.args.get("title") ||
        context.args.get("0")) as string;

      // Extract optional arguments
      const description = context.args.get("description") as string | undefined;

      const priorityStr = (context.args.get("priority") ||
        context.args.get("p")) as string | undefined;
      const priority = priorityStr
        ? this.parsePriority(priorityStr)
        : Priority.MEDIUM;

      const dueStr = (context.args.get("due") || context.args.get("d")) as
        | string
        | undefined;
      const dueDate = dueStr ? this.parseDate(dueStr) : undefined;

      const tagsStr = (context.args.get("tags") || context.args.get("t")) as
        | string
        | undefined;
      const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()) : [];

      // Create task
      const task = await this.taskService.createTask({
        title: title.trim(),
        description,
        priority,
        dueDate,
        tags,
      });

      // Format response
      const message = this.formatTaskCreated(task);

      return this.success(message, task);
    } catch (error) {
      logger.error("Error in AddTodoCommand:", error);
      return this.error(
        "Failed to create task",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  /**
   * Parse priority string to Priority enum
   */
  private parsePriority(priorityStr: string): Priority {
    const normalized = priorityStr.toLowerCase();
    switch (normalized) {
      case "low":
        return Priority.LOW;
      case "high":
        return Priority.HIGH;
      case "medium":
      default:
        return Priority.MEDIUM;
    }
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date {
    // Support formats: YYYY-MM-DD, tomorrow, today
    const lower = dateStr.toLowerCase();

    if (lower === "today") {
      return new Date();
    }

    if (lower === "tomorrow") {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    }

    // Try parsing as ISO date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Invalid date format: ${dateStr}. Use YYYY-MM-DD, "today", or "tomorrow"`,
      );
    }

    return date;
  }

  /**
   * Format task created message
   */
  private formatTaskCreated(task: any): string {
    let message = `✅ Task created successfully!\n\n`;
    message += `**ID:** ${task.id}\n`;
    message += `**Title:** ${task.title}\n`;
    message += `**Priority:** ${this.formatPriority(task.priority)}\n`;
    message += `**Status:** ${task.status}\n`;

    if (task.description) {
      message += `**Description:** ${task.description}\n`;
    }

    if (task.dueDate) {
      message += `**Due:** ${this.formatDate(task.dueDate)}\n`;
    }

    if (task.tags && task.tags.length > 0) {
      message += `**Tags:** ${task.tags.join(", ")}\n`;
    }

    return message;
  }

  /**
   * Format priority with emoji
   */
  private formatPriority(priority: Priority): string {
    const icons = {
      [Priority.LOW]: "🟢 Low",
      [Priority.MEDIUM]: "🟡 Medium",
      [Priority.HIGH]: "🔴 High",
    };
    return icons[priority];
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  }
}
