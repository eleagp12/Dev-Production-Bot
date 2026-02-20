// tests/unit/commands/FocusCommands.test.ts

jest.mock('../../../src/utils/logger');
jest.mock('../../../src/services/FocusService');

import { StartFocusCommand } from '../../../src/commands/focus/StartFocusCommand';
import { StopFocusCommand } from '../../../src/commands/focus/StopFocusCommand';
import { FocusStatsCommand } from '../../../src/commands/focus/FocusStatsCommand';
import { FocusService } from '../../../src/services/FocusService';
import { CommandContext } from '../../../src/types/commands.types';

describe('Focus Commands', () => {
  let mockFocusService: jest.Mocked<FocusService>;

  const mockSession = {
    id: 1,
    duration: 25,
    breakTime: 5,
    startedAt: new Date(),
    completedAt: undefined,
    interrupted: false,
  };

  beforeEach(() => {
    mockFocusService = new FocusService(null as any) as jest.Mocked<FocusService>;
    jest.clearAllMocks();
  });

  describe('StartFocusCommand', () => {
    let command: StartFocusCommand;

    beforeEach(() => {
      command = new StartFocusCommand(mockFocusService);
    });

    it('should start a default 25-minute session', async () => {
      mockFocusService.getActiveSession.mockResolvedValue(null);
      mockFocusService.startSession.mockResolvedValue(mockSession);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus start',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Focus Session Started');
      expect(response.message).toContain('25 minutes');
      expect(mockFocusService.startSession).toHaveBeenCalledWith({
        duration: 25,
        breakTime: 5,
      });
    });

    it('should start a custom duration session', async () => {
      const customSession = { ...mockSession, duration: 45, breakTime: 10 };
      mockFocusService.getActiveSession.mockResolvedValue(null);
      mockFocusService.startSession.mockResolvedValue(customSession);

      const context: CommandContext = {
        args: new Map([
          ['0', '45'],
          ['break', '10'],
        ]),
        rawInput: '/focus start 45 --break=10',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(mockFocusService.startSession).toHaveBeenCalledWith({
        duration: 45,
        breakTime: 10,
      });
    });

    it('should reject if session already active', async () => {
      mockFocusService.getActiveSession.mockResolvedValue(mockSession);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus start',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(false);
      expect(response.message).toContain('already in progress');
      expect(mockFocusService.startSession).not.toHaveBeenCalled();
    });

    it('should validate duration range', () => {
      const invalidContext: CommandContext = {
        args: new Map([['0', '999']]),
        rawInput: '/focus start 999',
      };

      expect(command.validate(invalidContext)).toBe(false);
    });

    it('should validate zero duration', () => {
      const invalidContext: CommandContext = {
        args: new Map([['0', '0']]),
        rawInput: '/focus start 0',
      };

      expect(command.validate(invalidContext)).toBe(false);
    });

    it('should accept valid duration', () => {
      const validContext: CommandContext = {
        args: new Map([['0', '25']]),
        rawInput: '/focus start 25',
      };

      expect(command.validate(validContext)).toBe(true);
    });
  });

  describe('StopFocusCommand', () => {
    let command: StopFocusCommand;

    beforeEach(() => {
      command = new StopFocusCommand(mockFocusService);
    });

    it('should stop an active session as completed', async () => {
      const completedSession = {
        ...mockSession,
        completedAt: new Date(),
        interrupted: false,
      };

      mockFocusService.getActiveSession.mockResolvedValue(mockSession);
      mockFocusService.stopSession.mockResolvedValue(completedSession);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus stop',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Completed');
      expect(mockFocusService.stopSession).toHaveBeenCalledWith(false);
    });

    it('should stop a session as interrupted', async () => {
      const interruptedSession = {
        ...mockSession,
        completedAt: new Date(),
        interrupted: true,
      };

      mockFocusService.getActiveSession.mockResolvedValue(mockSession);
      mockFocusService.stopSession.mockResolvedValue(interruptedSession);

      const context: CommandContext = {
        args: new Map([['interrupted', true]]),
        rawInput: '/focus stop --interrupted',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Interrupted');
      expect(mockFocusService.stopSession).toHaveBeenCalledWith(true);
    });

    it('should return error if no active session', async () => {
      mockFocusService.getActiveSession.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus stop',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(false);
      expect(response.message).toContain('No active focus session');
    });
  });

  describe('FocusStatsCommand', () => {
    let command: FocusStatsCommand;

    const mockStats = {
      totalSessions: 10,
      totalMinutes: 250,
      averageSessionLength: 25,
      completionRate: 80,
      longestStreak: 5,
      currentStreak: 3,
    };

    beforeEach(() => {
      command = new FocusStatsCommand(mockFocusService);
    });

    it('should show stats for default period (week)', async () => {
      mockFocusService.getStats.mockResolvedValue(mockStats);
      mockFocusService.getActiveSession.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus stats',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain('Focus Statistics');
      expect(response.message).toContain('10');
      expect(response.message).toContain('80%');
      expect(mockFocusService.getStats).toHaveBeenCalledWith(7);
    });

    it('should show stats for custom period', async () => {
      mockFocusService.getStats.mockResolvedValue(mockStats);
      mockFocusService.getActiveSession.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map([['period', 'month']]),
        rawInput: '/focus stats --period=month',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(mockFocusService.getStats).toHaveBeenCalledWith(30);
    });

    it('should show active session banner', async () => {
      mockFocusService.getStats.mockResolvedValue(mockStats);
      mockFocusService.getActiveSession.mockResolvedValue(mockSession);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus stats',
      };

      const response = await command.execute(context);

      expect(response.message).toContain('Session in progress');
    });

    it('should handle empty stats gracefully', async () => {
      const emptyStats = {
        totalSessions: 0,
        totalMinutes: 0,
        averageSessionLength: 0,
        completionRate: 0,
        longestStreak: 0,
        currentStreak: 0,
      };

      mockFocusService.getStats.mockResolvedValue(emptyStats);
      mockFocusService.getActiveSession.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map(),
        rawInput: '/focus stats',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain('No sessions found');
    });
  });
});
