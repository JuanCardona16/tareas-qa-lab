import { useMemo, useState } from "react";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/domain/entities/Task";
import { createApp, type App } from "../factory";

export interface UseTaskMutationsOptions {
  app?: App;
  onSuccess?: () => Promise<void> | void;
}

export interface UseTaskMutationsReturn {
  create: (input: CreateTaskInput) => Promise<Task>;
  update: (id: string, input: UpdateTaskInput) => Promise<Task>;
  remove: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useTaskMutations(options?: UseTaskMutationsOptions): UseTaskMutationsReturn {
  const app = useMemo(() => options?.app ?? createApp(), [options?.app]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(input: CreateTaskInput): Promise<Task> {
    setLoading(true);
    setError(null);
    try {
      const task = await app.createTask.execute(input);
      setError(null);
      await options?.onSuccess?.();
      return task;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear tarea";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: string, input: UpdateTaskInput): Promise<Task> {
    setLoading(true);
    setError(null);
    try {
      const task = await app.updateTask.execute(id, input);
      setError(null);
      await options?.onSuccess?.();
      return task;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar tarea";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await app.deleteTask.execute(id);
      setError(null);
      await options?.onSuccess?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar tarea";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { create, update, remove, loading, error };
}
