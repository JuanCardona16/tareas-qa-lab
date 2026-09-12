import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTaskMutations } from "./useTaskMutations";
import { createApp } from "../factory";

function fixedDate(): Date {
  return new Date("2026-01-01T10:00:00.000Z");
}
let seq = 0;
function fixedId(): string {
  seq += 1;
  return `id-${seq}`;
}

describe("useTaskMutations — crear/editar/eliminar + refresh", () => {
  beforeEach(() => {
    seq = 0;
  });

  it("crear recarga lista y error es nulo tras éxito", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const onRefresh = vi.fn(async () => {});
    const { result } = renderHook(() => useTaskMutations({ app, onSuccess: onRefresh }));
    await act(async () => {
      const t = await result.current.create({ titulo: "Nueva Task" });
      expect(t.titulo).toBe("Nueva Task");
    });
    expect(result.current.error).toBeNull();
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    const list = await app.listTasks.execute();
    expect(list.length).toBe(1);
  });

  it("crear con título inválido expone error visible", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const { result } = renderHook(() => useTaskMutations({ app }));
    await act(async () => {
      await expect(result.current.create({ titulo: "   " })).rejects.toThrow();
    });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.loading).toBe(false);
  });

  it("update con transición inválida expone error", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const creada = await app.createTask.execute({ titulo: "T" });
    const { result } = renderHook(() => useTaskMutations({ app }));
    await act(async () => {
      await expect(result.current.update(creada.id, { estado: "completada" })).rejects.toThrow(
        /transición inválida/i,
      );
    });
    expect(result.current.error).toMatch(/transición inválida/i);
  });

  it("delete exitoso llama onSuccess y deja loading false", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const creada = await app.createTask.execute({ titulo: "Borrar" });
    const onRefresh = vi.fn(async () => {});
    const { result } = renderHook(() => useTaskMutations({ app, onSuccess: onRefresh }));
    await act(async () => {
      await result.current.remove(creada.id);
    });
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
    const list = await app.listTasks.execute();
    expect(list.length).toBe(0);
  });

  it("delete inexistente expone error NOT_FOUND", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    const { result } = renderHook(() => useTaskMutations({ app }));
    await act(async () => {
      await expect(result.current.remove("no-existe")).rejects.toThrow(/NOT_FOUND/);
    });
    expect(result.current.error).toMatch(/NOT_FOUND/);
  });

  it("loading true durante mutación y false después", async () => {
    const app = createApp({ clock: fixedDate, id: fixedId });
    // retardar repo.create
    const originalCreate = app.repo.create.bind(app.repo);
    let resolveCreate!: (v: unknown) => void;
    vi.spyOn(app.repo, "create").mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveCreate = res as unknown as (v: unknown) => void;
          setTimeout(() => originalCreate({ titulo: "Lenta" }).then(resolveCreate), 10);
        }) as Promise<never>,
    );
    const { result } = renderHook(() => useTaskMutations({ app }));
    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.create({ titulo: "Lenta" });
    });
    // loading debería estar true mientras pende
    await waitFor(() => expect(result.current.loading).toBe(true));
    await act(async () => {
      await promise;
    });
    expect(result.current.loading).toBe(false);
  });
});
