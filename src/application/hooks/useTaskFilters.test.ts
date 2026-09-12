import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskFilters } from "./useTaskFilters";
import { createApp } from "../factory";

describe("useTaskFilters — estado+q AND + debounce 300 + no muta dominio", () => {
  it("estado inicial sin filtros", () => {
    const { result } = renderHook(() => useTaskFilters());
    expect(result.current.filters).toEqual({});
    expect(result.current.estado).toBeUndefined();
    expect(result.current.q).toBe("");
  });

  it("setEstado actualiza filters inmediatamente (sin debounce)", () => {
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setEstado("pendiente"));
    expect(result.current.estado).toBe("pendiente");
    expect(result.current.filters.estado).toBe("pendiente");
    act(() => result.current.setEstado(undefined));
    expect(result.current.filters.estado).toBeUndefined();
  });

  it("q con debounce: 299 no actualiza filters, 300 sí (AND con estado)", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setEstado("pendiente"));
    act(() => result.current.setQ("leche"));
    expect(result.current.q).toBe("leche");
    expect(result.current.debouncedQ).toBe("");
    expect(result.current.filters).toEqual({ estado: "pendiente" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current.filters).toEqual({ estado: "pendiente" });
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.filters).toEqual({ estado: "pendiente", q: "leche" });
    expect(result.current.debouncedQ).toBe("leche");
    vi.useRealTimers();
  });

  it("q vacío no incluye q en filters", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setQ("algo"));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.filters.q).toBe("algo");
    act(() => result.current.setQ(""));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.filters.q).toBeUndefined();
    expect(result.current.filters).toEqual({});
    vi.useRealTimers();
  });

  it("clear limpia estado y q", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setEstado("completada"));
    act(() => result.current.setQ("pan"));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.filters).toEqual({ estado: "completada", q: "pan" });
    act(() => result.current.clear());
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.filters).toEqual({});
    expect(result.current.q).toBe("");
    expect(result.current.estado).toBeUndefined();
    vi.useRealTimers();
  });

  it("filtros no mutan dominio: aplicar y limpiar conserva tareas", async () => {
    const app = createApp();
    await app.createTask.execute({ titulo: "Comprar leche" });
    await app.createTask.execute({ titulo: "Comprar pan" });
    const antes = await app.listTasks.execute();
    expect(antes.length).toBe(2);

    vi.useFakeTimers();
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setQ("leche"));
    act(() => vi.advanceTimersByTime(300));
    // filtros a nivel aplicación no tocan repo
    const filtradas = await app.listTasks.execute(result.current.filters);
    expect(filtradas.length).toBe(1);
    act(() => result.current.clear());
    act(() => vi.advanceTimersByTime(300));
    const despues = await app.listTasks.execute(result.current.filters);
    expect(despues.length).toBe(2);
    // el total en dominio sigue intacto
    const total = await app.listTasks.execute();
    expect(total.length).toBe(2);
    vi.useRealTimers();
  });

  it("AND: estado pendiente + q leche solo trae coincidencia exacta", async () => {
    const app = createApp();
    const t1 = await app.createTask.execute({ titulo: "Leche pendiente" });
    const t2 = await app.createTask.execute({ titulo: "Leche completada" });
    await app.repo.update(t2.id, { estado: "en_progreso" });
    await app.repo.update(t2.id, { estado: "completada" });
    void t1;
    vi.useFakeTimers();
    const { result } = renderHook(() => useTaskFilters());
    act(() => result.current.setEstado("pendiente"));
    act(() => result.current.setQ("leche"));
    act(() => vi.advanceTimersByTime(300));
    const filtradas = await app.listTasks.execute(result.current.filters);
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].estado).toBe("pendiente");
    vi.useRealTimers();
  });
});
