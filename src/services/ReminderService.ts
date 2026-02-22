// src/services/ReminderService.ts

import { PrismaClient } from '@prisma/client';
import type { Reminder as PrismaReminder } from '@prisma/client';
import { Reminder, CreateReminderDTO, ReminderFrequency } from '../types/services.types';
import { logger } from '../utils/logger';

/**
 * ReminderService handles all business logic related to reminders
 *
 * Responsibilities:
 * - Create one-time and recurring reminders
 * - List active reminders
 * - Cancel reminders
 * - Check for due reminders
 * - Handle reminder recurrence
 */
export class ReminderService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new reminder
   */
  async createReminder(dto: CreateReminderDTO): Promise<Reminder> {
    logger.info('Creating reminder', { message: dto.message, scheduledFor: dto.scheduledFor });

    try {
      const reminder = await this.prisma.reminder.create({
        data: {
          message: dto.message,
          scheduledFor: dto.scheduledFor,
          recurring: dto.recurring || false,
          frequency: dto.frequency,
          active: true,
        },
      });

      logger.info(`Reminder created: ${reminder.id}`);
      return this.mapToReminder(reminder);
    } catch (error) {
      logger.error('Failed to create reminder:', error);
      throw new Error('Failed to create reminder');
    }
  }

  /**
   * Get reminder by ID
   */
  async getReminderById(id: number): Promise<Reminder | null> {
    try {
      const reminder = await this.prisma.reminder.findUnique({
        where: { id },
      });

      return reminder ? this.mapToReminder(reminder) : null;
    } catch (error) {
      logger.error(`Failed to get reminder ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all active reminders
   */
  async getActiveReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.prisma.reminder.findMany({
        where: { active: true },
        orderBy: { scheduledFor: 'asc' },
      });

      return reminders.map((r: PrismaReminder) => this.mapToReminder(r));
    } catch (error) {
      logger.error('Failed to get active reminders:', error);
      throw new Error('Failed to get active reminders');
    }
  }

  /**
   * Get all reminders (active and inactive)
   */
  async getAllReminders(): Promise<Reminder[]> {
    try {
      const reminders = await this.prisma.reminder.findMany({
        orderBy: { scheduledFor: 'asc' },
      });

      return reminders.map((r: PrismaReminder) => this.mapToReminder(r));
    } catch (error) {
      logger.error('Failed to get reminders:', error);
      throw new Error('Failed to get reminders');
    }
  }

  /**
   * Cancel (deactivate) a reminder
   */
  async cancelReminder(id: number): Promise<Reminder> {
    logger.info(`Canceling reminder ${id}`);

    try {
      const existing = await this.getReminderById(id);
      if (!existing) {
        throw new Error(`Reminder ${id} not found`);
      }

      const reminder = await this.prisma.reminder.update({
        where: { id },
        data: { active: false },
      });

      logger.info(`Reminder ${id} cancelled`);
      return this.mapToReminder(reminder);
    } catch (error) {
      logger.error(`Failed to cancel reminder ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a reminder permanently
   */
  async deleteReminder(id: number): Promise<void> {
    logger.info(`Deleting reminder ${id}`);

    try {
      await this.prisma.reminder.delete({
        where: { id },
      });

      logger.info(`Reminder ${id} deleted`);
    } catch (error) {
      logger.error(`Failed to delete reminder ${id}:`, error);
      throw new Error('Failed to delete reminder');
    }
  }

  /**
   * Get due reminders (reminders that should trigger now)
   */
  async getDueReminders(): Promise<Reminder[]> {
    try {
      const now = new Date();

      const reminders = await this.prisma.reminder.findMany({
        where: {
          active: true,
          scheduledFor: {
            lte: now,
          },
        },
      });

      return reminders.map((r: PrismaReminder) => this.mapToReminder(r));
    } catch (error) {
      logger.error('Failed to get due reminders:', error);
      return [];
    }
  }

  /**
   * Process a triggered reminder (mark as triggered and reschedule if recurring)
   */
  async processTriggeredReminder(id: number): Promise<Reminder | null> {
    logger.info(`Processing triggered reminder ${id}`);

    try {
      const reminder = await this.getReminderById(id);
      if (!reminder) {
        return null;
      }

      const now = new Date();

      if (reminder.recurring && reminder.frequency) {
        // Reschedule recurring reminder
        const nextSchedule = this.calculateNextOccurrence(now, reminder.frequency);

        const updated = await this.prisma.reminder.update({
          where: { id },
          data: {
            lastTriggered: now,
            scheduledFor: nextSchedule,
          },
        });

        logger.info(`Recurring reminder ${id} rescheduled to ${nextSchedule}`);
        return this.mapToReminder(updated);
      } else {
        // Deactivate one-time reminder
        const updated = await this.prisma.reminder.update({
          where: { id },
          data: {
            active: false,
            lastTriggered: now,
          },
        });

        logger.info(`One-time reminder ${id} deactivated`);
        return this.mapToReminder(updated);
      }
    } catch (error) {
      logger.error(`Failed to process reminder ${id}:`, error);
      return null;
    }
  }

  /**
   * Calculate next occurrence for recurring reminders
   */
  private calculateNextOccurrence(from: Date, frequency: ReminderFrequency): Date {
    const next = new Date(from);

    switch (frequency) {
      case ReminderFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case ReminderFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case ReminderFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  }

  /**
   * Get upcoming reminders (next N reminders)
   */
  async getUpcomingReminders(limit: number = 5): Promise<Reminder[]> {
    try {
      const now = new Date();

      const reminders = await this.prisma.reminder.findMany({
        where: {
          active: true,
          scheduledFor: {
            gte: now,
          },
        },
        orderBy: { scheduledFor: 'asc' },
        take: limit,
      });

      return reminders.map((r: PrismaReminder) => this.mapToReminder(r));
    } catch (error) {
      logger.error('Failed to get upcoming reminders:', error);
      return [];
    }
  }

  /**
   * Map Prisma reminder to service type
   */
  private mapToReminder(reminder: PrismaReminder): Reminder {
    return {
      id: reminder.id,
      message: reminder.message,
      scheduledFor: reminder.scheduledFor,
      recurring: reminder.recurring,
      frequency: reminder.frequency as any, // Cast to fix enum mismatch
      active: reminder.active,
      lastTriggered: reminder.lastTriggered ?? undefined,
      createdAt: reminder.createdAt,
    };
  }
}
