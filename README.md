# 🚀 Dev Productivity Bot

A personal productivity assistant for developers built with TypeScript and Node.js. Track tasks, manage focus sessions, set reminders, and analyze your productivity patterns.

## ✨ Features

### 📋 Task Management

- Create, list, complete, and delete tasks
- Priority levels (low, medium, high)
- Due dates and tags
- Search and filter capabilities

### ⏱️ Focus Sessions (Pomodoro)

- Start customizable focus sessions
- Track work/break cycles
- Session history and statistics
- Interruption handling

### 🔔 Smart Reminders

- Schedule one-time or recurring reminders
- Natural language time parsing
- Snooze functionality
- Multiple notification channels

### 📊 Productivity Analytics

- Daily, weekly, monthly stats
- Focus time tracking
- Task completion rates
- Productivity trends and insights

## 🏗️ Architecture

```
dev-productivity-bot/
├── src/
│   ├── commands/              # Command handlers
│   │   ├── base/
│   │   │   ├── Command.ts     # Base command interface
│   │   │   └── CommandRegistry.ts
│   │   ├── todo/
│   │   │   ├── AddTodoCommand.ts
│   │   │   ├── ListTodoCommand.ts
│   │   │   ├── DoneTodoCommand.ts
│   │   │   └── DeleteTodoCommand.ts
│   │   ├── focus/
│   │   │   ├── StartFocusCommand.ts
│   │   │   ├── StopFocusCommand.ts
│   │   │   └── FocusStatsCommand.ts
│   │   ├── remind/
│   │   │   ├── CreateReminderCommand.ts
│   │   │   └── ListRemindersCommand.ts
│   │   └── stats/
│   │       └── StatsCommand.ts
│   ├── services/              # Business logic
│   │   ├── TaskService.ts
│   │   ├── FocusService.ts
│   │   ├── ReminderService.ts
│   │   └── StatsService.ts
│   ├── repositories/          # Data access layer
│   │   ├── TaskRepository.ts
│   │   ├── FocusSessionRepository.ts
│   │   └── ReminderRepository.ts
│   ├── models/                # Data models
│   │   ├── Task.ts
│   │   ├── FocusSession.ts
│   │   └── Reminder.ts
│   ├── database/              # Database setup
│   │   ├── connection.ts
│   │   └── migrations/
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   └── formatter.ts
│   ├── types/
│   │   ├── commands.types.ts
│   │   ├── services.types.ts
│   │   └── database.types.ts
│   ├── bot.ts                 # Main bot orchestrator
│   └── index.ts               # Entry point
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── commands/
│   └── integration/
├── prisma/                    # Prisma schema
│   └── schema.prisma
├── .env.example
├── .gitignore
├── tsconfig.json
├── jest.config.ts
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or SQLite for development)

### Installation

```bash
# Clone repository
git clone https://github.com/eleagp12/dev-productivity-bot.git
cd dev-productivity-bot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev

# Build TypeScript
npm run build

# Start bot
npm start
```

### Development Mode

```bash
# Run with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📖 Command Reference

### Task Management

#### Add Task

```bash
/todo add "Implement user authentication" --priority=high --due=2024-12-31 --tags=backend,urgent
```

**Options:**

- `--priority` or `-p`: low, medium, high (default: medium)
- `--due` or `-d`: Due date (YYYY-MM-DD)
- `--tags` or `-t`: Comma-separated tags

#### List Tasks

```bash
# All tasks
/todo list

# Filter by status
/todo list --status=pending

# Filter by priority
/todo list --priority=high

# Filter by tags
/todo list --tags=backend
```

#### Complete Task

```bash
/todo done 1
```

#### Delete Task

```bash
/todo delete 1
```

### Focus Sessions

#### Start Focus Session

```bash
# Default 25-minute session
/focus 25

# Custom duration
/focus 50

# With break duration
/focus 25 --break=5
```

#### Stop Focus Session

```bash
/focus stop
```

#### View Focus Statistics

```bash
# Today's stats
/focus stats

# This week
/focus stats --period=week

# This month
/focus stats --period=month
```

### Reminders

#### Create Reminder

```bash
# One-time reminder
/remind "Daily standup" at 9am

# Recurring reminder
/remind "Code review" every day at 2pm

# With advanced parsing
/remind "Sprint planning" on monday at 10am
```

#### List Reminders

```bash
/remind list
```

#### Cancel Reminder

```bash
/remind cancel 1
```

### Productivity Statistics

#### View Stats

```bash
# Today
/stats today

# This week
/stats week

# This month
/stats month

# Custom range
/stats --from=2024-01-01 --to=2024-01-31
```

## 🎯 Usage Examples

### Morning Routine

```bash
# Check today's tasks
/todo list --status=pending

# Start your day with a focus session
/focus 25

# Set reminder for standup
/remind "Daily standup" at 9:30am
```

### End of Day

```bash
# Mark completed tasks
/todo done 1
/todo done 2

# Check your productivity
/stats today

# Plan tomorrow
/todo add "Review PRs" --priority=high --due=tomorrow
```

### Weekly Review

```bash
# View weekly statistics
/stats week

# Check focus time
/focus stats --period=week

# Review pending tasks
/todo list --status=pending
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/productivity_bot

# Redis (optional - for timers)
REDIS_URL=redis://localhost:6379

# Bot Configuration
BOT_NAME=DevBot
LOG_LEVEL=info

# Notifications
ENABLE_NOTIFICATIONS=true
NOTIFICATION_SOUND=true

# Focus Session Defaults
DEFAULT_FOCUS_DURATION=25
DEFAULT_BREAK_DURATION=5
```

### Database Options

**PostgreSQL (Recommended for production):**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/productivity_bot
```

**SQLite (Good for development):**

```env
DATABASE_URL=file:./dev.db
```

## 🏛️ Architecture Decisions

### Command Pattern

Each command is isolated and implements a common interface. This enables:

- Easy addition of new commands
- Consistent error handling
- Testability
- Clear separation of concerns

### Service Layer

Business logic is separated from command handlers:

- **Commands**: Handle input/output, validation
- **Services**: Implement business logic
- **Repositories**: Handle data persistence

### Repository Pattern

Data access is abstracted through repositories:

- Easier to switch databases
- Better testing (can mock repositories)
- Clear data access patterns

### Strong Typing

Full TypeScript usage with:

- Interfaces for all models
- Enums for constants
- Type guards for validation
- No `any` types in production code

## 📊 Data Models

### Task

```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}
```

### Focus Session

```typescript
interface FocusSession {
  id: number;
  duration: number;
  startedAt: Date;
  completedAt?: Date;
  interrupted: boolean;
  notes?: string;
}
```

### Reminder

```typescript
interface Reminder {
  id: number;
  message: string;
  scheduledFor: Date;
  recurring: boolean;
  frequency?: ReminderFrequency;
  active: boolean;
  createdAt: Date;
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- TaskService.test.ts

# Watch mode
npm test -- --watch
```

### Coverage

```bash
npm run test:coverage
```

Target coverage: 80%+ for services and commands

## 📈 Productivity Insights

The bot provides various analytics:

- **Daily Summary**: Tasks completed, focus time, productivity score
- **Weekly Trends**: Completion rate, average focus time, best productive days
- **Monthly Reports**: Goals achieved, total focus hours, productivity patterns

## 🔐 Security

- No sensitive data stored in plain text
- Environment variables for configuration
- Input validation on all commands
- SQL injection prevention (Prisma ORM)

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t dev-productivity-bot .

# Run container
docker run -d -p 3000:3000 --env-file .env dev-productivity-bot
```

### PM2

```bash
npm run build
pm2 start dist/index.js --name productivity-bot
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

Built with:

- TypeScript
- Node.js
- Prisma ORM
- Winston Logger
- Jest Testing Framework

---

**Made with ❤️ for developers who want to stay productive**
