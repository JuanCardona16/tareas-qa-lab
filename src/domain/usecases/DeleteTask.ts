import type { TaskRepository } from "../repositories/TaskRepository";

export class DeleteTask {
  constructor(private readonly repo: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error("NOT_FOUND");
    await this.repo.delete(id);
  }
}
