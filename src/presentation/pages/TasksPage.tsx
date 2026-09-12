import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "@/application/factory";
import { createApp } from "@/application/factory";
import { useTasks } from "@/application/hooks/useTasks";
import { useTaskMutations } from "@/application/hooks/useTaskMutations";
import { useTaskFilters } from "@/application/hooks/useTaskFilters";
import { TaskList } from "../components/TaskList";
import { TaskForm } from "../components/TaskForm";
import { TaskFilter } from "../components/TaskFilter";

interface TasksPageProps {
  app?: ReturnType<typeof createApp>;
}

export function TasksPage({ app: appProp }: TasksPageProps = {}) {
  const app = useMemo(() => appProp ?? createApp(), [appProp]);
  const { filters, estado, q, setEstado, setQ, clear } = useTaskFilters();
  const { tasks, loading, error, refresh } = useTasks(filters, { app });
  const { create, update, remove, loading: mutating, error: mutationError } = useTaskMutations({
    app,
    onSuccess: refresh,
  });

  const [editing, setEditing] = useState<Task | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleCreate(data: { titulo: string; descripcion?: string }) {
    await create(data);
    setSuccessMsg("Tarea creada");
  }

  async function handleUpdate(data: { titulo?: string; descripcion?: string }) {
    if (!editing) return;
    await update(editing.id, data);
    setSuccessMsg("Tarea actualizada");
    setEditing(null);
  }

  async function handleStatusChange(id: string, estadoValue: TaskStatus) {
    await update(id, { estado: estadoValue });
    setSuccessMsg("Estado actualizado");
  }

  async function handleDelete(id: string) {
    await remove(id);
    setSuccessMsg("Tarea eliminada");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3 py-4 sm:px-4">
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {loading ? "Cargando" : null}
        {successMsg ? successMsg : null}
      </div>

      {mutationError ? (
        <p role="alert" aria-live="assertive" className="rounded bg-red-50 p-2 text-sm text-red-700">
          {mutationError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" aria-live="assertive" className="rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {successMsg ? (
        <p role="status" aria-live="polite" className="rounded bg-green-50 p-2 text-sm text-green-700">
          {successMsg}
        </p>
      ) : null}

      <TaskFilter estado={estado} q={q} onEstadoChange={setEstado} onQChange={setQ} onClear={clear} />

      {editing ? (
        <TaskForm
          initialTask={editing}
          onSubmit={(d) => handleUpdate(d as { titulo?: string; descripcion?: string })}
          onCancel={() => setEditing(null)}
          loading={mutating}
        />
      ) : (
        <TaskForm onSubmit={(d) => handleCreate(d as { titulo: string; descripcion?: string })} loading={mutating} />
      )}

      <TaskList
        tasks={tasks}
        loading={loading}
        error={null}
        onStatusChange={handleStatusChange}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
    </div>
  );
}
