import { describe, expect, it } from "vitest";
import { createApp } from "./factory";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";
import type { Task } from "@/domain/entities/Task";

function repoFalso(tareas: Task[] = []): TaskRepository & { calls: string[] } {
  const calls: string[] = [];
  const store: Task[] = [...tareas];
  return {
    calls,
    list: async (f) => {
      calls.push(`list:${JSON.stringify(f)}`);
      let r = [...store];
      if (f?.estado) r = r.filter((t) => t.estado === f.estado);
      if (f?.q) {
        const q = f.q.toLowerCase();
        r = r.filter((t) => `${t.titulo} ${t.descripcion ?? ""}`.toLowerCase().includes(q));
      }
      return r;
    },
    getById: async (id) => store.find((t) => t.id === id) ?? null,
    create: async (data) => {
      calls.push(`create:${data.titulo}`);
      const now = new Date("2026-01-01T10:00:00.000Z");
      const task: Task = {
        id: `fake-${store.length + 1}`,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: "pendiente",
        createdAt: now,
        updatedAt: now,
      };
      store.push(task);
      return task;
    },
    update: async (id, data) => {
      calls.push(`update:${id}`);
      const idx = store.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("NOT_FOUND");
      store[idx] = { ...store[idx], ...data } as Task;
      return store[idx];
    },
    delete: async (id) => {
      calls.push(`delete:${id}`);
      const idx = store.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("NOT_FOUND");
      store.splice(idx, 1);
    },
  };
}

describe("factory createApp — ADR-05 única infra", () => {
  it("usa repositorio falso inyectado sin tocar infraestructura real", async () => {
    const fake = repoFalso();
    const app = createApp({ repo: fake });
    const creada = await app.createTask.execute({ titulo: "Comprar leche" });
    expect(creada.titulo).toBe("Comprar leche");
    expect(fake.calls.some((c) => c.startsWith("create:"))).toBe(true);
    const listadas = await app.listTasks.execute();
    expect(listadas.length).toBe(1);
  });

  it("inyecta clock e id determinísticos vía InMemory", async () => {
    const fixedDate = new Date("2026-03-15T12:00:00.000Z");
    const app = createApp({ clock: () => fixedDate, id: () => "id-deterministico" });
    const creada = await app.createTask.execute({ titulo: "Titulo ok" });
    expect(creada.id).toBe("id-deterministico");
    expect(creada.createdAt).toEqual(fixedDate);
    expect(creada.updatedAt).toEqual(fixedDate);
  });

  it("por defecto crea InMemory sin inyección y opera", async () => {
    const app = createApp();
    const creada = await app.createTask.execute({ titulo: "Tarea default" });
    expect(creada.titulo).toBe("Tarea default");
    const todas = await app.listTasks.execute();
    expect(todas.some((t) => t.titulo === "Tarea default")).toBe(true);
  });

  it("expone los 5 usecases + repo con misma instancia", async () => {
    const app = createApp();
    expect(app.repo).toBeDefined();
    expect(app.createTask).toBeDefined();
    expect(app.updateTask).toBeDefined();
    expect(app.deleteTask).toBeDefined();
    expect(app.listTasks).toBeDefined();
    expect(app.getTaskById).toBeDefined();
  });

  it("dos createApp sin inyección son independientes (no singleton global)", async () => {
    const a1 = createApp();
    const a2 = createApp();
    await a1.createTask.execute({ titulo: "Solo A1" });
    const l2 = await a2.listTasks.execute();
    expect(l2.length).toBe(0);
  });
});
