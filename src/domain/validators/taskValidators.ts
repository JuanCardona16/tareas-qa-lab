import type { TaskStatus } from "../entities/Task";

export function validateTitulo(titulo: string): string | null {
  const trimmed = titulo.trim();
  if (trimmed.length === 0) {
    return "El título es obligatorio";
  }
  if (trimmed.length > 100) {
    return "El título debe tener como máximo 100 caracteres";
  }
  return null;
}

export function validateDescripcion(
  descripcion: string | undefined,
): string | null {
  if (descripcion === undefined || descripcion === "") {
    return null;
  }
  if (descripcion.length > 500) {
    return "La descripción debe tener como máximo 500 caracteres";
  }
  return null;
}

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus | null> = {
  pendiente: "en_progreso",
  en_progreso: "completada",
  completada: null,
};

export function isValidTransition(
  from: TaskStatus,
  to: TaskStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from] === to;
}

export function validateTransicion(
  from: TaskStatus,
  to: TaskStatus,
): string | null {
  if (isValidTransition(from, to)) {
    return null;
  }
  return "transición inválida";
}
