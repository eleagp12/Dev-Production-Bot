// src/services/StatsService.ts

import { PrismaClient } from '@prisma/client';
import { ProductivitySummary } from '../types/services.types';
import { logger } from '../utils/logger';

/**
 * StatsService - Comprehensive productivity analytics
 *
 * Combines data from:
 * - Tasks (completion, priority distribution)
 * - Focus sessions (time spent, completion rate)
 * - Reminders (upcoming, completed)
 */
export class StatsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get productivity summary for a period
   */
  async getProductivitySummary(
    period: 'day' | 'week' | 'month',
    date?: Date
  ): Promise<ProductivitySummary> {
    logger.info(`Getting ${period} productivity summary`);

    const { startDate, endDate } = this.calculateDateRange(period, date);

    try {
      // Get task stats
      const tasks = await this.prisma.task.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      });

      const completedTasks = tasks.filter(t => t.completedAt && t.completedAt <= endDate);

      // Get focus session stats
      const focusSessions = await this.prisma.focusSession.findMany({
        where: {
          startedAt: { gte: startDate, lte: endDate },
        },
      });

      const completedSessions = focusSessions.filter(s => s.completedAt && !s.interrupted);

      const totalFocusMinutes = completedSessions.reduce((sum, s) => {
        if (s.completedAt) {
          return sum + Math.floor((s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60));
        }
        return sum;
      }, 0);

      const averageSessionLength =
        completedSessions.length > 0 ? Math.floor(totalFocusMinutes / completedSessions.length) : 0;

      // Calculate completion rate
      const completionRate =
        tasks.length > 0 ? Math.floor((completedTasks.length / tasks.length) * 100) : 0;

      // Calculate productivity score (0-100)
      const productivityScore = this.calculateProductivityScore(
        completedTasks.length,
        tasks.length,
        totalFocusMinutes,
        completedSessions.length
      );

      // Get top tags
      const tagCounts = new Map<string, number>();
      completedTasks.forEach(task => {
        task.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      });

      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

      return {
        period,
        tasksCompleted: completedTasks.length,
        tasksCreated: tasks.length,
        completionRate,
        totalFocusMinutes,
        totalFocusSessions: focusSessions.length,
        averageSessionLength,
        productivityScore,
        topTags,
      };
    } catch (error) {
      logger.error('Failed to get productivity summary:', error);
      throw new Error('Failed to get productivity summary');
    }
  }

  /**
   * Get daily breakdown for a period
   */
  async getDailyBreakdown(startDate: Date, endDate: Date) {
    try {
      const days: any[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Tasks completed this day
        const tasksCompleted = await this.prisma.task.count({
          where: {
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        });

        // Focus minutes this day
        const focusSessions = await this.prisma.focusSession.findMany({
          where: {
            startedAt: { gte: dayStart, lte: dayEnd },
            completedAt: { not: null },
            interrupted: false,
          },
        });

        const focusMinutes = focusSessions.reduce((sum, s) => {
          if (s.completedAt) {
            return (
              sum + Math.floor((s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60))
            );
          }
          return sum;
        }, 0);

        days.push({
          date: new Date(currentDate),
          tasksCompleted,
          focusMinutes,
          focusSessions: focusSessions.length,
          productivityScore: this.calculateProductivityScore(
            tasksCompleted,
            tasksCompleted,
            focusMinutes,
            focusSessions.length
          ),
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return days;
    } catch (error) {
      logger.error('Failed to get daily breakdown:', error);
      return [];
    }
  }

  /**
   * Get insights and recommendations
   */
  async getInsights(period: 'week' | 'month'): Promise<string[]> {
    const insights: string[] = [];

    try {
      const { startDate, endDate } = this.calculateDateRange(period);

      // Task insights
      const tasks = await this.prisma.task.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
      });

      const overdueTasks = tasks.filter(
        t => t.dueDate && t.dueDate < new Date() && t.status === 'PENDING'
      );

      if (overdueTasks.length > 0) {
        insights.push(`⚠️ You have ${overdueTasks.length} overdue tasks`);
      }

      const highPriorityPending = tasks.filter(
        t => t.priority === 'HIGH' && t.status === 'PENDING'
      );

      if (highPriorityPending.length > 0) {
        insights.push(`🔴 ${highPriorityPending.length} high-priority tasks need attention`);
      }

      // Focus insights
      const focusSessions = await this.prisma.focusSession.findMany({
        where: { startedAt: { gte: startDate, lte: endDate } },
      });

      const avgDaily =
        focusSessions.length > 0 ? focusSessions.length / (period === 'week' ? 7 : 30) : 0;

      if (avgDaily < 1) {
        insights.push('💡 Try to complete at least one focus session daily');
      } else if (avgDaily >= 3) {
        insights.push("🌟 Great job! You're maintaining excellent focus habits");
      }

      // Completion rate insight
      const completed = tasks.filter(t => t.status === 'COMPLETED');
      const rate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

      if (rate < 50) {
        insights.push('📊 Consider breaking down tasks into smaller, manageable pieces');
      } else if (rate >= 80) {
        insights.push('🎯 Excellent task completion rate! Keep it up!');
      }

      return insights;
    } catch (error) {
      logger.error('Failed to get insights:', error);
      return ['Unable to generate insights at this time'];
    }
  }

  /**
   * Calculate productivity score (0-100)
   */
  private calculateProductivityScore(
    completedTasks: number,
    totalTasks: number,
    focusMinutes: number,
    focusSessions: number
  ): number {
    // Task completion weight: 40%
    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;

    // Focus time weight: 40% (target: 120 min/day)
    const focusScore = Math.min((focusMinutes / 120) * 40, 40);

    // Focus sessions weight: 20% (target: 3 sessions/day)
    const sessionScore = Math.min((focusSessions / 3) * 20, 20);

    return Math.floor(taskScore + focusScore + sessionScore);
  }

  /**
   * Calculate date range for period
   */
  private calculateDateRange(
    period: 'day' | 'week' | 'month',
    date?: Date
  ): { startDate: Date; endDate: Date } {
    const now = date || new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }
}
