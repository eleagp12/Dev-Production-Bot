// Mock logger first
jest.mock('../../../src/utils/logger');

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      task: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        groupBy: jest.fn(),
      },
    })),
  };
});

import { TaskService } from '../../../src/services/TaskService';
import { PrismaClient } from '@prisma/client';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    taskService = new TaskService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with default priority', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: undefined,
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: undefined,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: undefined,
      };

      (mockPrisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask({
        title: 'Test Task',
      });

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: undefined,
          priority: 'MEDIUM',
          dueDate: undefined,
          tags: [],
          status: 'PENDING',
        },
      });
    });

    it('should create a task with custom priority and tags', async () => {
      const mockTask = {
        id: 2,
        title: 'Urgent Task',
        description: 'Important',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date('2024-12-31'),
        tags: ['urgent', 'backend'],
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      };

      (mockPrisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask({
        title: 'Urgent Task',
        description: 'Important',
        priority: 'HIGH' as any,
        dueDate: new Date('2024-12-31'),
        tags: ['urgent', 'backend'],
      });

      expect(result.priority).toBe('HIGH');
      expect(result.tags).toEqual(['urgent', 'backend']);
    });

    it('should throw error if task creation fails', async () => {
      (mockPrisma.task.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(taskService.createTask({ title: 'Test' })).rejects.toThrow(
        'Failed to create task'
      );
    });
  });

  describe('getTaskById', () => {
    it('should return a task if it exists', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        status: 'PENDING',
        priority: 'MEDIUM',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(1);

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if task does not exist', async () => {
      (mockPrisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await taskService.getTaskById(999);

      expect(result).toBeNull();
    });
  });

  describe('getTasks', () => {
    it('should return all tasks without filters', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'PENDING' },
        { id: 2, title: 'Task 2', status: 'COMPLETED' },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.getTasks();

      expect(result).toHaveLength(2);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      });
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', status: 'PENDING' }];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await taskService.getTasks({
        status: 'PENDING' as any,
      });

      expect(result).toHaveLength(1);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      );
    });

    it('should filter tasks by multiple criteria', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Urgent Task',
          status: 'PENDING',
          priority: 'HIGH',
          tags: ['urgent'],
        },
      ];

      (mockPrisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      await taskService.getTasks({
        status: 'PENDING' as any,
        priority: 'HIGH' as any,
        tags: ['urgent'],
      });

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
            priority: 'HIGH',
            tags: { hasSome: ['urgent'] },
          }),
        })
      );
    });
  });

  describe('completeTask', () => {
    it('should mark a task as completed', async () => {
      const existingTask = {
        id: 1,
        title: 'Task',
        status: 'PENDING',
      };

      const completedTask = {
        ...existingTask,
        status: 'COMPLETED',
        completedAt: new Date(),
      };

      (mockPrisma.task.findUnique as jest.Mock).mockResolvedValue(existingTask);
      (mockPrisma.task.update as jest.Mock).mockResolvedValue(completedTask);

      const result = await taskService.completeTask(1);

      expect(result.status).toBe('COMPLETED');
      expect(result.completedAt).toBeDefined();
      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (mockPrisma.task.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await taskService.deleteTask(1);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error if deletion fails', async () => {
      (mockPrisma.task.delete as jest.Mock).mockRejectedValue(new Error('Task not found'));

      await expect(taskService.deleteTask(999)).rejects.toThrow('Failed to delete task');
    });
  });

  describe('getTaskCountByStatus', () => {
    it('should return count of tasks by status', async () => {
      const mockCounts = [
        { status: 'PENDING', _count: 5 },
        { status: 'COMPLETED', _count: 3 },
      ];

      (mockPrisma.task.groupBy as jest.Mock).mockResolvedValue(mockCounts);

      const result = await taskService.getTaskCountByStatus();

      expect(result['PENDING']).toBe(5);
      expect(result['COMPLETED']).toBe(3);
      expect(result['IN_PROGRESS']).toBe(0);
      expect(result['CANCELLED']).toBe(0);
    });
  });
});
