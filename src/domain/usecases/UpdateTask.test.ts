import { describe, expect, it } from "vitest";
import { UpdateTask } from "./UpdateTask";
import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    titulo: "Original",
    estado: "pendiente",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("UpdateTask", () => {
  const fixedDate = new Date("2026-01-02T00:00:00Z");
  const clock = (): Date => fixedDate;

  it("CA-03: pendiente -> completada -> transición inválida", async () => {
    const task = makeTask({ estado: "pendiente" });
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => task,
      create: async () => task,
      update: async (_id, data) => ({ ...task, ...data }) as Task,
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    await expect(uc.execute("1", { estado: "completada" })).rejects.toThrow(
      /transición inválida/i,
    );
  });

  it("avance válido pendiente -> en_progreso y updatedAt posterior", async () => {
    const task = makeTask({ estado: "pendiente" });
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => task,
      create: async () => task,
      update: async (_id, data) => ({ ...task, ...data, updatedAt: clock() }),
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    const updated = await uc.execute("1", { estado: "en_progreso" });
    expect(updated.estado).toBe("en_progreso");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      task.createdAt.getTime(),
    );
  });

  it("en_progreso -> completada válido", async () => {
    const task = makeTask({ estado: "en_progreso" });
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => task,
      create: async () => task,
      update: async (_id, data) => ({ ...task, ...data, updatedAt: clock() }),
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    const updated = await uc.execute("1", { estado: "completada" });
    expect(updated.estado).toBe("completada");
  });

  it("404 si no existe -> NOT_FOUND", async () => {
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => null,
      create: async () => makeTask(),
      update: async () => makeTask(),
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    await expect(uc.execute("nope", { titulo: "x" })).rejects.toThrow(
      "NOT_FOUND",
    );
  });

  it("valida titulo 101 y descripcion 501 en update", async () => {
    const task = makeTask();
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => task,
      create: async () => task,
      update: async () => task,
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    await expect(uc.execute("1", { titulo: "a".repeat(101) })).rejects.toThrow(
      /máximo 100/i,
    );
    await expect(
      uc.execute("1", { descripcion: "a".repeat(501) }),
    ).rejects.toThrow(/máximo 500/i);
    await expect(uc.execute("1", { titulo: "   " })).rejects.toThrow(
      "El título es obligatorio",
    );
  });

  it("trim de titulo en update", async () => {
    const task = makeTask();
    let savedTitulo = "";
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => task,
      create: async () => task,
      update: async (_id, data) => {
        savedTitulo = data.titulo ?? "";
        return { ...task, ...data, titulo: savedTitulo, updatedAt: clock() };
      },
      delete: async () => {},
    };
    const uc = new UpdateTask(repo, { clock });
    await uc.execute("1", { titulo: "  nuevo  " });
    expect(savedTitulo).toBe("nuevo");
  });
});
