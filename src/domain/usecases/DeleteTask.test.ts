import { describe, expect, it } from "vitest";
import { DeleteTask } from "./DeleteTask";
import type { TaskRepository } from "../repositories/TaskRepository";
import type { Task } from "../entities/Task";

describe("DeleteTask", () => {
  it("CA-05: id inexistente -> NOT_FOUND", async () => {
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => null,
      create: async () => ({}) as Task,
      update: async () => ({}) as Task,
      delete: async () => {
        throw new Error("NOT_FOUND");
      },
    };
    const uc = new DeleteTask(repo);
    await expect(uc.execute("nope")).rejects.toThrow("NOT_FOUND");
  });

  it("elimina existente sin error", async () => {
    let deletedId = "";
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => ({
        id: "1",
        titulo: "x",
        estado: "pendiente",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      create: async () => ({}) as Task,
      update: async () => ({}) as Task,
      delete: async (id) => {
        deletedId = id;
      },
    };
    const uc = new DeleteTask(repo);
    await expect(uc.execute("1")).resolves.toBeUndefined();
    expect(deletedId).toBe("1");
  });

  it("delega 404 desde repo.getById null", async () => {
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => null,
      create: async () => ({}) as Task,
      update: async () => ({}) as Task,
      delete: async () => {},
    };
    const uc = new DeleteTask(repo);
    await expect(uc.execute("missing")).rejects.toThrow("NOT_FOUND");
  });
});
