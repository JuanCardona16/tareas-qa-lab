import { describe, expect, it } from "vitest";
import { GetTaskById } from "./GetTaskById";
import type { Task } from "../entities/Task";
import type { TaskRepository } from "../repositories/TaskRepository";

describe("GetTaskById", () => {
  it("retorna Task si existe", async () => {
    const task: Task = {
      id: "1",
      titulo: "Hola",
      estado: "pendiente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repo: TaskRepository = {
      list: async () => [],
      getById: async (id) => (id === "1" ? task : null),
      create: async () => task,
      update: async () => task,
      delete: async () => {},
    };
    const uc = new GetTaskById(repo);
    expect(await uc.execute("1")).toEqual(task);
  });

  it("retorna null si no existe", async () => {
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => null,
      create: async () => ({}) as Task,
      update: async () => ({}) as Task,
      delete: async () => {},
    };
    const uc = new GetTaskById(repo);
    expect(await uc.execute("nope")).toBeNull();
  });
});
