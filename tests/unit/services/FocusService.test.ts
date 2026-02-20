// tests/unit/services/FocusService.test.ts

jest.mock('../../../src/utils/logger');

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      focusSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

import { FocusService } from '../../../src/services/FocusService';
import { PrismaClient } from '@prisma/client';

describe('FocusService', () => {
  let focusService: FocusService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  const mockSession = {
    id: 1,
    duration: 25,
    breakTime: 5,
    startedAt: new Date(),
    completedAt: null,
    interrupted: false,
    notes: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    focusService = new FocusService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should start a new focus session with default break time', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.focusSession.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await focusService.startSession({ duration: 25 });

      expect(result.duration).toBe(25);
      expect(result.breakTime).toBe(5);
      expect(result.interrupted).toBe(false);
      expect(mockPrisma.focusSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          duration: 25,
          breakTime: 5,
        }),
      });
    });

    it('should start a session with custom break time', async () => {
      const customSession = { ...mockSession, duration: 50, breakTime: 10 };
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.focusSession.create as jest.Mock).mockResolvedValue(customSession);

      const result = await focusService.startSession({ duration: 50, breakTime: 10 });

      expect(result.duration).toBe(50);
      expect(result.breakTime).toBe(10);
    });

    it('should throw error if session already in progress', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(mockSession);

      await expect(focusService.startSession({ duration: 25 })).rejects.toThrow(
        'A focus session is already in progress'
      );

      expect(mockPrisma.focusSession.create).not.toHaveBeenCalled();
    });

    it('should throw error if database fails', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.focusSession.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(focusService.startSession({ duration: 25 })).rejects.toThrow(
        'Failed to start focus session'
      );
    });
  });

  describe('stopSession', () => {
    it('should stop an active session as completed', async () => {
      const completedSession = {
        ...mockSession,
        completedAt: new Date(),
        interrupted: false,
      };

      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
      (mockPrisma.focusSession.update as jest.Mock).mockResolvedValue(completedSession);

      const result = await focusService.stopSession(false);

      expect(result.interrupted).toBe(false);
      expect(result.completedAt).toBeDefined();
      expect(mockPrisma.focusSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          interrupted: false,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should stop an active session as interrupted', async () => {
      const interruptedSession = {
        ...mockSession,
        completedAt: new Date(),
        interrupted: true,
      };

      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(mockSession);
      (mockPrisma.focusSession.update as jest.Mock).mockResolvedValue(interruptedSession);

      const result = await focusService.stopSession(true);

      expect(result.interrupted).toBe(true);
    });

    it('should throw error if no active session', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(focusService.stopSession()).rejects.toThrow('No active focus session found');
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if one exists', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(mockSession);

      const result = await focusService.getActiveSession();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });

    it('should return null if no active session', async () => {
      (mockPrisma.focusSession.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await focusService.getActiveSession();

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no sessions', async () => {
      (mockPrisma.focusSession.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await focusService.getStats(7);

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });

    it('should calculate stats correctly from completed sessions', async () => {
      const now = new Date();
      const completedSessions = [
        {
          ...mockSession,
          id: 1,
          startedAt: new Date(now.getTime() - 30 * 60 * 1000),
          completedAt: new Date(now.getTime() - 5 * 60 * 1000),
          interrupted: false,
        },
        {
          ...mockSession,
          id: 2,
          startedAt: new Date(now.getTime() - 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 35 * 60 * 1000),
          interrupted: false,
        },
      ];

      (mockPrisma.focusSession.findMany as jest.Mock).mockResolvedValue(completedSessions);

      const stats = await focusService.getStats(7);

      expect(stats.totalSessions).toBe(2);
      expect(stats.completionRate).toBe(100);
      expect(stats.totalMinutes).toBeGreaterThan(0);
    });

    it('should calculate completion rate with interrupted sessions', async () => {
      const sessions = [
        { ...mockSession, id: 1, completedAt: new Date(), interrupted: false },
        { ...mockSession, id: 2, completedAt: new Date(), interrupted: true },
        { ...mockSession, id: 3, completedAt: new Date(), interrupted: false },
        { ...mockSession, id: 4, completedAt: null, interrupted: false },
      ];

      (mockPrisma.focusSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const stats = await focusService.getStats(7);

      expect(stats.totalSessions).toBe(4);
      expect(stats.completionRate).toBe(50); // 2 out of 4
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions', async () => {
      const sessions = [mockSession, { ...mockSession, id: 2 }];
      (mockPrisma.focusSession.findMany as jest.Mock).mockResolvedValue(sessions);

      const result = await focusService.getAllSessions();

      expect(result).toHaveLength(2);
    });

    it('should respect limit parameter', async () => {
      const sessions = [mockSession];
      (mockPrisma.focusSession.findMany as jest.Mock).mockResolvedValue(sessions);

      await focusService.getAllSessions(5);

      expect(mockPrisma.focusSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });
});
