// src/commands/focus/StartFocusCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { FocusService } from '../../services/FocusService';
import { logger } from '../../utils/logger';

/**
 * StartFocusCommand - Start a Pomodoro focus session
 *
 * Usage: /focus start [duration] [--break=5]
 */
export class StartFocusCommand extends Command {
  readonly name = 'focus-start';
  readonly description = 'Start a focus session (Pomodoro timer)';
  readonly usage = '/focus start [duration] [--break=5]';
  readonly examples = ['/focus start', '/focus start 25', '/focus start 50 --break=10'];

  private focusService: FocusService;

  constructor(focusService: FocusService) {
    super();
    this.focusService = focusService;
  }

  validate(context: CommandContext): boolean {
    const duration = context.args.get('duration') || context.args.get('0');
    if (duration) {
      const num = typeof duration === 'number' ? duration : parseInt(duration as string);
      if (isNaN(num) || num < 1 || num > 240) return false;
    }
    return true;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const activeSession = await this.focusService.getActiveSession();
      if (activeSession) {
        const elapsed = Math.floor((Date.now() - activeSession.startedAt.getTime()) / (1000 * 60));
        return this.error(
          `⏱️ A focus session is already in progress!\n\n` +
            `**Duration:** ${activeSession.duration} minutes\n` +
            `**Elapsed:** ${elapsed} minutes\n` +
            `**Remaining:** ${Math.max(0, activeSession.duration - elapsed)} minutes\n\n` +
            `Use \`/focus stop\` to end it first.`
        );
      }

      const durationArg = context.args.get('duration') || context.args.get('0');
      const duration = durationArg
        ? typeof durationArg === 'number'
          ? durationArg
          : parseInt(durationArg as string)
        : 25;

      const breakArg = context.args.get('break') || context.args.get('b');
      const breakTime = breakArg
        ? typeof breakArg === 'number'
          ? breakArg
          : parseInt(breakArg as string)
        : 5;

      const session = await this.focusService.startSession({ duration, breakTime });
      const endTime = new Date(session.startedAt.getTime() + duration * 60 * 1000);

      const message =
        `🎯 **Focus Session Started!**\n\n` +
        `**Duration:** ${duration} minutes\n` +
        `**Break:** ${breakTime} minutes\n` +
        `**Started:** ${this.formatTime(session.startedAt)}\n` +
        `**Will end at:** ${this.formatTime(endTime)}\n\n` +
        `📌 Tips:\n` +
        `  • Minimize distractions\n` +
        `  • Focus on one task\n` +
        `  • Take your break after!\n\n` +
        `Use \`/focus stop\` when done.`;

      return this.success(message, session);
    } catch (error) {
      logger.error('Error in StartFocusCommand:', error);
      return this.error(
        'Failed to start focus session',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}
