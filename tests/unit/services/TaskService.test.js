"use strict";
// tests/unit/services/TaskService.test.ts
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
var TaskService_1 = require("../../../src/services/TaskService");
var client_1 = require("@prisma/client");
var services_types_1 = require("../../../src/types/services.types");
// Mock Prisma Client
jest.mock("@prisma/client", function () {
    return {
        PrismaClient: jest.fn().mockImplementation(function () { return ({
            task: {
                create: jest.fn(),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                groupBy: jest.fn(),
            },
        }); }),
    };
});
describe("TaskService", function () {
    var taskService;
    var mockPrisma;
    beforeEach(function () {
        mockPrisma = new client_1.PrismaClient();
        taskService = new TaskService_1.TaskService(mockPrisma);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe("createTask", function () {
        it("should create a task with default priority", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTask = {
                            id: 1,
                            title: "Test Task",
                            description: null,
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.MEDIUM,
                            dueDate: null,
                            tags: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            completedAt: null,
                        };
                        mockPrisma.task.create.mockResolvedValue(mockTask);
                        return [4 /*yield*/, taskService.createTask({
                                title: "Test Task",
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(mockTask);
                        expect(mockPrisma.task.create).toHaveBeenCalledWith({
                            data: {
                                title: "Test Task",
                                description: undefined,
                                priority: services_types_1.Priority.MEDIUM,
                                dueDate: undefined,
                                tags: [],
                                status: services_types_1.TaskStatus.PENDING,
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should create a task with custom priority and tags", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTask = {
                            id: 2,
                            title: "Urgent Task",
                            description: "Important",
                            status: services_types_1.TaskStatus.PENDING,
                            priority: services_types_1.Priority.HIGH,
                            dueDate: new Date("2024-12-31"),
                            tags: ["urgent", "backend"],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            completedAt: null,
                        };
                        mockPrisma.task.create.mockResolvedValue(mockTask);
                        return [4 /*yield*/, taskService.createTask({
                                title: "Urgent Task",
                                description: "Important",
                                priority: services_types_1.Priority.HIGH,
                                dueDate: new Date("2024-12-31"),
                                tags: ["urgent", "backend"],
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result.priority).toBe(services_types_1.Priority.HIGH);
                        expect(result.tags).toEqual(["urgent", "backend"]);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should throw error if task creation fails", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.task.create.mockRejectedValue(new Error("Database error"));
                        return [4 /*yield*/, expect(taskService.createTask({ title: "Test" })).rejects.toThrow("Failed to create task")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("getTaskById", function () {
        it("should return a task if it exists", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTask, result;
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
                        mockPrisma.task.findUnique.mockResolvedValue(mockTask);
                        return [4 /*yield*/, taskService.getTaskById(1)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(mockTask);
                        expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
                            where: { id: 1 },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should return null if task does not exist", function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.task.findUnique.mockResolvedValue(null);
                        return [4 /*yield*/, taskService.getTaskById(999)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("getTasks", function () {
        it("should return all tasks without filters", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTasks, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTasks = [
                            { id: 1, title: "Task 1", status: services_types_1.TaskStatus.PENDING },
                            { id: 2, title: "Task 2", status: services_types_1.TaskStatus.COMPLETED },
                        ];
                        mockPrisma.task.findMany.mockResolvedValue(mockTasks);
                        return [4 /*yield*/, taskService.getTasks()];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveLength(2);
                        expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
                            where: {},
                            orderBy: [
                                { priority: "desc" },
                                { dueDate: "asc" },
                                { createdAt: "desc" },
                            ],
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should filter tasks by status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTasks, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTasks = [
                            { id: 1, title: "Task 1", status: services_types_1.TaskStatus.PENDING },
                        ];
                        mockPrisma.task.findMany.mockResolvedValue(mockTasks);
                        return [4 /*yield*/, taskService.getTasks({
                                status: services_types_1.TaskStatus.PENDING,
                            })];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveLength(1);
                        expect(mockPrisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            where: { status: services_types_1.TaskStatus.PENDING },
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        it("should filter tasks by multiple criteria", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockTasks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockTasks = [
                            {
                                id: 1,
                                title: "Urgent Task",
                                status: services_types_1.TaskStatus.PENDING,
                                priority: services_types_1.Priority.HIGH,
                                tags: ["urgent"],
                            },
                        ];
                        mockPrisma.task.findMany.mockResolvedValue(mockTasks);
                        return [4 /*yield*/, taskService.getTasks({
                                status: services_types_1.TaskStatus.PENDING,
                                priority: services_types_1.Priority.HIGH,
                                tags: ["urgent"],
                            })];
                    case 1:
                        _a.sent();
                        expect(mockPrisma.task.findMany).toHaveBeenCalledWith(expect.objectContaining({
                            where: expect.objectContaining({
                                status: services_types_1.TaskStatus.PENDING,
                                priority: services_types_1.Priority.HIGH,
                                tags: { hasSome: ["urgent"] },
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("completeTask", function () {
        it("should mark a task as completed", function () { return __awaiter(void 0, void 0, void 0, function () {
            var existingTask, completedTask, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingTask = {
                            id: 1,
                            title: "Task",
                            status: services_types_1.TaskStatus.PENDING,
                        };
                        completedTask = __assign(__assign({}, existingTask), { status: services_types_1.TaskStatus.COMPLETED, completedAt: new Date() });
                        mockPrisma.task.findUnique.mockResolvedValue(existingTask);
                        mockPrisma.task.update.mockResolvedValue(completedTask);
                        return [4 /*yield*/, taskService.completeTask(1)];
                    case 1:
                        result = _a.sent();
                        expect(result.status).toBe(services_types_1.TaskStatus.COMPLETED);
                        expect(result.completedAt).toBeDefined();
                        expect(mockPrisma.task.update).toHaveBeenCalledWith(expect.objectContaining({
                            where: { id: 1 },
                            data: expect.objectContaining({
                                status: services_types_1.TaskStatus.COMPLETED,
                                completedAt: expect.any(Date),
                            }),
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("deleteTask", function () {
        it("should delete a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.task.delete.mockResolvedValue({ id: 1 });
                        return [4 /*yield*/, taskService.deleteTask(1)];
                    case 1:
                        _a.sent();
                        expect(mockPrisma.task.delete).toHaveBeenCalledWith({
                            where: { id: 1 },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should throw error if deletion fails", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPrisma.task.delete.mockRejectedValue(new Error("Task not found"));
                        return [4 /*yield*/, expect(taskService.deleteTask(999)).rejects.toThrow("Failed to delete task")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("getTaskCountByStatus", function () {
        it("should return count of tasks by status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockCounts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCounts = [
                            { status: services_types_1.TaskStatus.PENDING, _count: 5 },
                            { status: services_types_1.TaskStatus.COMPLETED, _count: 3 },
                        ];
                        mockPrisma.task.groupBy.mockResolvedValue(mockCounts);
                        return [4 /*yield*/, taskService.getTaskCountByStatus()];
                    case 1:
                        result = _a.sent();
                        expect(result[services_types_1.TaskStatus.PENDING]).toBe(5);
                        expect(result[services_types_1.TaskStatus.COMPLETED]).toBe(3);
                        expect(result[services_types_1.TaskStatus.IN_PROGRESS]).toBe(0);
                        expect(result[services_types_1.TaskStatus.CANCELLED]).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
