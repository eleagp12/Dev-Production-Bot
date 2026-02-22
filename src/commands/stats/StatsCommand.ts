import { Command } from '../base/Command';
import { CommandContext, CommandResponse } from '../../types/commands.types';
import { StatsService } from '../../services/StatsService';
import { logger } from '../../utils/logger';

export class StatsCommand extends Command {
  readonly name = 'stats';
  readonly description = 'View productivity statistics and insights';
  readonly usage = '/stats [today|week|month]';
  readonly examples = [
    '/stats',
    '/stats --period=today',
    '/stats --period=week',
    '/stats --period=month',
  ];

  private statsService: StatsService;

  constructor(statsService: StatsService) {
    super();
    this.statsService = statsService;
  }

  async execute(context: CommandContext): Promise<CommandResponse> {
    try {
      const periodArg =
        (context.args.get('period') as string) || (context.args.get('0') as string) || 'week';

      const period = this.parsePeriod(periodArg);

      const summary = await this.statsService.getProductivitySummary(period);
      const insights = await this.statsService.getInsights(period === 'day' ? 'week' : period);

      let message = `📊 **Productivity ${this.formatPeriodTitle(period)}**\n\n`;

      // Overview
      message += `**📈 Overview**\n`;
      message += `  Tasks Completed: **${summary.tasksCompleted}** / ${summary.tasksCreated}\n`;
      message += `  Completion Rate: **${summary.completionRate}%** ${this.getRatingEmoji(
        summary.completionRate
      )}\n`;
      message += `  Focus Time: **${this.formatDuration(summary.totalFocusMinutes)}**\n`;
      message += `  Focus Sessions: **${summary.totalFocusSessions}**\n`;
      if (summary.averageSessionLength > 0) {
        message += `  Avg Session: **${summary.averageSessionLength} min**\n`;
      }
      message += `\n`;

      // Productivity Score
      const scoreBar = this.generateProgressBar(summary.productivityScore);
      message += `**🎯 Productivity Score**\n`;
      message += `${scoreBar} **${summary.productivityScore}/100** ${this.getScoreEmoji(
        summary.productivityScore
      )}\n\n`;

      // Top Tags
      if (summary.topTags.length > 0) {
        message += `**🏷️ Top Categories**\n`;
        summary.topTags.forEach(({ tag, count }) => {
          message += `  ${tag}: ${count} tasks\n`;
        });
        message += `\n`;
      }

      // Insights
      if (insights.length > 0) {
        message += `**💡 Insights**\n`;
        insights.forEach(insight => {
          message += `  ${insight}\n`;
        });
      }

      return this.success(message, summary);
    } catch (error) {
      logger.error('Error in StatsCommand:', error);
      return this.error(
        'Failed to get statistics',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private parsePeriod(input: string): 'day' | 'week' | 'month' {
    const normalized = input.toLowerCase();
    if (normalized === 'today' || normalized === 'day') return 'day';
    if (normalized === 'month') return 'month';
    return 'week';
  }

  private formatPeriodTitle(period: 'day' | 'week' | 'month'): string {
    const titles = {
      day: 'Today',
      week: 'This Week',
      month: 'This Month',
    };
    return titles[period];
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
    if (rate >= 25) return '💪';
    return '📊';
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🏆';
    if (score >= 75) return '🌟';
    if (score >= 60) return '✨';
    if (score >= 40) return '💪';
    return '📈';
  }

  private generateProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}
