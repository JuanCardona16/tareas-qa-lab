import type { Task, TaskFilters, TaskStatus } from "@/domain/entities/Task";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiTaskRaw = {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type ApiError = { error: string; details: Record<string, string> | null };

function toDomain(raw: ApiTaskRaw): Task {
  return {
    id: raw.id,
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    estado: raw.estado,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

async function handleError(res: Response): Promise<never> {
  let body: ApiError | null = null;
  try {
    body = (await res.json()) as ApiError;
  } catch {
    body = null;
  }
  if (res.status === 404) throw new Error("NOT_FOUND");
  if (body?.details) {
    const msg = Object.values(body.details).join("; ");
    throw new Error(msg || body.error);
  }
  throw new Error(body?.error ?? `HTTP ${res.status}`);
}

export async function apiList(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.estado) params.set("estado", filters.estado);
  if (filters?.q !== undefined) params.set("q", filters.q);
  const qs = params.toString();
  const url = qs ? `${baseUrl}/api/tasks?${qs}` : `${baseUrl}/api/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw await handleError(res).catch((e: Error) => { throw e; });
  const raw = (await res.json()) as ApiTaskRaw[];
  return raw.map(toDomain);
}

export async function apiGetById(id: string): Promise<Task | null> {
  const res = await fetch(`${baseUrl}/api/tasks/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw await handleError(res).catch((e: Error) => { throw e; });
  const raw = (await res.json()) as ApiTaskRaw;
  return toDomain(raw);
}

export async function apiCreate(data: { titulo: string; descripcion?: string }): Promise<Task> {
  const res = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await handleError(res).catch((e: Error) => { throw e; });
  const raw = (await res.json()) as ApiTaskRaw;
  return toDomain(raw);
}

export async function apiUpdate(
  id: string,
  data: Partial<{ titulo: string; descripcion: string; estado: TaskStatus }>,
): Promise<Task> {
  const res = await fetch(`${baseUrl}/api/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await handleError(res).catch((e: Error) => { throw e; });
  const raw = (await res.json()) as ApiTaskRaw;
  return toDomain(raw);
}

export async function apiRemove(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (res.status === 204) return;
  if (!res.ok) throw await handleError(res).catch((e: Error) => { throw e; });
}
