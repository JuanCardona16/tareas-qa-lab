import type { Task, TaskFilters } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export class ListTasks {
  constructor(private readonly repo: TaskRepository) {}

  async execute(filters?: TaskFilters): Promise<Task[]> {
    return this.repo.list(filters);
  }
}
