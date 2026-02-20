// src/commands/focus/FocusStatsCommand.ts

import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { FocusService } from '../../services/FocusService';
import { logger } from '../../utils/logger';

/**
 * FocusStatsCommand - View focus session statistics
 *
 * Usage: /focus stats [--period=week]
 * Periods: today, week, month, all
 */
export class FocusStatsCommand extends Command {
  readonly name = 'focus-stats';
  readonly description = 'View focus session statistics';
  readonly usage = '/focus stats [--period=week]';
  readonly examples = [
    '/focus stats',
    '/focus stats --period=today',
    '/focus stats --period=week',
    '/focus stats --period=month',
  ];

  private focusService: FocusService;

  constructor(focusService: FocusService) {
    super();
    this.focusService = focusService;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const period = (context.args.get('period') as string) || 'week';
      const days = this.periodToDays(period);

      const stats = await this.focusService.getStats(days);
      const activeSession = await this.focusService.getActiveSession();

      let message = `📊 **Focus Statistics (${this.formatPeriod(period)})**\n\n`;

      // Active session banner
      if (activeSession) {
        const elapsed = Math.floor((Date.now() - activeSession.startedAt.getTime()) / (1000 * 60));
        const remaining = Math.max(0, activeSession.duration - elapsed);
        message += `⏱️ **Session in progress:** ${remaining} min remaining\n\n`;
      }

      if (stats.totalSessions === 0) {
        message += `No sessions found for this period.\nStart one with \`/focus start\`!`;
        return this.success(message, stats);
      }

      // Core stats
      message += `**📈 Overview**\n`;
      message += `  Total Sessions: **${stats.totalSessions}**\n`;
      message += `  Total Focus Time: **${this.formatDuration(stats.totalMinutes)}**\n`;
      message += `  Avg Session: **${stats.averageSessionLength} min**\n`;
      message += `  Completion Rate: **${stats.completionRate}%** ${this.getRatingEmoji(stats.completionRate)}\n\n`;

      // Streaks
      message += `**🔥 Streaks**\n`;
      message += `  Current Streak: **${stats.currentStreak} days**\n`;
      message += `  Longest Streak: **${stats.longestStreak} days**\n\n`;

      // Progress bar for completion rate
      const bar = this.generateProgressBar(stats.completionRate);
      message += `**Completion:** ${bar} ${stats.completionRate}%`;

      return this.success(message, stats);
    } catch (error) {
      logger.error('Error in FocusStatsCommand:', error);
      return this.error(
        'Failed to get focus statistics',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private periodToDays(period: string): number | undefined {
    switch (period.toLowerCase()) {
      case 'today':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'all':
        return undefined;
      default:
        return 7;
    }
  }

  private formatPeriod(period: string): string {
    const labels: Record<string, string> = {
      today: 'Today',
      week: 'Last 7 Days',
      month: 'Last 30 Days',
      all: 'All Time',
    };
    return labels[period] || 'Last 7 Days';
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  private getRatingEmoji(rate: number): string {
    if (rate >= 90) return '🌟';
    if (rate >= 75) return '✅';
    if (rate >= 50) return '👍';
    return '💪';
  }

  private generateProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}
