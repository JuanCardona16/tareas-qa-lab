import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";

type Clock = () => Date;
type IdGen = () => string;

export interface InMemoryOptions {
  clock?: Clock;
  id?: IdGen;
  initialTasks?: Task[];
}

export class TaskRepositoryInMemory implements TaskRepository {
  private tasks: Task[];
  private readonly clock: Clock;
  private readonly idGen: IdGen;

  constructor(opts: InMemoryOptions = {}) {
    this.clock = opts.clock ?? ((): Date => new Date());
    this.idGen = opts.id ?? ((): string => crypto.randomUUID());
    this.tasks = opts.initialTasks ? [...opts.initialTasks] : [];
  }

  async list(filters?: TaskFilters): Promise<Task[]> {
    let result = [...this.tasks];
    if (filters?.estado) {
      result = result.filter((t) => t.estado === filters.estado);
    }
    if (filters?.q !== undefined && filters.q.trim() !== "") {
      const q = filters.q.trim().toLowerCase();
      result = result.filter((t) => {
        const haystack = `${t.titulo} ${t.descripcion ?? ""}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return result.map((t) => ({ ...t }));
  }

  async getById(id: string): Promise<Task | null> {
    const found = this.tasks.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async create(data: CreateTaskInput): Promise<Task> {
    const now = this.clock();
    const task: Task = {
      id: this.idGen(),
      titulo: data.titulo.trim(),
      descripcion: data.descripcion,
      estado: "pendiente",
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
    this.tasks.push(task);
    return { ...task };
  }

  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");
    const existing = this.tasks[idx];
    const now = this.clock();
    const next: Task = {
      ...existing,
      ...data,
      ...(data.titulo !== undefined ? { titulo: data.titulo.trim() } : {}),
      updatedAt: new Date(now),
    };
    this.tasks[idx] = next;
    return { ...next };
  }

  async delete(id: string): Promise<void> {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("NOT_FOUND");
    this.tasks.splice(idx, 1);
  }

  clear(): void {
    this.tasks = [];
  }

  seed(tasks: Task[]): void {
    this.tasks = [...tasks];
  }
}
