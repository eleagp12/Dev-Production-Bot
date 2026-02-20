// src/services/FocusService.ts

import { PrismaClient } from '@prisma/client';
import type { FocusSession as PrismaFocusSession } from '@prisma/client';
import { FocusSession, FocusStats, CreateFocusSessionDTO } from '../types/services.types';
import { logger } from '../utils/logger';

export class FocusService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async startSession(dto: CreateFocusSessionDTO): Promise<FocusSession> {
    logger.info('Starting focus session', { duration: dto.duration });

    const activeSession = await this.getActiveSession();
    if (activeSession) {
      throw new Error('A focus session is already in progress');
    }

    try {
      const session = await this.prisma.focusSession.create({
        data: {
          duration: dto.duration,
          breakTime: dto.breakTime || 5,
          startedAt: new Date(),
        },
      });

      logger.info(`Focus session started: ${session.id}`);
      return this.mapToFocusSession(session);
    } catch (error) {
      logger.error('Failed to start focus session:', error);
      throw new Error('Failed to start focus session');
    }
  }

  async stopSession(interrupted = false): Promise<FocusSession> {
    logger.info('Stopping focus session', { interrupted });

    const activeSession = await this.getActiveSession();
    if (!activeSession) {
      throw new Error('No active focus session found');
    }

    try {
      const session = await this.prisma.focusSession.update({
        where: { id: activeSession.id },
        data: { completedAt: new Date(), interrupted },
      });

      logger.info(`Focus session completed: ${session.id}`);
      return this.mapToFocusSession(session);
    } catch (error) {
      logger.error('Failed to stop focus session:', error);
      throw new Error('Failed to stop focus session');
    }
  }

  async getActiveSession(): Promise<FocusSession | null> {
    try {
      const session = await this.prisma.focusSession.findFirst({
        where: { completedAt: null },
        orderBy: { startedAt: 'desc' },
      });

      return session ? this.mapToFocusSession(session) : null;
    } catch (error) {
      logger.error('Failed to get active session:', error);
      return null;
    }
  }

  async getSessionById(id: number): Promise<FocusSession | null> {
    try {
      const session = await this.prisma.focusSession.findUnique({ where: { id } });
      return session ? this.mapToFocusSession(session) : null;
    } catch (error) {
      logger.error(`Failed to get session ${id}:`, error);
      return null;
    }
  }

  async getAllSessions(limit?: number): Promise<FocusSession[]> {
    try {
      const sessions = await this.prisma.focusSession.findMany({
        orderBy: { startedAt: 'desc' },
        ...(limit && { take: limit }),
      });

      return sessions.map((s: PrismaFocusSession) => this.mapToFocusSession(s));
    } catch (error) {
      logger.error('Failed to get sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  async getStats(days?: number): Promise<FocusStats> {
    try {
      const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : undefined;

      const sessions = await this.prisma.focusSession.findMany({
        where: { ...(startDate && { startedAt: { gte: startDate } }) },
      });

      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.completedAt && !s.interrupted);

      const totalMinutes = completedSessions.reduce((sum, s) => {
        if (s.completedAt) {
          return sum + Math.floor((s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60));
        }
        return sum;
      }, 0);

      const averageSessionLength =
        completedSessions.length > 0 ? Math.floor(totalMinutes / completedSessions.length) : 0;

      const completionRate =
        totalSessions > 0 ? Math.floor((completedSessions.length / totalSessions) * 100) : 0;

      const { longestStreak, currentStreak } = this.calculateStreaks(sessions);

      return {
        totalSessions,
        totalMinutes,
        averageSessionLength,
        completionRate,
        longestStreak,
        currentStreak,
      };
    } catch (error) {
      logger.error('Failed to get stats:', error);
      throw new Error('Failed to get statistics');
    }
  }

  private calculateStreaks(sessions: PrismaFocusSession[]): {
    longestStreak: number;
    currentStreak: number;
  } {
    if (sessions.length === 0) return { longestStreak: 0, currentStreak: 0 };

    const sorted = [...sessions]
      .filter(s => s.completedAt && !s.interrupted)
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

    let longestStreak = 0;
    let currentStreakCount = 0;
    let lastDate: Date | null = null;

    for (const session of sorted) {
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const daysDiff = Math.floor(
          (sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 1) {
          currentStreakCount++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      } else {
        currentStreakCount = 1;
      }

      lastDate = sessionDate;
    }

    longestStreak = Math.max(longestStreak, currentStreakCount);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysSinceLast = lastDate
      ? Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const currentStreak = daysSinceLast <= 1 ? currentStreakCount : 0;

    return { longestStreak, currentStreak };
  }

  private mapToFocusSession(session: PrismaFocusSession): FocusSession {
    return {
      id: session.id,
      duration: session.duration,
      breakTime: session.breakTime,
      startedAt: session.startedAt,
      completedAt: session.completedAt ?? undefined,
      interrupted: session.interrupted,
      notes: session.notes ?? undefined,
    };
  }
}
