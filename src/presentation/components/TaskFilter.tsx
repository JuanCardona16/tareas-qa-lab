import type { TaskStatus } from "@/application/factory";
import { cn } from "@/lib/cn";

interface TaskFilterProps {
  estado: TaskStatus | undefined;
  q: string;
  onEstadoChange: (estado: TaskStatus | undefined) => void;
  onQChange: (q: string) => void;
  onClear: () => void;
}

export function TaskFilter({ estado, q, onEstadoChange, onQChange, onClear }: TaskFilterProps) {
  return (
    <form
      aria-label="Filtros de tareas"
      onSubmit={(e) => e.preventDefault()}
      className={cn("flex flex-col gap-2 rounded-lg border p-3", "bg-white")}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-estado" className="text-sm font-medium">
          Filtrar por estado
        </label>
        <select
          id="filter-estado"
          value={estado ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onEstadoChange(v === "" ? undefined : (v as TaskStatus));
          }}
          className="rounded border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <option value="">Todas</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-q" className="text-sm font-medium">
          Buscar
        </label>
        <input
          id="filter-q"
          type="search"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Buscar tareas..."
          className="rounded border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        aria-label="Limpiar filtros"
        className="self-start rounded border px-3 py-1.5 text-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
      >
        Limpiar filtros
      </button>
    </form>
  );
}
