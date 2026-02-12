// src/utils/parser.ts

import { CommandContext } from '../types/commands.types';

/**
 * Parse command string into command name and arguments
 */
export function parseCommand(input: string): {
  command: string;
  subcommand?: string;
  context: CommandContext;
} {
  const trimmed = input.trim();

  // Remove leading slash if present
  const withoutSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  // Split into parts
  const parts = withoutSlash.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  if (parts.length === 0 || !parts[0]) {
    throw new Error('Empty command');
  }

  // Extract command and subcommand
  const command = parts[0];
  const subcommand = parts.length > 1 && !parts[1].startsWith('-') ? parts[1] : undefined;

  // Parse arguments
  const args = new Map<string, string | boolean | number | string[]>();
  let positionalIndex = 0;

  const startIndex = subcommand ? 2 : 1;

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith('--')) {
      // Long option: --key=value or --key
      const match = part.match(/^--([^=]+)(?:=(.+))?$/);
      if (match) {
        const key = match[1];
        const value = match[2];

        if (value === undefined) {
          args.set(key, true);
        } else {
          const parsedValue = parseValue(value);
          args.set(key, parsedValue);
        }
      }
    } else if (part.startsWith('-')) {
      // Short option
      const match = part.match(/^-([a-zA-Z])(?:=(.+))?$/);
      if (match) {
        const key = match[1];
        const value = match[2];

        if (value === undefined && i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
          const parsedValue = parseValue(parts[i + 1]);
          args.set(key, parsedValue);
          i++;
        } else if (value !== undefined) {
          const parsedValue = parseValue(value);
          args.set(key, parsedValue);
        } else {
          args.set(key, true);
        }
      }
    } else {
      // Positional argument
      const cleanValue = part.startsWith('"') && part.endsWith('"') ? part.slice(1, -1) : part;

      args.set(positionalIndex.toString(), cleanValue);
      positionalIndex++;
    }
  }

  return {
    command,
    subcommand,
    context: {
      args,
      rawInput: input,
    },
  };
}

function parseValue(value: string): string | number | string[] {
  const cleaned = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;

  if (cleaned.includes(',')) {
    return cleaned.split(',').map(v => v.trim());
  }

  const num = Number(cleaned);
  if (!isNaN(num) && cleaned === num.toString()) {
    return num;
  }

  return cleaned;
}

export function formatResponse(response: {
  success: boolean;
  message: string;
  error?: string;
}): string {
  let formatted = response.success ? '✅ ' : '❌ ';
  formatted += response.message;

  if (response.error) {
    formatted += `\n\n**Error:** ${response.error}`;
  }

  return formatted;
}

export function validateCommand(input: string): boolean {
  if (!input || input.trim().length === 0) {
    return false;
  }

  if (!input.trim().startsWith('/')) {
    return false;
  }

  return true;
}
