import { useEffect, useState } from "react";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/application/factory";
import { validateTitulo, validateDescripcion } from "@/lib/validators";
import { cn } from "@/lib/cn";

interface TaskFormProps {
  initialTask?: Task | null;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function TaskForm({ initialTask, onSubmit, onCancel, loading }: TaskFormProps) {
  const [titulo, setTitulo] = useState(initialTask?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(initialTask?.descripcion ?? "");
  const [tituloError, setTituloError] = useState<string | null>(null);
  const [descripcionError, setDescripcionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = Boolean(initialTask);

  useEffect(() => {
    setTitulo(initialTask?.titulo ?? "");
    setDescripcion(initialTask?.descripcion ?? "");
    setTituloError(null);
    setDescripcionError(null);
    setSubmitError(null);
  }, [initialTask]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tError = validateTitulo(titulo);
    const dError = validateDescripcion(descripcion);
    setTituloError(tError);
    setDescripcionError(dError);
    if (tError || dError) return;

    setSubmitError(null);
    try {
      const payload: CreateTaskInput | UpdateTaskInput = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() ? descripcion.trim() : undefined,
      };
      await onSubmit(payload);
      if (!isEditing) {
        setTitulo("");
        setDescripcion("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar tarea";
      setSubmitError(msg);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      aria-label={isEditing ? "Editar tarea" : "Crear tarea"}
      noValidate
      className={cn("flex flex-col gap-3 rounded-lg border p-4", "bg-white")}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="task-titulo" className="text-sm font-medium">
          Título
        </label>
        <input
          id="task-titulo"
          name="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          aria-invalid={Boolean(tituloError)}
          aria-describedby={tituloError ? "titulo-error" : undefined}
          className="rounded border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          placeholder="Ej: Comprar leche"
        />
        {tituloError ? (
          <p id="titulo-error" role="alert" aria-live="polite" className="text-xs text-red-600">
            {tituloError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="task-descripcion" className="text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="task-descripcion"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          aria-invalid={Boolean(descripcionError)}
          aria-describedby={descripcionError ? "descripcion-error" : undefined}
          rows={3}
          className="rounded border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          placeholder="Opcional, máximo 500 caracteres"
        />
        {descripcionError ? (
          <p id="descripcion-error" role="alert" aria-live="polite" className="text-xs text-red-600">
            {descripcionError}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p role="alert" aria-live="assertive" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={Boolean(loading)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {isEditing ? "Guardar cambios" : "Crear tarea"}
        </button>
        {isEditing && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2 text-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
