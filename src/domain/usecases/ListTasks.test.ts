import { describe, expect, it } from "vitest";
import { ListTasks } from "./ListTasks";
import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

function makeTask(overrides: Partial<Task> & { titulo: string }): Task {
  return {
    id: Math.random().toString(),
    estado: "pendiente",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("ListTasks", () => {
  it("CA-04: filtra AND estado + q case-insensitive", async () => {
    const tasks: Task[] = [
      makeTask({ id: "1", titulo: "Comprar leche", estado: "pendiente" }),
      makeTask({ id: "2", titulo: "LECHE de avena", estado: "completada" }),
      makeTask({ id: "3", titulo: "Comprar pan", estado: "pendiente" }),
    ];
    const repo: TaskRepository = {
      list: async (filters) => {
        let out = tasks;
        if (filters?.estado) out = out.filter((t) => t.estado === filters.estado);
        if (filters?.q) {
          const q = filters.q.toLowerCase();
          out = out.filter(
            (t) =>
              t.titulo.toLowerCase().includes(q) ||
              (t.descripcion ?? "").toLowerCase().includes(q),
          );
        }
        return out;
      },
      getById: async () => null,
      create: async () => tasks[0],
      update: async () => tasks[0],
      delete: async () => {},
    };
    const uc = new ListTasks(repo);
    const result = await uc.execute({ estado: "pendiente", q: "leche" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("sin filtros retorna todo", async () => {
    const tasks = [makeTask({ id: "1", titulo: "a" }), makeTask({ id: "2", titulo: "b" })];
    const repo: TaskRepository = {
      list: async () => tasks,
      getById: async () => null,
      create: async () => tasks[0],
      update: async () => tasks[0],
      delete: async () => {},
    };
    const uc = new ListTasks(repo);
    expect(await uc.execute()).toEqual(tasks);
    expect(await uc.execute({})).toEqual(tasks);
  });

  it("q busca en descripcion también", async () => {
    const tasks: Task[] = [
      makeTask({ id: "1", titulo: "Tarea 1", descripcion: "comprar LECHE" }),
      makeTask({ id: "2", titulo: "Tarea 2", descripcion: "otra cosa" }),
    ];
    const repo: TaskRepository = {
      list: async (filters) => {
        if (!filters?.q) return tasks;
        const q = filters.q.toLowerCase();
        return tasks.filter(
          (t) =>
            t.titulo.toLowerCase().includes(q) ||
            (t.descripcion ?? "").toLowerCase().includes(q),
        );
      },
      getById: async () => null,
      create: async () => tasks[0],
      update: async () => tasks[0],
      delete: async () => {},
    };
    const uc = new ListTasks(repo);
    const result = await uc.execute({ q: "leche" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
