import { describe, expect, it } from "vitest";
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from "./Task";
import { TASK_STATUSES } from "./Task";

describe("Task entity", () => {
  it("defines TaskStatus union", () => {
    const estados: TaskStatus[] = ["pendiente", "en_progreso", "completada"];
    expect(estados).toHaveLength(3);
    expect(TASK_STATUSES).toEqual(["pendiente", "en_progreso", "completada"]);
  });

  it("Task has required fields with correct types", () => {
    const task: Task = {
      id: "uuid-123",
      titulo: "Comprar leche",
      estado: "pendiente",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    };
    expect(task.id).toBe("uuid-123");
    expect(task.titulo).toBe("Comprar leche");
    expect(task.estado).toBe("pendiente");
    expect(task.createdAt).toBeInstanceOf(Date);
  });

  it("CreateTaskInput picks titulo and descripcion", () => {
    const input: CreateTaskInput = { titulo: "Hola" };
    expect(input.titulo).toBe("Hola");
    const withDesc: CreateTaskInput = { titulo: "Hola", descripcion: "desc" };
    expect(withDesc.descripcion).toBe("desc");
  });

  it("UpdateTaskInput is partial", () => {
    const patch: UpdateTaskInput = { estado: "en_progreso" };
    expect(patch.estado).toBe("en_progreso");
    const empty: UpdateTaskInput = {};
    expect(empty).toEqual({});
  });
});
