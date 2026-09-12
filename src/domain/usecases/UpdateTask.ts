import type { UpdateTaskInput } from "../entities/Task";
import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";
import {
  validateDescripcion,
  validateTitulo,
  validateTransicion,
} from "../validators/taskValidators";

export interface UpdateTaskDeps {
  clock: () => Date;
}

export class UpdateTask {
  constructor(
    private readonly repo: TaskRepository,
    private readonly deps: UpdateTaskDeps,
  ) {}

  async execute(id: string, input: UpdateTaskInput): Promise<Task> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error("NOT_FOUND");

    if (input.titulo !== undefined) {
      const err = validateTitulo(input.titulo);
      if (err) throw new Error(err);
    }

    if (input.descripcion !== undefined) {
      const err = validateDescripcion(input.descripcion);
      if (err) throw new Error(err);
    }

    if (input.estado !== undefined) {
      const err = validateTransicion(existing.estado, input.estado);
      if (err) throw new Error(err);
    }

    const trimmed: UpdateTaskInput = {
      ...input,
      ...(input.titulo !== undefined
        ? { titulo: input.titulo.trim() }
        : {}),
    };

    const now = this.deps.clock();
    const updated = await this.repo.update(id, trimmed);
    // ensure updatedAt is from clock if repo didn't set it
    if (updated.updatedAt.getTime() !== now.getTime()) {
      return { ...updated, updatedAt: now };
    }
    return updated;
  }
}
