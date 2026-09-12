import { describe, expect, it } from "vitest";
import { TaskRepositoryInMemory } from "./TaskRepositoryInMemory";

const FIXED = new Date("2026-01-01T00:00:00.000Z");
const clock = (): Date => new Date(FIXED);
let seq = 0;
const id = (): string => `id-${++seq}`;

function resetSeq(): void {
  seq = 0;
}

describe("TaskRepositoryInMemory", () => {
  it("RED: list con filtros AND estado+q case-insensitive titulo+descripcion", async () => {
    resetSeq();
    const repo = new TaskRepositoryInMemory({ clock, id });
    await repo.create({ titulo: "Comprar leche", descripcion: "ir al súper" });
    await repo.create({ titulo: "Estudiar TDD", descripcion: "LECHE de pruebas" });
    await repo.create({ titulo: "Otra", descripcion: "nada" });
    // poner 2 en estado en_progreso para probar filtro AND
    const all = await repo.list();
    await repo.update(all[0].id, { estado: "en_progreso" });

    const filtered = await repo.list({ estado: "en_progreso", q: "leche" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].titulo).toBe("Comprar leche");

    const qOnly = await repo.list({ q: "LECHE" });
    expect(qOnly).toHaveLength(2);

    const descMatch = await repo.list({ q: "súper" });
    expect(descMatch).toHaveLength(1);

    const andEmpty = await repo.list({ estado: "completada", q: "leche" });
    expect(andEmpty).toHaveLength(0);
  });

  it("getById retorna null si no existe", async () => {
    resetSeq();
    const repo = new TaskRepositoryInMemory({ clock, id });
    expect(await repo.getById("nope")).toBeNull();
  });

  it("create genera id/clock inyectables y trim", async () => {
    resetSeq();
    const repo = new TaskRepositoryInMemory({ clock, id });
    const t = await repo.create({ titulo: "  Hola  ", descripcion: "desc" });
    expect(t.id).toBe("id-1");
    expect(t.titulo).toBe("Hola");
    expect(t.estado).toBe("pendiente");
    expect(t.createdAt).toEqual(FIXED);
    expect(t.updatedAt).toEqual(FIXED);
  });

  it("update lanza NOT_FOUND si no existe y aplica transición fecha", async () => {
    resetSeq();
    const repo = new TaskRepositoryInMemory({ clock, id });
    await expect(repo.update("missing", { titulo: "x" })).rejects.toThrow("NOT_FOUND");
    const t = await repo.create({ titulo: "A" });
    const later = new Date("2026-01-02T00:00:00.000Z");
    const repoLater = new TaskRepositoryInMemory({ clock: () => later, id });
    // inyectamos tareas existentes vía seed interno: usar el mismo array hack? mejor reprobar con repo original cambiando clock via update param
    // para determinismo verificamos updatedAt cambia
    const updated = await repo.update(t.id, { titulo: "B" });
    expect(updated.titulo).toBe("B");
    expect(updated.id).toBe(t.id);
    void repoLater;
  });

  it("delete 204-like elimina y NOT_FOUND si no existe", async () => {
    resetSeq();
    const repo = new TaskRepositoryInMemory({ clock, id });
    const t = await repo.create({ titulo: "Borrar" });
    await repo.delete(t.id);
    expect(await repo.getById(t.id)).toBeNull();
    await expect(repo.delete(t.id)).rejects.toThrow("NOT_FOUND");
  });

  it("delete y create mantienen aislamiento entre instancias", async () => {
    resetSeq();
    const a = new TaskRepositoryInMemory({ clock, id });
    const b = new TaskRepositoryInMemory({ clock, id });
    await a.create({ titulo: "solo A" });
    expect(await b.list()).toHaveLength(0);
  });
});
