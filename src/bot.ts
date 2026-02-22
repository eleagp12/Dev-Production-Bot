// src/bot.ts - FINAL VERSION

import { PrismaClient } from '@prisma/client';
import { CommandRegistry } from './commands/base/CommandRegistry';

// Phase 2 - Todo commands
import { AddTodoCommand } from './commands/todo/AddTodoCommand';
import { ListTodoCommand } from './commands/todo/ListTodoCommand';
import { DoneTodoCommand } from './commands/todo/DoneTodoCommand';
import { DeleteTodoCommand } from './commands/todo/DeleteTodoCommand';

// Phase 3 - Focus commands
import { StartFocusCommand } from './commands/focus/StartFocusCommand';
import { StopFocusCommand } from './commands/focus/StopFocusCommand';
import { FocusStatsCommand } from './commands/focus/FocusStatsCommand';

// Phase 4 - Remind commands
import { CreateReminderCommand } from './commands/remind/CreateReminderCommand';
import { ListRemindersCommand } from './commands/remind/ListRemindersCommand';
import { CancelReminderCommand } from './commands/remind/CancelReminderCommand';

// Phase 5 - Stats command
import { StatsCommand } from './commands/stats/StatsCommand';

// Services
import { TaskService } from './services/TaskService';
import { FocusService } from './services/FocusService';
import { ReminderService } from './services/ReminderService';
import { StatsService } from './services/StatsService';

import { CommandResponse } from './types/commands.types';
import { parseCommand } from './utils/parser';
import { logger } from './utils/logger';

/**
 * DevProductivityBot - Complete Production Bot
 *
 * ✅ Phase 2: Todo Management
 * ✅ Phase 3: Focus Sessions
 * ✅ Phase 4: Reminders
 * ✅ Phase 5: Stats & Analytics
 *
 * Total: 11 Commands, 4 Services, Production Ready!
 */
export class DevProductivityBot {
  private prisma: PrismaClient;
  private commandRegistry: CommandRegistry;
  private taskService: TaskService;
  private focusService: FocusService;
  private reminderService: ReminderService;
  private statsService: StatsService;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Initialize all services
    this.taskService = new TaskService(this.prisma);
    this.focusService = new FocusService(this.prisma);
    this.reminderService = new ReminderService(this.prisma);
    this.statsService = new StatsService(this.prisma);

    // Command registry
    this.commandRegistry = new CommandRegistry();
    this.registerCommands();

    logger.info('🎉 DevProductivityBot initialized - ALL PHASES COMPLETE');
  }

  /**
   * Register all 11 commands
   */
  private registerCommands(): void {
    // Phase 2 - Todo commands (4)
    this.commandRegistry.register(new AddTodoCommand(this.taskService));
    this.commandRegistry.register(new ListTodoCommand(this.taskService));
    this.commandRegistry.register(new DoneTodoCommand(this.taskService));
    this.commandRegistry.register(new DeleteTodoCommand(this.taskService));

    // Phase 3 - Focus commands (3)
    this.commandRegistry.register(new StartFocusCommand(this.focusService));
    this.commandRegistry.register(new StopFocusCommand(this.focusService));
    this.commandRegistry.register(new FocusStatsCommand(this.focusService));

    // Phase 4 - Remind commands (3)
    this.commandRegistry.register(new CreateReminderCommand(this.reminderService));
    this.commandRegistry.register(new ListRemindersCommand(this.reminderService));
    this.commandRegistry.register(new CancelReminderCommand(this.reminderService));

    // Phase 5 - Stats command (1)
    this.commandRegistry.register(new StatsCommand(this.statsService));

    logger.info('✅ Registered 11 commands (4 todo + 3 focus + 3 remind + 1 stats)');
  }

  /**
   * Process a command input
   */
  async processCommand(input: string): Promise<CommandResponse> {
    try {
      logger.info(`Processing command: ${input}`);

      const { command, subcommand, context } = parseCommand(input);
      const fullCommandName = subcommand ? `${command}-${subcommand}` : command;
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

  getHelp(): string {
    return this.commandRegistry.getHelpText();
  }

  getCommandHelp(commandName: string): string {
    return this.commandRegistry.getCommandHelp(commandName);
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Database connection closed');
  }
}
