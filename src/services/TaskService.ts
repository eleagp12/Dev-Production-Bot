// src/services/TaskService.ts

import { PrismaClient } from "@prisma/client";
import {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskStatus,
  Priority,
} from "../types/services.types";
import { logger } from "../utils/logger";

/**
 * TaskService handles all business logic related to tasks
 *
 * Responsibilities:
 * - Create, read, update, delete tasks
 * - Filter and search tasks
 * - Task statistics
 */
export class TaskService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDTO): Promise<Task> {
    logger.info("Creating new task", { title: dto.title });

    try {
      const task = await this.prisma.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          priority: dto.priority || Priority.MEDIUM,
          dueDate: dto.dueDate,
          tags: dto.tags || [],
          status: "PENDING" as TaskStatus,
        },
      });

      logger.info(`Task created successfully: ${task.id}`);
      return this.mapToTask(task);
    } catch (error) {
      logger.error("Failed to create task:", error);
      throw new Error("Failed to create task");
    }
  }

  /**
   * Get a task by ID
   */
  async getTaskById(id: number): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id },
      });

      return task ? this.mapToTask(task) : null;
    } catch (error) {
      logger.error(`Failed to get task ${id}:`, error);
      throw new Error("Failed to get task");
    }
  }

  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.priority) {
        where.priority = filters.priority;
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags,
        };
      }

      if (filters?.dueBefore) {
        where.dueDate = {
          ...where.dueDate,
          lte: filters.dueBefore,
        };
      }

      if (filters?.dueAfter) {
        where.dueDate = {
          ...where.dueDate,
          gte: filters.dueAfter,
        };
      }

      const tasks = await this.prisma.task.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      });

      return tasks.map((task: any) => this.mapToTask(task));
    } catch (error) {
      logger.error("Failed to get tasks:", error);
      throw new Error("Failed to get tasks");
    }
  }

  /**
   * Update a task
   */
  async updateTask(id: number, dto: UpdateTaskDTO): Promise<Task> {
    logger.info(`Updating task ${id}`, dto);

    try {
      // Check if task exists
      const existing = await this.getTaskById(id);
      if (!existing) {
        throw new Error(`Task ${id} not found`);
      }

      const task = await this.prisma.task.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.status && { status: dto.status }),
          ...(dto.priority && { priority: dto.priority }),
          ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
          ...(dto.tags && { tags: dto.tags }),
          ...(dto.status === TaskStatus.COMPLETED && {
            completedAt: new Date(),
          }),
        },
      });

      logger.info(`Task ${id} updated successfully`);
      return this.mapToTask(task);
    } catch (error) {
      logger.error(`Failed to update task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete a task
   */
  async completeTask(id: number): Promise<Task> {
    logger.info(`Completing task ${id}`);

    return this.updateTask(id, {
      status: "COMPLETED" as TaskStatus,
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(id: number): Promise<void> {
    logger.info(`Deleting task ${id}`);

    try {
      await this.prisma.task.delete({
        where: { id },
      });

      logger.info(`Task ${id} deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete task ${id}:`, error);
      throw new Error("Failed to delete task");
    }
  }

  /**
   * Get task count by status
   */
  async getTaskCountByStatus(): Promise<Record<TaskStatus, number>> {
    try {
      const counts = await this.prisma.task.groupBy({
        by: ["status"],
        _count: true,
      });

      const result: Record<string, number> = {
        PENDING: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      };

      counts.forEach((count: any) => {
        result[count.status] = count._count;
      });

      return result as any;
    } catch (error) {
      logger.error("Failed to get task counts:", error);
      throw new Error("Failed to get task counts");
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();

    return this.getTasks({
      status: TaskStatus.PENDING,
      dueBefore: now,
    });
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getTasks({
      dueAfter: today,
      dueBefore: tomorrow,
    });
  }

  /**
   * Search tasks by text
   */
  async searchTasks(query: string): Promise<Task[]> {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      return tasks.map((task: any) => this.mapToTask(task));
    } catch (error) {
      logger.error("Failed to search tasks:", error);
      throw new Error("Failed to search tasks");
    }
  }

  /**
   * Map Prisma task to service Task type
   */
  private mapToTask(task: any): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as Priority,
      dueDate: task.dueDate,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    };
  }
}
