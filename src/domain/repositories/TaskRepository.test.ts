import { describe, expect, it } from "vitest";
import type { Task } from "../entities/Task";
import type { TaskRepository } from "./TaskRepository";

function createFakeRepo(tasks: Task[] = []): TaskRepository {
  return {
    list: async (filters) => {
      void filters;
      return tasks;
    },
    getById: async (id) => tasks.find((t) => t.id === id) ?? null,
    create: async (data) => {
      const now = new Date();
      const task: Task = {
        id: "fake-id",
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: "pendiente",
        createdAt: now,
        updatedAt: now,
      };
      return task;
    },
    update: async (id, data) => {
      const found = tasks.find((t) => t.id === id);
      if (!found) throw new Error("NOT_FOUND");
      return { ...found, ...data, updatedAt: new Date() };
    },
    delete: async (id) => {
      const found = tasks.find((t) => t.id === id);
      if (!found) throw new Error("NOT_FOUND");
    },
  };
}

describe("TaskRepository interface", () => {
  it("exposes 5 methods", async () => {
    const repo: TaskRepository = createFakeRepo();
    expect(typeof repo.list).toBe("function");
    expect(typeof repo.getById).toBe("function");
    expect(typeof repo.create).toBe("function");
    expect(typeof repo.update).toBe("function");
    expect(typeof repo.delete).toBe("function");
  });

  it("list returns tasks", async () => {
    const task: Task = {
      id: "1",
      titulo: "Test",
      estado: "pendiente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo = createFakeRepo([task]);
    const result = await repo.list();
    expect(result).toEqual([task]);
  });

  it("getById returns null if not found", async () => {
    const repo = createFakeRepo([]);
    expect(await repo.getById("nope")).toBeNull();
  });

  it("create returns Task with pendiente", async () => {
    const repo = createFakeRepo();
    const created = await repo.create({ titulo: "Hola" });
    expect(created.estado).toBe("pendiente");
  });

  it("update throws NOT_FOUND if missing", async () => {
    const repo = createFakeRepo([]);
    await expect(repo.update("x", { titulo: "y" })).rejects.toThrow("NOT_FOUND");
  });

  it("delete throws NOT_FOUND if missing", async () => {
    const repo = createFakeRepo([]);
    await expect(repo.delete("x")).rejects.toThrow("NOT_FOUND");
  });
});
