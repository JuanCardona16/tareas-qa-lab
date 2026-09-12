import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "../entities/Task";

export interface TaskRepository {
  list(filters?: TaskFilters): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(data: CreateTaskInput): Promise<Task>;
  update(id: string, data: UpdateTaskInput): Promise<Task>;
  delete(id: string): Promise<void>;
}
