// src/types/commands.types.ts

export interface CommandContext {
  args: Map<string, string | boolean | number | string[]>;
  rawInput: string;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  execute(context: CommandContext): Promise<CommandResponse>;
  validate(context: CommandContext): boolean;
}

export type CommandName = 'todo' | 'focus' | 'remind' | 'stats' | 'help';

export type TodoSubcommand = 'add' | 'list' | 'done' | 'delete' | 'update';
export type FocusSubcommand = 'start' | 'stop' | 'stats' | 'pause';
export type RemindSubcommand = 'create' | 'list' | 'cancel' | 'snooze';
export type StatsSubcommand = 'today' | 'week' | 'month' | 'custom';
