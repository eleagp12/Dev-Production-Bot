// src/commands/base/Command.ts

import { CommandContext, CommandResponse } from "../../types/commands.types";

/**
 * Base Command interface that all commands must implement
 *
 * This ensures consistency across all commands and makes it easy
 * to add new commands without changing the bot's core logic.
 */
export abstract class Command {
  /** Unique command name (e.g., "todo", "focus") */
  abstract readonly name: string;

  /** Human-readable description */
  abstract readonly description: string;

  /** Usage syntax (e.g., "/todo add <title> [options]") */
  abstract readonly usage: string;

  /** Array of example commands */
  abstract readonly examples: string[];

  /**
   * Execute the command
   * @param context - Command context containing args and raw input
   * @returns Promise resolving to command response
   */
  abstract execute(context: CommandContext): Promise<CommandResponse>;

  /**
   * Validate command input before execution
   * @param context - Command context to validate
   * @returns true if valid, false otherwise
   */
  validate(_context: CommandContext): boolean {
    // Default implementation - can be overridden
    return true;
  }

  /**
   * Helper method to create success response
   */
  protected success(message: string, data?: unknown): CommandResponse {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Helper method to create error response
   */
  protected error(message: string, error?: string): CommandResponse {
    return {
      success: false,
      message,
      error,
    };
  }

  /**
   * Helper method to get required argument
   */
  protected getRequiredArg(
    context: CommandContext,
    key: string,
  ): string | number | boolean | string[] {
    const value = context.args.get(key);
    if (value === undefined) {
      throw new Error(`Missing required argument: ${key}`);
    }
    return value;
  }

  /**
   * Helper method to get optional argument with default
   */
  protected getOptionalArg<T>(
    context: CommandContext,
    key: string,
    defaultValue: T,
  ): T {
    const value = context.args.get(key);
    return (value as T) ?? defaultValue;
  }
}
