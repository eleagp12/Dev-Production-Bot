// src/commands/focus/StopFocusCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { FocusService } from '../../services/FocusService';
import { logger } from '../../utils/logger';

/**
 * StopFocusCommand - Stop the current focus session
 *
 * Usage: /focus stop [--interrupted]
 */
export class StopFocusCommand extends Command {
  readonly name = 'focus-stop';
  readonly description = 'Stop the current focus session';
  readonly usage = '/focus stop [--interrupted]';
  readonly examples = ['/focus stop', '/focus stop --interrupted'];

  private focusService: FocusService;

  constructor(focusService: FocusService) {
    super();
    this.focusService = focusService;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const interrupted = context.args.has('interrupted');

      // Check if there's an active session
      const activeSession = await this.focusService.getActiveSession();
      if (!activeSession) {
        return this.error('No active focus session found', 'Use /focus start to begin one');
      }

      // Calculate elapsed time
      const elapsedMs = Date.now() - activeSession.startedAt.getTime();
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
      const completionPercent = Math.min(
        100,
        Math.floor((elapsedMinutes / activeSession.duration) * 100)
      );

      // Stop the session
      const session = await this.focusService.stopSession(interrupted);

      const statusEmoji = interrupted ? '⚠️' : '✅';
      const statusText = interrupted ? 'Interrupted' : 'Completed';

      const message =
        `${statusEmoji} **Focus Session ${statusText}!**\n\n` +
        `**Planned:** ${activeSession.duration} minutes\n` +
        `**Actual:** ${elapsedMinutes} minutes\n` +
        `**Completion:** ${completionPercent}%\n` +
        (interrupted
          ? `\n💡 Tip: Try to minimize interruptions next time!`
          : `\n🎉 Great work! Take a ${session.breakTime}-minute break.`);

      return this.success(message, session);
    } catch (error) {
      logger.error('Error in StopFocusCommand:', error);
      return this.error(
        'Failed to stop focus session',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
