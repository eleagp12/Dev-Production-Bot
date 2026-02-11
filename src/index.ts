// src/index.ts

import dotenv from "dotenv";
import readline from "readline";
import { DevProductivityBot } from "./bot";
import { formatResponse } from "./utils/parser";
import { logger } from "./utils/logger";

// Load environment variables
dotenv.config();

/**
 * Main entry point for the Dev Productivity Bot
 *
 * Provides a CLI interface for interacting with the bot
 */
async function main() {
  // Display welcome message
  console.log("🤖 Dev Productivity Bot v1.0.0");
  console.log("================================\n");
  console.log("Your personal productivity assistant for developers.");
  console.log('Type "/help" for available commands or "exit" to quit.\n');

  // Initialize bot
  const bot = new DevProductivityBot();

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  // Display prompt
  rl.prompt();

  // Handle input
  rl.on("line", async (input: string) => {
    const trimmed = input.trim();

    // Handle exit
    if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
      console.log("\n👋 Goodbye! Stay productive!\n");
      await bot.close();
      rl.close();
      process.exit(0);
    }

    // Handle empty input
    if (trimmed === "") {
      rl.prompt();
      return;
    }

    // Handle help
    if (trimmed === "/help" || trimmed === "help") {
      console.log("\n" + bot.getHelp());
      rl.prompt();
      return;
    }

    try {
      // Process command
      const response = await bot.processCommand(trimmed);

      // Format and display response
      const formatted = formatResponse(response);
      console.log("\n" + formatted + "\n");
    } catch (error) {
      console.error(
        "\n❌ Error:",
        error instanceof Error ? error.message : "Unknown error",
        "\n",
      );
    }

    rl.prompt();
  });

  // Handle errors
  rl.on("error", (error) => {
    logger.error("Readline error:", error);
    console.error("❌ An error occurred. Please try again.");
    rl.prompt();
  });

  // Handle close
  rl.on("close", async () => {
    await bot.close();
    process.exit(0);
  });

  // Handle process termination
  process.on("SIGINT", async () => {
    console.log("\n\n👋 Goodbye! Stay productive!\n");
    await bot.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await bot.close();
    process.exit(0);
  });
}

// Start the bot
main().catch((error) => {
  logger.error("Fatal error:", error);
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
