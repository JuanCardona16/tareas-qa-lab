import type { TaskRepository } from "@/domain/repositories/TaskRepository";
import { CreateTask } from "@/domain/usecases/CreateTask";
import { DeleteTask } from "@/domain/usecases/DeleteTask";
import { GetTaskById } from "@/domain/usecases/GetTaskById";
import { ListTasks } from "@/domain/usecases/ListTasks";
import { UpdateTask } from "@/domain/usecases/UpdateTask";
import { TaskRepositoryInMemory } from "@/infrastructure/repositories/TaskRepositoryInMemory";

export type { Task, TaskStatus, TaskFilters, CreateTaskInput, UpdateTaskInput } from "@/domain/entities/Task";

export interface AppDeps {
  repo?: TaskRepository;
  clock?: () => Date;
  id?: () => string;
}

export interface App {
  repo: TaskRepository;
  createTask: CreateTask;
  updateTask: UpdateTask;
  deleteTask: DeleteTask;
  listTasks: ListTasks;
  getTaskById: GetTaskById;
}

export function createApp(deps: AppDeps = {}): App {
  const clock = deps.clock ?? ((): Date => new Date());
  const id = deps.id ?? ((): string => crypto.randomUUID());
  const repo = deps.repo ?? new TaskRepositoryInMemory({ clock, id });
  return {
    repo,
    createTask: new CreateTask(repo, { clock, id }),
    updateTask: new UpdateTask(repo, { clock }),
    deleteTask: new DeleteTask(repo),
    listTasks: new ListTasks(repo),
    getTaskById: new GetTaskById(repo),
  };
}
