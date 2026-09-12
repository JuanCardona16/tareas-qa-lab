import { http, HttpResponse } from "msw";
import type { Task } from "@/domain/entities/Task";
import { TaskRepositoryInMemory } from "../repositories/TaskRepositoryInMemory";
import {
  validateDescripcion,
  validateTitulo,
  validateTransicion,
} from "@/domain/validators/taskValidators";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const store = new TaskRepositoryInMemory();

export function resetStore(): void {
  store.clear();
}

export function seedStore(tasks: Task[]): void {
  store.seed(tasks);
}

type ApiErrorBody = { error: string; details: Record<string, string> | null };

function toApi(task: Task): Record<string, unknown> {
  return {
    id: task.id,
    titulo: task.titulo,
    descripcion: task.descripcion,
    estado: task.estado,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function errorBody(error: string, details: Record<string, string> | null): ApiErrorBody {
  return { error, details };
}

export const handlers = [
  http.get(`${apiUrl}/api/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get(`${apiUrl}/api/tasks`, async ({ request }) => {
    try {
      const url = new URL(request.url);
      const estado = url.searchParams.get("estado") ?? undefined;
      const q = url.searchParams.get("q") ?? undefined;
      const filters: Record<string, string> = {};
      if (estado) filters.estado = estado;
      if (q !== undefined) filters.q = q;
      const tasks = await store.list({
        estado: filters.estado as Task["estado"] | undefined,
        q: filters.q,
      });
      return HttpResponse.json(tasks.map(toApi));
    } catch {
      return HttpResponse.json(errorBody("Error interno", null), { status: 500 });
    }
  }),

  http.get(`${apiUrl}/api/tasks/:id`, async ({ params }) => {
    try {
      const id = String(params.id);
      const task = await store.getById(id);
      if (!task) {
        return HttpResponse.json(errorBody("Tarea no encontrada", { id: "No existe" }), { status: 404 });
      }
      return HttpResponse.json(toApi(task));
    } catch {
      return HttpResponse.json(errorBody("Error interno", null), { status: 500 });
    }
  }),

  http.post(`${apiUrl}/api/tasks`, async ({ request }) => {
    try {
      const body = (await request.json()) as { titulo?: unknown; descripcion?: unknown };
      const titulo = typeof body.titulo === "string" ? body.titulo : "";
      const descripcion = typeof body.descripcion === "string" ? body.descripcion : undefined;
      const details: Record<string, string> = {};
      const tErr = validateTitulo(titulo);
      if (tErr) details.titulo = tErr;
      const dErr = validateDescripcion(descripcion);
      if (dErr) details.descripcion = dErr;
      if (Object.keys(details).length > 0) {
        return HttpResponse.json(errorBody("Error de validación", details), { status: 400 });
      }
      const created = await store.create({ titulo, descripcion });
      return HttpResponse.json(toApi(created), { status: 201 });
    } catch {
      return HttpResponse.json(errorBody("Error interno", null), { status: 500 });
    }
  }),

  http.put(`${apiUrl}/api/tasks/:id`, async ({ params, request }) => {
    try {
      const id = String(params.id);
      const existing = await store.getById(id);
      if (!existing) {
        return HttpResponse.json(errorBody("Tarea no encontrada", { id: "No existe" }), { status: 404 });
      }
      const body = (await request.json()) as {
        titulo?: unknown;
        descripcion?: unknown;
        estado?: unknown;
      };
      const details: Record<string, string> = {};
      if (body.titulo !== undefined) {
        const err = validateTitulo(String(body.titulo));
        if (err) details.titulo = err;
      }
      if (body.descripcion !== undefined) {
        const val = body.descripcion === null ? undefined : String(body.descripcion);
        const err = validateDescripcion(val === "" ? undefined : val);
        if (err) details.descripcion = err;
      }
      if (body.estado !== undefined) {
        const estado = String(body.estado) as Task["estado"];
        const valid = ["pendiente", "en_progreso", "completada"].includes(estado);
        if (!valid) details.estado = "Estado no válido";
        else {
          const err = validateTransicion(existing.estado, estado);
          if (err) details.estado = err;
        }
      }
      if (Object.keys(details).length > 0) {
        return HttpResponse.json(errorBody("Error de validación", details), { status: 400 });
      }
      const input: Record<string, unknown> = {};
      if (body.titulo !== undefined) input.titulo = String(body.titulo);
      if (body.descripcion !== undefined) input.descripcion = body.descripcion === null ? undefined : String(body.descripcion);
      if (body.estado !== undefined) input.estado = String(body.estado);
      const updated = await store.update(id, input as never);
      return HttpResponse.json(toApi(updated));
    } catch {
      return HttpResponse.json(errorBody("Error interno", null), { status: 500 });
    }
  }),

  http.delete(`${apiUrl}/api/tasks/:id`, async ({ params }) => {
    try {
      const id = String(params.id);
      await store.delete(id);
      return new HttpResponse(null, { status: 204 });
    } catch (e) {
      if (e instanceof Error && e.message === "NOT_FOUND") {
        return HttpResponse.json(errorBody("Tarea no encontrada", { id: "No existe" }), { status: 404 });
      }
      return HttpResponse.json(errorBody("Error interno", null), { status: 500 });
    }
  }),
];
