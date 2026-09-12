import type { Task, CreateTaskInput } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";
import {
  validateDescripcion,
  validateTitulo,
} from "../validators/taskValidators";

export interface CreateTaskDeps {
  clock: () => Date;
  id: () => string;
}

export class CreateTask {
  constructor(
    private readonly repo: TaskRepository,
    private readonly deps: CreateTaskDeps,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const tituloError = validateTitulo(input.titulo);
    if (tituloError) throw new Error(tituloError);

    const descError = validateDescripcion(input.descripcion);
    if (descError) throw new Error(descError);

    const titulo = input.titulo.trim();
    // Delega generación de id/fechas al repositorio (InMemory usa clock/id inyectados)
    // Mantiene deps para compatibilidad de firma y determinismo vía repo
    void this.deps.clock;
    void this.deps.id;
    const created = await this.repo.create({
      titulo,
      descripcion: input.descripcion,
    });
    return created;
  }
}
