"use strict";
// src/services/TaskService.ts
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
exports.TaskService = void 0;
var services_types_1 = require("../types/services.types");
var logger_1 = require("../utils/logger");
/**
 * TaskService handles all business logic related to tasks
 *
 * Responsibilities:
 * - Create, read, update, delete tasks
 * - Filter and search tasks
 * - Task statistics
 */
var TaskService = /** @class */ (function () {
    function TaskService(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a new task
     */
    TaskService.prototype.createTask = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var task, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info("Creating new task", { title: dto.title });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.create({
                                data: {
                                    title: dto.title,
                                    description: dto.description,
                                    priority: dto.priority || services_types_1.Priority.MEDIUM,
                                    dueDate: dto.dueDate,
                                    tags: dto.tags || [],
                                    status: services_types_1.TaskStatus.PENDING,
                                },
                            })];
                    case 2:
                        task = _a.sent();
                        logger_1.logger.info("Task created successfully: ".concat(task.id));
                        return [2 /*return*/, this.mapToTask(task)];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error("Failed to create task:", error_1);
                        throw new Error("Failed to create task");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a task by ID
     */
    TaskService.prototype.getTaskById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var task, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findUnique({
                                where: { id: id },
                            })];
                    case 1:
                        task = _a.sent();
                        return [2 /*return*/, task ? this.mapToTask(task) : null];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error("Failed to get task ".concat(id, ":"), error_2);
                        throw new Error("Failed to get task");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all tasks with optional filters
     */
    TaskService.prototype.getTasks = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var where, tasks, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        where = {};
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            where.status = filters.status;
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.priority) {
                            where.priority = filters.priority;
                        }
                        if ((filters === null || filters === void 0 ? void 0 : filters.tags) && filters.tags.length > 0) {
                            where.tags = {
                                hasSome: filters.tags,
                            };
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dueBefore) {
                            where.dueDate = __assign(__assign({}, where.dueDate), { lte: filters.dueBefore });
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.dueAfter) {
                            where.dueDate = __assign(__assign({}, where.dueDate), { gte: filters.dueAfter });
                        }
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: where,
                                orderBy: [
                                    { priority: "desc" },
                                    { dueDate: "asc" },
                                    { createdAt: "desc" },
                                ],
                            })];
                    case 1:
                        tasks = _a.sent();
                        return [2 /*return*/, tasks.map(function (task) { return _this.mapToTask(task); })];
                    case 2:
                        error_3 = _a.sent();
                        logger_1.logger.error("Failed to get tasks:", error_3);
                        throw new Error("Failed to get tasks");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update a task
     */
    TaskService.prototype.updateTask = function (id, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, task, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info("Updating task ".concat(id), dto);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getTaskById(id)];
                    case 2:
                        existing = _a.sent();
                        if (!existing) {
                            throw new Error("Task ".concat(id, " not found"));
                        }
                        return [4 /*yield*/, this.prisma.task.update({
                                where: { id: id },
                                data: __assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (dto.title && { title: dto.title })), (dto.description !== undefined && {
                                    description: dto.description,
                                })), (dto.status && { status: dto.status })), (dto.priority && { priority: dto.priority })), (dto.dueDate !== undefined && { dueDate: dto.dueDate })), (dto.tags && { tags: dto.tags })), (dto.status === services_types_1.TaskStatus.COMPLETED && {
                                    completedAt: new Date(),
                                })),
                            })];
                    case 3:
                        task = _a.sent();
                        logger_1.logger.info("Task ".concat(id, " updated successfully"));
                        return [2 /*return*/, this.mapToTask(task)];
                    case 4:
                        error_4 = _a.sent();
                        logger_1.logger.error("Failed to update task ".concat(id, ":"), error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Complete a task
     */
    TaskService.prototype.completeTask = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.logger.info("Completing task ".concat(id));
                return [2 /*return*/, this.updateTask(id, {
                        status: services_types_1.TaskStatus.COMPLETED,
                    })];
            });
        });
    };
    /**
     * Delete a task
     */
    TaskService.prototype.deleteTask = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info("Deleting task ".concat(id));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.prisma.task.delete({
                                where: { id: id },
                            })];
                    case 2:
                        _a.sent();
                        logger_1.logger.info("Task ".concat(id, " deleted successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        logger_1.logger.error("Failed to delete task ".concat(id, ":"), error_5);
                        throw new Error("Failed to delete task");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get task count by status
     */
    TaskService.prototype.getTaskCountByStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var counts, result_1, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.groupBy({
                                by: ["status"],
                                _count: true,
                            })];
                    case 1:
                        counts = _b.sent();
                        result_1 = (_a = {},
                            _a[services_types_1.TaskStatus.PENDING] = 0,
                            _a[services_types_1.TaskStatus.IN_PROGRESS] = 0,
                            _a[services_types_1.TaskStatus.COMPLETED] = 0,
                            _a[services_types_1.TaskStatus.CANCELLED] = 0,
                            _a);
                        counts.forEach(function (count) {
                            result_1[count.status] = count._count;
                        });
                        return [2 /*return*/, result_1];
                    case 2:
                        error_6 = _b.sent();
                        logger_1.logger.error("Failed to get task counts:", error_6);
                        throw new Error("Failed to get task counts");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get overdue tasks
     */
    TaskService.prototype.getOverdueTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            return __generator(this, function (_a) {
                now = new Date();
                return [2 /*return*/, this.getTasks({
                        status: services_types_1.TaskStatus.PENDING,
                        dueBefore: now,
                    })];
            });
        });
    };
    /**
     * Get tasks due today
     */
    TaskService.prototype.getTasksDueToday = function () {
        return __awaiter(this, void 0, void 0, function () {
            var today, tomorrow;
            return __generator(this, function (_a) {
                today = new Date();
                today.setHours(0, 0, 0, 0);
                tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return [2 /*return*/, this.getTasks({
                        dueAfter: today,
                        dueBefore: tomorrow,
                    })];
            });
        });
    };
    /**
     * Search tasks by text
     */
    TaskService.prototype.searchTasks = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, error_7;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.task.findMany({
                                where: {
                                    OR: [
                                        { title: { contains: query, mode: "insensitive" } },
                                        { description: { contains: query, mode: "insensitive" } },
                                    ],
                                },
                                orderBy: { createdAt: "desc" },
                            })];
                    case 1:
                        tasks = _a.sent();
                        return [2 /*return*/, tasks.map(function (task) { return _this.mapToTask(task); })];
                    case 2:
                        error_7 = _a.sent();
                        logger_1.logger.error("Failed to search tasks:", error_7);
                        throw new Error("Failed to search tasks");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Map Prisma task to service Task type
     */
    TaskService.prototype.mapToTask = function (task) {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            tags: task.tags,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            completedAt: task.completedAt,
        };
    };
    return TaskService;
}());
exports.TaskService = TaskService;
