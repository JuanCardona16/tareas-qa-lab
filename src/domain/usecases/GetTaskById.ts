import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

export class GetTaskById {
  constructor(private readonly repo: TaskRepository) {}

  async execute(id: string): Promise<Task | null> {
    return this.repo.getById(id);
  }
}
