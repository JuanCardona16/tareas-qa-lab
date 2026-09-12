import type { Task, TaskStatus } from "@/application/factory";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onStatusChange?: (id: string, estado: TaskStatus) => Promise<void>;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => Promise<void>;
}

export function TaskList({ tasks, loading, error, onStatusChange, onEdit, onDelete }: TaskListProps) {
  if (loading) {
    return (
      <p role="status" aria-live="polite" className="py-8 text-center text-sm text-zinc-600">
        Cargando tareas...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" aria-live="assertive" className="py-8 text-center text-sm text-red-600">
        Error: {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <p role="status" className="py-8 text-center text-sm text-zinc-600">
        No hay tareas
      </p>
    );
  }

  return (
    <ul role="list" aria-label="Lista de tareas" className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
