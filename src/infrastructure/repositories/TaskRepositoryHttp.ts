import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";
import { apiCreate, apiGetById, apiList, apiRemove, apiUpdate } from "../api/client";

export class TaskRepositoryHttp implements TaskRepository {
  async list(filters?: TaskFilters): Promise<Task[]> {
    return apiList(filters);
  }

  async getById(id: string): Promise<Task | null> {
    return apiGetById(id);
  }

  async create(data: CreateTaskInput): Promise<Task> {
    return apiCreate(data);
  }

  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    return apiUpdate(id, data);
  }

  async delete(id: string): Promise<void> {
    return apiRemove(id);
  }
}
