import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTasks } from "./useTasks";
import { createApp } from "../factory";
import type { Task } from "@/domain/entities/Task";

function fixedDate(): Date {
  return new Date("2026-01-01T10:00:00.000Z");
}
let seq = 0;
function fixedId(): string {
  seq += 1;
  return `id-${seq}`;
}

describe("useTasks — loading/error/refresh", () => {
  beforeEach(() => {
    seq = 0;
  });

  it("carga inicial expone loading y luego tasks", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    await app.createTask.execute({ titulo: "A" });
    const { result } = renderHook(() => useTasks({}, { app }));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.length).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("Fallo de carga → loading false y error visible en español", async () => {
    const fakeApp = createApp({ clock: fixedDate, id: fixedId });
    // sabotear repo para que list falle
    vi.spyOn(fakeApp.repo, "list").mockRejectedValueOnce(new Error("Fallo de red"));
    const { result } = renderHook(() => useTasks({}, { app: fakeApp }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(typeof result.current.error).toBe("string");
    expect(result.current.tasks).toEqual([]);
  });

  it("refresh recarga la lista tras mutación externa", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const { result } = renderHook(() => useTasks({}, { app }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.length).toBe(0);
    await app.createTask.execute({ titulo: "Nueva" });
    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.tasks.length).toBe(1));
    expect(result.current.tasks[0].titulo).toBe("Nueva");
  });

  it("filtros AND se pasan al repositorio (estado + q)", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    await app.createTask.execute({ titulo: "Comprar leche" });
    await app.createTask.execute({ titulo: "Comprar pan" });
    // cambiar segunda a en_progreso
    const todas = await app.listTasks.execute();
    const segunda = todas.find((t) => t.titulo === "Comprar pan") as Task;
    await app.repo.update(segunda.id, { estado: "en_progreso" });

    const { result } = renderHook(() => useTasks({ estado: "pendiente", q: "leche" }, { app }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.length).toBe(1);
    expect(result.current.tasks[0].titulo).toBe("Comprar leche");
  });

  it("empty: sin tareas → tasks [] sin error", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const { result } = renderHook(() => useTasks({}, { app }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("cambia filtros y recarga (q vacía ignora filtro)", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    await app.createTask.execute({ titulo: "Leche" });
    const { result, rerender } = renderHook(({ f }) => useTasks(f, { app }), {
      initialProps: { f: { q: "leche" } as { q?: string; estado?: Task["estado"] } },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.length).toBe(1);
    rerender({ f: { q: "" } });
    await waitFor(() => expect(result.current.tasks.length).toBe(1));
  });
});
