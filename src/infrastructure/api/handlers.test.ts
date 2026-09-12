import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { handlers, resetStore, seedStore } from "./handlers";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const server = setupServer(...handlers);

beforeEach(() => {
  resetStore();
});

describe("MSW handlers - Task API fachada", () => {
  // usa setupServer local para aislar, aunque global server ya existe
  it("RED: GET /api/health 200", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const res = await fetch(`${apiUrl}/api/health`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { status: string };
    expect(json.status).toBe("ok");
    server.close();
  });

  it("GET /api/tasks lista vacía y con filtros AND q case-insensitive", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    // vacía
    let res = await fetch(`${apiUrl}/api/tasks`);
    expect(res.status).toBe(200);
    let body = (await res.json()) as unknown[];
    expect(body).toHaveLength(0);

    // crear dos tareas vía POST para probar filtros reales
    await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "Comprar leche" }),
    });
    await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "Estudiar", descripcion: "LECHE prueba" }),
    });

    // filtro q case-insensitive
    res = await fetch(`${apiUrl}/api/tasks?q=leche`);
    body = (await res.json()) as unknown[];
    expect(body).toHaveLength(2);

    // estado filter - crear y pasar a en_progreso
    const all = (await (await fetch(`${apiUrl}/api/tasks`)).json()) as { id: string; titulo: string }[];
    await fetch(`${apiUrl}/api/tasks/${all[0].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_progreso" }),
    });
    res = await fetch(`${apiUrl}/api/tasks?estado=en_progreso&q=leche`);
    body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);

    server.close();
  });

  it("GET /api/tasks/:id 200|404", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    let res = await fetch(`${apiUrl}/api/tasks/nope`);
    expect(res.status).toBe(404);
    const err = (await res.json()) as { error: string; details: unknown };
    expect(err.error).toBeDefined();
    expect(err.details).toBeDefined();

    const created = await (
      await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Hola" }),
      })
    ).json() as { id: string };
    res = await fetch(`${apiUrl}/api/tasks/${created.id}`);
    expect(res.status).toBe(200);
    const task = (await res.json()) as { id: string };
    expect(task.id).toBe(created.id);
    server.close();
  });

  it("POST /api/tasks 201|400 valida titulo y descripcion", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    let res = await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "   " }),
    });
    expect(res.status).toBe(400);
    const err = (await res.json()) as { error: string; details: Record<string, string> | null };
    expect(err.error).toMatch(/validación/i);
    expect(err.details?.titulo).toMatch(/obligatorio/i);

    res = await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "a".repeat(101) }),
    });
    expect(res.status).toBe(400);

    res = await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "ok", descripcion: "a".repeat(501) }),
    });
    expect(res.status).toBe(400);
    const err2 = (await res.json()) as { error: string; details: Record<string, string> | null };
    expect(err2.details?.descripcion).toMatch(/500/i);

    res = await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "  Valido  ", descripcion: "desc" }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { titulo: string; estado: string };
    expect(body.titulo).toBe("Valido");
    expect(body.estado).toBe("pendiente");
    server.close();
  });

  it("PUT /api/tasks/:id 200|400|404 valida transición", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    let res = await fetch(`${apiUrl}/api/tasks/missing`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "x" }),
    });
    expect(res.status).toBe(404);

    const created = (await (
      await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Tarea" }),
      })
    ).json()) as { id: string };

    // 400 por titulo vacío
    res = await fetch(`${apiUrl}/api/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "   " }),
    });
    expect(res.status).toBe(400);

    // transición inválida pendiente -> completada debe 400
    res = await fetch(`${apiUrl}/api/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "completada" }),
    });
    expect(res.status).toBe(400);
    const err3 = (await res.json()) as { details: Record<string, string> | null };
    expect(err3.details?.estado).toMatch(/transición/i);

    // transición válida pendiente -> en_progreso 200
    res = await fetch(`${apiUrl}/api/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_progreso" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as { estado: string };
    expect(updated.estado).toBe("en_progreso");

    server.close();
  });

  it("DELETE /api/tasks/:id 204|404", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    let res = await fetch(`${apiUrl}/api/tasks/nope`, { method: "DELETE" });
    expect(res.status).toBe(404);
    const err = (await res.json()) as { error: string };
    expect(err.error).toBeDefined();

    const created = (await (
      await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Borrar" }),
      })
    ).json()) as { id: string };
    res = await fetch(`${apiUrl}/api/tasks/${created.id}`, { method: "DELETE" });
    expect(res.status).toBe(204);

    res = await fetch(`${apiUrl}/api/tasks/${created.id}`);
    expect(res.status).toBe(404);
    server.close();
  });

  it("error uniforme {error, details} en todos los 4xx", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const res = await fetch(`${apiUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "" }),
    });
    const body = (await res.json()) as { error: string; details: unknown };
    expect(typeof body.error).toBe("string");
    expect("details" in body).toBe(true);
    server.close();
    void http;
    void HttpResponse;
  });

  it("seedStore permite determinismo en tests", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    seedStore([
      {
        id: "seed-1",
        titulo: "Seed",
        estado: "pendiente",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    const res = await fetch(`${apiUrl}/api/tasks/seed-1`);
    expect(res.status).toBe(200);
    server.close();
  });
});
