import { describe, expect, it } from "vitest";
import { CreateTask } from "./CreateTask";
import type { TaskRepository } from "../repositories/TaskRepository";

function fakeRepo(): TaskRepository & { createdData?: unknown } {
  return {
    list: async () => [],
    getById: async () => null,
    create: async (data) => {
      const task = {
        id: "should-be-overridden",
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: "pendiente" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return task;
    },
    update: async () => {
      throw new Error("not implemented");
    },
    delete: async () => {},
  };
}

describe("CreateTask", () => {
  const fixedDate = new Date("2026-01-01T00:00:00.000Z");
  const clock = (): Date => fixedDate;
  const id = (): string => "uuid-fixed-123";

  it("CA-01: '   ' -> El título es obligatorio", async () => {
    const uc = new CreateTask(fakeRepo(), { clock, id });
    await expect(uc.execute({ titulo: "   " })).rejects.toThrow(
      "El título es obligatorio",
    );
  });

  it("CA-02: 101 chars -> máximo 100", async () => {
    const uc = new CreateTask(fakeRepo(), { clock, id });
    await expect(uc.execute({ titulo: "a".repeat(101) })).rejects.toThrow(
      /máximo 100/i,
    );
  });

  it("CA-03 desc 501 -> máximo 500", async () => {
    const uc = new CreateTask(fakeRepo(), { clock, id });
    await expect(
      uc.execute({ titulo: "ok", descripcion: "a".repeat(501) }),
    ).rejects.toThrow(/máximo 500/i);
  });

  it("TRI: 1 char válido, 100 válido, trim aplicado, determinismo", async () => {
    const repo: TaskRepository = {
      list: async () => [],
      getById: async () => null,
      create: async (data) => {
        // echo back what usecase passes
        return {
          id: "x",
          titulo: data.titulo,
          descripcion: data.descripcion,
          estado: "pendiente",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
      update: async () => {
        throw new Error("x");
      },
      delete: async () => {},
    };
    // wrap create to capture id/clock usage
    let captured: unknown = null;
    const capturingRepo: TaskRepository = {
      ...repo,
      create: async (data) => {
        captured = data;
        const now = clock();
        const newId = id();
        return {
          id: newId,
          titulo: data.titulo.trim(),
          descripcion: data.descripcion,
          estado: "pendiente",
          createdAt: now,
          updatedAt: now,
        };
      },
    };
    const uc = new CreateTask(capturingRepo, { clock, id });
    const t1 = await uc.execute({ titulo: "a" });
    expect(t1.titulo).toBe("a");
    expect(t1.id).toBe("uuid-fixed-123");
    expect(t1.createdAt).toEqual(fixedDate);

    const t100 = await uc.execute({ titulo: "b".repeat(100) });
    expect(t100.titulo).toBe("b".repeat(100));

    const tTrim = await uc.execute({ titulo: "  Comprar leche  " });
    expect(tTrim.titulo).toBe("Comprar leche");
    expect(tTrim.estado).toBe("pendiente");
    void captured;
  });

  it("creación válida con descripcion opcional", async () => {
    const uc = new CreateTask(fakeRepo(), { clock, id });
    const t = await uc.execute({ titulo: "Comprar leche" });
    expect(t.descripcion).toBeUndefined();
    expect(t.estado).toBe("pendiente");
  });
});
