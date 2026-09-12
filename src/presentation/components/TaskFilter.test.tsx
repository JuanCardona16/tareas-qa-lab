import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFilter } from "./TaskFilter";

describe("TaskFilter", () => {
  it("renderiza select estado + input q con labels", () => {
    render(
      <TaskFilter estado={undefined} q="" onEstadoChange={vi.fn()} onQChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
    expect(screen.getByLabelText("Limpiar filtros")).toBeInTheDocument();
  });

  it("cambia estado llama onEstadoChange", async () => {
    const onEstadoChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskFilter estado={undefined} q="" onEstadoChange={onEstadoChange} onQChange={vi.fn()} onClear={vi.fn()} />,
    );
    await user.selectOptions(screen.getByLabelText("Filtrar por estado"), "pendiente");
    expect(onEstadoChange).toHaveBeenCalledWith("pendiente");
  });

  it("escribir q llama onQChange", async () => {
    const onQChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskFilter estado={undefined} q="" onEstadoChange={vi.fn()} onQChange={onQChange} onClear={vi.fn()} />,
    );
    await user.type(screen.getByLabelText("Buscar"), "leche");
    expect(onQChange).toHaveBeenCalled();
  });

  it("clear llama onClear", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskFilter estado="pendiente" q="leche" onEstadoChange={vi.fn()} onQChange={vi.fn()} onClear={onClear} />,
    );
    await user.click(screen.getByLabelText("Limpiar filtros"));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
