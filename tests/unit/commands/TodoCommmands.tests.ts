// tests/unit/commands/TodoCommands.test.ts

import { AddTodoCommand } from "../../../src/commands/todo/AddTodoCommand";
import { ListTodoCommand } from "../../../src/commands/todo/ListTodoCommand";
import { DoneTodoCommand } from "../../../src/commands/todo/DoneTodoCommand";
import { DeleteTodoCommand } from "../../../src/commands/todo/DeleteTodoCommand";
import { TaskService } from "../../../src/services/TaskService";
import { Priority, TaskStatus } from "../../../src/types/services.types";
import { CommandContext } from "../../../src/types/commands.types";

// Mock TaskService
jest.mock("../../../src/services/TaskService");

describe("Todo Commands", () => {
  let mockTaskService: jest.Mocked<TaskService>;

  beforeEach(() => {
    mockTaskService = new TaskService(null as any) as jest.Mocked<TaskService>;
    jest.clearAllMocks();
  });

  describe("AddTodoCommand", () => {
    let command: AddTodoCommand;

    beforeEach(() => {
      command = new AddTodoCommand(mockTaskService);
    });

    it("should create task with title only", async () => {
      const mockTask = {
        id: 1,
        title: "Test Task",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.createTask.mockResolvedValue(mockTask as any);

      const context: CommandContext = {
        args: new Map([["0", "Test Task"]]),
        rawInput: '/todo add "Test Task"',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain("Task created successfully");
      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        title: "Test Task",
        description: undefined,
        priority: Priority.MEDIUM,
        dueDate: undefined,
        tags: [],
      });
    });

    it("should create task with all options", async () => {
      const mockTask = {
        id: 2,
        title: "Important Task",
        description: "Description",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        dueDate: new Date("2024-12-31"),
        tags: ["urgent", "backend"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.createTask.mockResolvedValue(mockTask as any);

      const context: CommandContext = {
        args: new Map([
          ["0", "Important Task"],
          ["description", "Description"],
          ["priority", "high"],
          ["due", "2024-12-31"],
          ["tags", "urgent,backend"],
        ]),
        rawInput:
          '/todo add "Important Task" --priority=high --due=2024-12-31 --tags=urgent,backend',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(mockTaskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Important Task",
          description: "Description",
          priority: Priority.HIGH,
          tags: ["urgent", "backend"],
        }),
      );
    });

    it('should handle "today" as due date', async () => {
      const mockTask = {
        id: 3,
        title: "Today Task",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: new Date(),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.createTask.mockResolvedValue(mockTask as any);

      const context: CommandContext = {
        args: new Map([
          ["0", "Today Task"],
          ["due", "today"],
        ]),
        rawInput: '/todo add "Today Task" --due=today',
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(mockTaskService.createTask).toHaveBeenCalled();
    });

    it("should validate missing title", () => {
      const context: CommandContext = {
        args: new Map(),
        rawInput: "/todo add",
      };

      const isValid = command.validate(context);
      expect(isValid).toBe(false);
    });
  });

  describe("ListTodoCommand", () => {
    let command: ListTodoCommand;

    beforeEach(() => {
      command = new ListTodoCommand(mockTaskService);
    });

    it("should list all tasks", async () => {
      const mockTasks = [
        {
          id: 1,
          title: "Task 1",
          status: TaskStatus.PENDING,
          priority: Priority.HIGH,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: "Task 2",
          status: TaskStatus.COMPLETED,
          priority: Priority.LOW,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTaskService.getTasks.mockResolvedValue(mockTasks as any);

      const context: CommandContext = {
        args: new Map(),
        rawInput: "/todo list",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain("Your Tasks");
      expect(response.message).toContain("Task 1");
      expect(response.message).toContain("Task 2");
      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        status: undefined,
        priority: undefined,
        tags: undefined,
      });
    });

    it("should filter by status", async () => {
      mockTaskService.getTasks.mockResolvedValue([]);

      const context: CommandContext = {
        args: new Map([["status", "pending"]]),
        rawInput: "/todo list --status=pending",
      };

      await command.execute(context);

      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        status: TaskStatus.PENDING,
        priority: undefined,
        tags: undefined,
      });
    });

    it("should filter by priority and tags", async () => {
      mockTaskService.getTasks.mockResolvedValue([]);

      const context: CommandContext = {
        args: new Map([
          ["priority", "high"],
          ["tags", "urgent,backend"],
        ]),
        rawInput: "/todo list --priority=high --tags=urgent,backend",
      };

      await command.execute(context);

      expect(mockTaskService.getTasks).toHaveBeenCalledWith({
        status: undefined,
        priority: Priority.HIGH,
        tags: ["urgent", "backend"],
      });
    });

    it("should handle empty task list", async () => {
      mockTaskService.getTasks.mockResolvedValue([]);

      const context: CommandContext = {
        args: new Map(),
        rawInput: "/todo list",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain("No tasks found");
    });
  });

  describe("DoneTodoCommand", () => {
    let command: DoneTodoCommand;

    beforeEach(() => {
      command = new DoneTodoCommand(mockTaskService);
    });

    it("should complete a task", async () => {
      const existingTask = {
        id: 1,
        title: "Task to complete",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const completedTask = {
        ...existingTask,
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      };

      mockTaskService.getTaskById.mockResolvedValue(existingTask as any);
      mockTaskService.completeTask.mockResolvedValue(completedTask as any);

      const context: CommandContext = {
        args: new Map([["0", "1"]]),
        rawInput: "/todo done 1",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain("Task Completed");
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith(1);
      expect(mockTaskService.completeTask).toHaveBeenCalledWith(1);
    });

    it("should return error if task not found", async () => {
      mockTaskService.getTaskById.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map([["0", "999"]]),
        rawInput: "/todo done 999",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(false);
      expect(response.message).toContain("not found");
    });

    it("should validate task ID", () => {
      const invalidContext: CommandContext = {
        args: new Map([["0", "invalid"]]),
        rawInput: "/todo done invalid",
      };

      const isValid = command.validate(invalidContext);
      expect(isValid).toBe(false);
    });
  });

  describe("DeleteTodoCommand", () => {
    let command: DeleteTodoCommand;

    beforeEach(() => {
      command = new DeleteTodoCommand(mockTaskService);
    });

    it("should delete a task", async () => {
      const existingTask = {
        id: 1,
        title: "Task to delete",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskService.getTaskById.mockResolvedValue(existingTask as any);
      mockTaskService.deleteTask.mockResolvedValue(undefined);

      const context: CommandContext = {
        args: new Map([["0", "1"]]),
        rawInput: "/todo delete 1",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(true);
      expect(response.message).toContain("Task Deleted");
      expect(response.message).toContain("Task to delete");
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
    });

    it("should return error if task not found", async () => {
      mockTaskService.getTaskById.mockResolvedValue(null);

      const context: CommandContext = {
        args: new Map([["0", "999"]]),
        rawInput: "/todo delete 999",
      };

      const response = await command.execute(context);

      expect(response.success).toBe(false);
      expect(response.message).toContain("not found");
    });
  });
});
