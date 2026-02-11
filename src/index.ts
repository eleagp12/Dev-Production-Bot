// src/index.ts

import dotenv from 'dotenv';
import readline from 'readline';
import { DevProductivityBot } from './bot';
import { formatResponse } from './utils/parser';
import { logger } from './utils/logger';

dotenv.config();

function main(): void {
  console.log('Dev Productivity Bot v1.0.0');
  console.log('================================\n');
  console.log('Your personal productivity assistant for developers.');
  console.log('Type "/help" for available commands or "exit" to quit.\n');

  const bot = new DevProductivityBot();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  const shutdown = async (message?: string): Promise<void> => {
    if (message) {
      console.log(message);
    }

    await bot.close();
    process.exit(0);
  };

  const handleLine = async (input: string): Promise<void> => {
    const trimmed = input.trim();

    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      await shutdown('\nGoodbye. Stay productive.\n');
      return;
    }

    if (trimmed === '') {
      rl.prompt();
      return;
    }

    if (trimmed === '/help' || trimmed === 'help') {
      console.log('\n' + bot.getHelp());
      rl.prompt();
      return;
    }

    try {
      const response = await bot.processCommand(trimmed);
      const formatted = formatResponse(response);
      console.log('\n' + formatted + '\n');
    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : 'Unknown error', '\n');
    }

    rl.prompt();
  };

  rl.prompt();

  rl.on('line', (input: string) => {
    void handleLine(input);
  });

  rl.on('error', error => {
    logger.error('Readline error:', error);
    console.error('An error occurred. Please try again.');
    rl.prompt();
  });

  rl.on('close', () => {
    void shutdown();
  });

  process.on('SIGINT', () => {
    void shutdown('\n\nGoodbye. Stay productive.\n');
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    void shutdown();
  });
}

try {
  main();
} catch (error) {
  logger.error('Fatal error:', error);
  console.error('Fatal error:', error);
  process.exit(1);
}
