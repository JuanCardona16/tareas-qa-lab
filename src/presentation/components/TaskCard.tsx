import { useState } from "react";
import type { Task, TaskStatus } from "@/application/factory";
import { cn } from "@/lib/cn";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, estado: TaskStatus) => Promise<void>;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => Promise<void>;
}

const statusLabels: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [changing, setChanging] = useState(false);

  async function handleStatusChange(value: string) {
    const estado = value as TaskStatus;
    if (estado === task.estado) return;
    setChanging(true);
    try {
      await onStatusChange?.(task.id, estado);
    } finally {
      setChanging(false);
    }
  }

  async function handleConfirmDelete() {
    await onDelete?.(task.id);
    setConfirming(false);
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 shadow-sm",
        "bg-white dark:bg-zinc-900",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold leading-tight">{task.titulo}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            task.estado === "pendiente" && "bg-yellow-100 text-yellow-800",
            task.estado === "en_progreso" && "bg-blue-100 text-blue-800",
            task.estado === "completada" && "bg-green-100 text-green-800",
          )}
        >
          {statusLabels[task.estado]}
        </span>
      </div>

      {task.descripcion ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.descripcion}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <label htmlFor={`estado-${task.id}`} className="sr-only">
          Cambiar estado
        </label>
        <select
          id={`estado-${task.id}`}
          aria-label="Cambiar estado"
          value={task.estado}
          onChange={(e) => void handleStatusChange(e.target.value)}
          disabled={changing}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>

        <button
          type="button"
          aria-label={`Editar tarea ${task.titulo}`}
          onClick={() => onEdit?.(task)}
          className="rounded border px-2 py-1 text-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          Editar
        </button>

        {!confirming ? (
          <button
            type="button"
            aria-label={`Eliminar tarea ${task.titulo}`}
            onClick={() => setConfirming(true)}
            className="rounded border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
          >
            Eliminar
          </button>
        ) : (
          <span className="flex items-center gap-1" role="group" aria-label="Confirmar eliminación">
            <button
              type="button"
              aria-label={`Confirmar eliminar ${task.titulo}`}
              onClick={() => void handleConfirmDelete()}
              className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700"
            >
              Confirmar
            </button>
            <button
              type="button"
              aria-label="Cancelar eliminación"
              onClick={() => setConfirming(false)}
              className="rounded border px-2 py-1 text-sm"
            >
              Cancelar
            </button>
          </span>
        )}
      </div>
    </li>
  );
}
