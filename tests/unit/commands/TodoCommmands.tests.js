"use strict";
// tests/unit/commands/TodoCommands.test.ts
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var AddTodoCommand_1 = require("../../../src/commands/todo/AddTodoCommand");
var ListTodoCommand_1 = require("../../../src/commands/todo/ListTodoCommand");
var DoneTodoCommand_1 = require("../../../src/commands/todo/DoneTodoCommand");
var DeleteTodoCommand_1 = require("../../../src/commands/todo/DeleteTodoCommand");
var TaskService_1 = require("../../../src/services/TaskService");
var services_types_1 = require("../../../src/types/services.types");
// Mock TaskService
jest.mock("../../../src/services/TaskService");
describe("Todo Commands", function () {
    var mockTaskService;
    beforeEach(function () {
        mockTaskService = new TaskService_1.TaskService(null);
        jest.clearAllMocks();
    });
    describe("AddTodoCommand", function () {
        var command;
        beforeEach(function () {
            command = new AddTodoCommand_1.AddTodoCommand(mockTaskService);
        });
        it("should create task with title only", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTask = {
                            id: 1,
                            title: "Test Task",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.MEDIUM,
                            tags: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockTaskService.createTask.mockResolvedValue(mockTask);
                        context = {
                            args: new Map([["0", "Test Task"]]),
                            rawInput: '/todo add "Test Task"',
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(response.message).toContain("Task created successfully");
                        expect(mockTaskService.createTask).toHaveBeenCalledWith({
                            title: "Test Task",
                            description: undefined,
                            priority: services_types_1.Priority.MEDIUM,
                            dueDate: undefined,
                            tags: [],
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should create task with all options", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTask = {
                            id: 2,
                            title: "Important Task",
                            description: "Description",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.HIGH,
                            dueDate: new Date("2024-12-31"),
                            tags: ["urgent", "backend"],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockTaskService.createTask.mockResolvedValue(mockTask);
                        context = {
                            args: new Map([
                                ["0", "Important Task"],
                                ["description", "Description"],
                                ["priority", "high"],
                                ["due", "2024-12-31"],
                                ["tags", "urgent,backend"],
                            ]),
                            rawInput: '/todo add "Important Task" --priority=high --due=2024-12-31 --tags=urgent,backend',
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(mockTaskService.createTask).toHaveBeenCalledWith(expect.objectContaining({
                            title: "Important Task",
                            description: "Description",
                            priority: services_types_1.Priority.HIGH,
                            tags: ["urgent", "backend"],
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle "today" as due date', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTask = {
                            id: 3,
                            title: "Today Task",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.MEDIUM,
                            dueDate: new Date(),
                            tags: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockTaskService.createTask.mockResolvedValue(mockTask);
                        context = {
                            args: new Map([
                                ["0", "Today Task"],
                                ["due", "today"],
                            ]),
                            rawInput: '/todo add "Today Task" --due=today',
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(mockTaskService.createTask).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it("should validate missing title", function () {
            var context = {
                args: new Map(),
                rawInput: "/todo add",
            };
            var isValid = command.validate(context);
            expect(isValid).toBe(false);
        });
    });
    describe("ListTodoCommand", function () {
        var command;
        beforeEach(function () {
            command = new ListTodoCommand_1.ListTodoCommand(mockTaskService);
        });
        it("should list all tasks", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTasks, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTasks = [
                            {
                                id: 1,
                                title: "Task 1",
                                status: services_types_1.TaskStatus.PENDING,
                                priority: services_types_1.Priority.HIGH,
                                tags: [],
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                            {
                                id: 2,
                                title: "Task 2",
                                status: services_types_1.TaskStatus.COMPLETED,
                                priority: services_types_1.Priority.LOW,
                                tags: [],
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ];
                        mockTaskService.getTasks.mockResolvedValue(mockTasks);
                        context = {
                            args: new Map(),
                            rawInput: "/todo list",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(response.message).toContain("Your Tasks");
                        expect(response.message).toContain("Task 1");
                        expect(response.message).toContain("Task 2");
                        expect(mockTaskService.getTasks).toHaveBeenCalledWith({
                            status: undefined,
                            priority: undefined,
                            tags: undefined,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should filter by status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTaskService.getTasks.mockResolvedValue([]);
                        context = {
                            args: new Map([["status", "pending"]]),
                            rawInput: "/todo list --status=pending",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        _a.sent();
                        expect(mockTaskService.getTasks).toHaveBeenCalledWith({
                            status: services_types_1.TaskStatus.PENDING,
                            priority: undefined,
                            tags: undefined,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should filter by priority and tags", function () { return __awaiter(void 0, void 0, void 0, function () {
            var context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTaskService.getTasks.mockResolvedValue([]);
                        context = {
                            args: new Map([
                                ["priority", "high"],
                                ["tags", "urgent,backend"],
                            ]),
                            rawInput: "/todo list --priority=high --tags=urgent,backend",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        _a.sent();
                        expect(mockTaskService.getTasks).toHaveBeenCalledWith({
                            status: undefined,
                            priority: services_types_1.Priority.HIGH,
                            tags: ["urgent", "backend"],
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should handle empty task list", function () { return __awaiter(void 0, void 0, void 0, function () {
            var context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTaskService.getTasks.mockResolvedValue([]);
                        context = {
                            args: new Map(),
                            rawInput: "/todo list",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(response.message).toContain("No tasks found");
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("DoneTodoCommand", function () {
        var command;
        beforeEach(function () {
            command = new DoneTodoCommand_1.DoneTodoCommand(mockTaskService);
        });
        it("should complete a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingTask, completedTask, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingTask = {
                            id: 1,
                            title: "Task to complete",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.MEDIUM,
                            tags: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        completedTask = __assign(__assign({}, existingTask), { status: services_types_1.TaskStatus.COMPLETED, completedAt: new Date() });
                        mockTaskService.getTaskById.mockResolvedValue(existingTask);
                        mockTaskService.completeTask.mockResolvedValue(completedTask);
                        context = {
                            args: new Map([["0", "1"]]),
                            rawInput: "/todo done 1",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(response.message).toContain("Task Completed");
                        expect(mockTaskService.getTaskById).toHaveBeenCalledWith(1);
                        expect(mockTaskService.completeTask).toHaveBeenCalledWith(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return error if task not found", function () { return __awaiter(void 0, void 0, void 0, function () {
            var context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTaskService.getTaskById.mockResolvedValue(null);
                        context = {
                            args: new Map([["0", "999"]]),
                            rawInput: "/todo done 999",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(false);
                        expect(response.message).toContain("not found");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should validate task ID", function () {
            var invalidContext = {
                args: new Map([["0", "invalid"]]),
                rawInput: "/todo done invalid",
            };
            var isValid = command.validate(invalidContext);
            expect(isValid).toBe(false);
        });
    });
    describe("DeleteTodoCommand", function () {
        var command;
        beforeEach(function () {
            command = new DeleteTodoCommand_1.DeleteTodoCommand(mockTaskService);
        });
        it("should delete a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingTask, context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingTask = {
                            id: 1,
                            title: "Task to delete",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.MEDIUM,
                            tags: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        mockTaskService.getTaskById.mockResolvedValue(existingTask);
                        mockTaskService.deleteTask.mockResolvedValue(undefined);
                        context = {
                            args: new Map([["0", "1"]]),
                            rawInput: "/todo delete 1",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(true);
                        expect(response.message).toContain("Task Deleted");
                        expect(response.message).toContain("Task to delete");
                        expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return error if task not found", function () { return __awaiter(void 0, void 0, void 0, function () {
            var context, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTaskService.getTaskById.mockResolvedValue(null);
                        context = {
                            args: new Map([["0", "999"]]),
                            rawInput: "/todo delete 999",
                        };
                        return [4 /*yield*/, command.execute(context)];
                    case 1:
                        response = _a.sent();
                        expect(response.success).toBe(false);
                        expect(response.message).toContain("not found");
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
