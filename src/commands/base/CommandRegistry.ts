// src/commands/base/CommandRegistry.ts

import { Command } from "./Command";
import { CommandContext, CommandResponse } from "../../types/commands.types";
import { logger } from "../../utils/logger";

/**
 * CommandRegistry manages all registered commands and handles
 * command execution with proper error handling and logging.
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a command
   */
  register(command: Command): void {
    if (this.commands.has(command.name)) {
      logger.warn(`Command ${command.name} already registered, overwriting`);
    }

    this.commands.set(command.name, command);
    logger.info(`Registered command: ${command.name}`);
  }

  /**
   * Execute a command by name
   */
  async execute(
    commandName: string,
    context: CommandContext,
  ): Promise<CommandResponse> {
    const command = this.commands.get(commandName);

    if (!command) {
      return {
        success: false,
        message: `Unknown command: ${commandName}`,
        error: `Available commands: ${this.getCommandNames().join(", ")}`,
      };
    }

    try {
      // Validate input
      if (!command.validate(context)) {
        return {
          success: false,
          message: "Invalid command input",
          error: `Usage: ${command.usage}\n\nExamples:\n${command.examples.join("\n")}`,
        };
      }

      // Execute command
      logger.info(`Executing command: ${commandName}`, {
        args: Array.from(context.args.entries()),
      });
      const response = await command.execute(context);

      logger.info(
        `Command ${commandName} completed: ${response.success ? "success" : "failed"}`,
      );
      return response;
    } catch (error) {
      logger.error(`Error executing command ${commandName}:`, error);

      return {
        success: false,
        message: "Command execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get a command by name
   */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all registered command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if a command is registered
   */
  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Unregister a command
   */
  unregister(name: string): boolean {
    const result = this.commands.delete(name);
    if (result) {
      logger.info(`Unregistered command: ${name}`);
    }
    return result;
  }

  /**
   * Get help text for all commands
   */
  getHelpText(): string {
    const commands = this.getAllCommands();

    let help = "📚 Available Commands\n\n";

    commands.forEach((cmd) => {
      help += `**/${cmd.name}**\n`;
      help += `  ${cmd.description}\n`;
      help += `  Usage: ${cmd.usage}\n`;
      help += `  Examples:\n`;
      cmd.examples.forEach((ex) => {
        help += `    ${ex}\n`;
      });
      help += "\n";
    });

    return help;
  }

  /**
   * Get help text for a specific command
   */
  getCommandHelp(commandName: string): string {
    const command = this.commands.get(commandName);

    if (!command) {
      return `Command not found: ${commandName}`;
    }

    let help = `**/${command.name}**\n\n`;
    help += `${command.description}\n\n`;
    help += `**Usage:** ${command.usage}\n\n`;
    help += `**Examples:**\n`;
    command.examples.forEach((ex) => {
      help += `  ${ex}\n`;
    });

    return help;
  }
}
