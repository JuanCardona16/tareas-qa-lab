import { useCallback, useMemo, useState } from "react";
import type { TaskFilters, TaskStatus } from "@/domain/entities/Task";
import { useDebouncedValue } from "./useDebouncedValue";

export interface UseTaskFiltersReturn {
  filters: TaskFilters;
  estado: TaskStatus | undefined;
  q: string;
  debouncedQ: string;
  setEstado: (estado: TaskStatus | undefined) => void;
  setQ: (q: string) => void;
  clear: () => void;
}

export function useTaskFilters(): UseTaskFiltersReturn {
  const [estado, setEstado] = useState<TaskStatus | undefined>(undefined);
  const [q, setQ] = useState<string>("");
  const debouncedQ = useDebouncedValue(q, 300);

  const filters: TaskFilters = useMemo(() => {
    const f: TaskFilters = {};
    if (estado !== undefined) f.estado = estado;
    const trimmed = debouncedQ.trim();
    if (trimmed !== "") f.q = trimmed;
    return f;
  }, [estado, debouncedQ]);

  const clear = useCallback(() => {
    setEstado(undefined);
    setQ("");
  }, []);

  return { filters, estado, q, debouncedQ, setEstado, setQ, clear };
}
