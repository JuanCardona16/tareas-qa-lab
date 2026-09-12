import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task, TaskFilters } from "@/domain/entities/Task";
import { createApp, type App } from "../factory";

export interface UseTasksOptions {
  app?: App;
}

export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTasks(filters?: TaskFilters, options?: UseTasksOptions): UseTasksReturn {
  const app = useMemo(() => options?.app ?? createApp(), [options?.app]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await app.listTasks.execute(filters);
      setTasks(result);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar tareas";
      setError(msg);
      setTasks([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, filters?.estado, filters?.q]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { tasks, loading, error, refresh };
}
