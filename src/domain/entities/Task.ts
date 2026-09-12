export type TaskStatus = "pendiente" | "en_progreso" | "completada";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "pendiente",
  "en_progreso",
  "completada",
] as const;

export interface Task {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTaskInput = Pick<Task, "titulo" | "descripcion">;

export type UpdateTaskInput = Partial<
  Pick<Task, "titulo" | "descripcion" | "estado">
>;

export interface TaskFilters {
  estado?: TaskStatus;
  q?: string;
}
