import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue — ADR-04 debounce 300ms", () => {
  it("valor inicial coincide con el de entrada", () => {
    const { result } = renderHook(() => useDebouncedValue("hola", 300));
    expect(result.current).toBe("hola");
  });

  it("a 299ms NO actualiza, a 300ms SÍ actualiza (useFakeTimers)", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "a" },
    });
    expect(result.current).toBe("a");
    rerender({ v: "ab" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ab");
    vi.useRealTimers();
  });

  it("múltiples cambios rápidos solo conserva el último", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "x" },
    });
    rerender({ v: "xy" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ v: "xyz" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ v: "final" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("x");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("final");
    vi.useRealTimers();
  });

  it("delay custom 500: 499 no, 500 sí", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 500), {
      initialProps: { v: "1" },
    });
    rerender({ v: "2" });
    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe("1");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("2");
    vi.useRealTimers();
  });

  it("TRI: valor vacío y luego con contenido", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: "" },
    });
    expect(result.current).toBe("");
    rerender({ v: "leche" });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("leche");
    vi.useRealTimers();
  });
});
