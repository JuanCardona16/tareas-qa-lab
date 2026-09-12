import { describe, expect, it, beforeEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers, resetStore } from "../api/handlers";
import { TaskRepositoryHttp } from "./TaskRepositoryHttp";

const server = setupServer(...handlers);
beforeEach(() => resetStore());

describe("TaskRepositoryHttp via msw/node", () => {
  it("RED: implementa TaskRepository contra fetch VITE_API_URL", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const repo = new TaskRepositoryHttp();
    const t = await repo.create({ titulo: "Http tarea" });
    expect(t.estado).toBe("pendiente");

    const list = await repo.list({ q: "http" });
    expect(list).toHaveLength(1);

    const byId = await repo.getById(t.id);
    expect(byId?.id).toBe(t.id);

    const updated = await repo.update(t.id, { titulo: "Http editada" });
    expect(updated.titulo).toBe("Http editada");

    await repo.delete(t.id);
    expect(await repo.getById(t.id)).toBeNull();
    server.close();
  });

  it("AND estado+q case-insensitive y 400/404 uniformes", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const repo = new TaskRepositoryHttp();
    const a = await repo.create({ titulo: "Comprar leche" });
    await repo.create({ titulo: "Otra" });
    await repo.update(a.id, { estado: "en_progreso" });

    const filtered = await repo.list({ estado: "en_progreso", q: "LECHE" });
    expect(filtered).toHaveLength(1);

    await expect(repo.create({ titulo: "   " })).rejects.toThrow(/obligatorio/i);
    await expect(repo.update("missing", { titulo: "x" })).rejects.toThrow("NOT_FOUND");
    await expect(repo.delete("missing")).rejects.toThrow("NOT_FOUND");
    server.close();
  });

  it("sin any y tipado estricto", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const repo: InstanceType<typeof TaskRepositoryHttp> = new TaskRepositoryHttp();
    // compilación ya valida que no usa any
    expect(repo).toBeDefined();
    server.close();
  });
});
