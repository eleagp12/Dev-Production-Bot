// src/bot.ts

import { PrismaClient } from '@prisma/client';
import { CommandRegistry } from './commands/base/CommandRegistry';
import { AddTodoCommand } from './commands/todo/AddTodoCommand';
import { ListTodoCommand } from './commands/todo/ListTodoCommand';
import { DoneTodoCommand } from './commands/todo/DoneTodoCommand';
import { TaskService } from './services/TaskService';
import { CommandResponse } from './types/commands.types';
import { parseCommand, formatResponse } from './utils/parser';
import { logger } from './utils/logger';

/**
 * DevProductivityBot - Main bot orchestrator
 *
 * Responsibilities:
 * - Initialize services and commands
 * - Route commands to appropriate handlers
 * - Manage database connections
 */
export class DevProductivityBot {
  private prisma: PrismaClient;
  private commandRegistry: CommandRegistry;
  private taskService: TaskService;

  constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize services
    this.taskService = new TaskService(this.prisma);

    // Initialize command registry
    this.commandRegistry = new CommandRegistry();

    // Register commands
    this.registerCommands();

    logger.info('DevProductivityBot initialized successfully');
  }

  /**
   * Register all commands
   */
  private registerCommands(): void {
    // Todo commands
    this.commandRegistry.register(new AddTodoCommand(this.taskService));
    this.commandRegistry.register(new ListTodoCommand(this.taskService));
    this.commandRegistry.register(new DoneTodoCommand(this.taskService));

    // Future commands can be registered here:
    // - Focus commands
    // - Reminder commands
    // - Stats commands
  }

  /**
   * Process a command input
   */
  async processCommand(input: string): Promise<CommandResponse> {
    try {
      logger.info(`Processing command: ${input}`);

      // Parse command
      const { command, subcommand, context } = parseCommand(input);

      // Build full command name
      const fullCommandName = subcommand ? `${command}-${subcommand}` : command;

      // Execute command
      const response = await this.commandRegistry.execute(fullCommandName, context);

      logger.info(`Command processed: ${fullCommandName}`, { success: response.success });

      return response;
    } catch (error) {
      logger.error('Error processing command:', error);

      return {
        success: false,
        message: 'Failed to process command',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get help text
   */
  getHelp(): string {
    return this.commandRegistry.getHelpText();
  }

  /**
   * Get help for specific command
   */
  getCommandHelp(commandName: string): string {
    return this.commandRegistry.getCommandHelp(commandName);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Database connection closed');
  }
}
