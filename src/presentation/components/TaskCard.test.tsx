import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/application/factory";

function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: "1",
    titulo: "Comprar leche",
    descripcion: "Descremada",
    estado: "pendiente",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...over,
  };
}

describe("TaskCard", () => {
  it("muestra titulo, descripcion y estado", () => {
    render(<TaskCard task={makeTask()} />);
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText("Descremada")).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThanOrEqual(1);
  });

  it("cambia estado vía select", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskCard task={makeTask()} onStatusChange={onStatusChange} />);
    const select = screen.getByLabelText("Cambiar estado");
    await user.selectOptions(select, "completada");
    expect(onStatusChange).toHaveBeenCalledWith("1", "completada");
  });

  it("editar con aria-label", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<TaskCard task={makeTask()} onEdit={onEdit} />);
    await user.click(screen.getByLabelText("Editar tarea Comprar leche"));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("eliminar con confirmación y aria-label", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskCard task={makeTask()} onDelete={onDelete} />);
    const delBtn = screen.getByLabelText("Eliminar tarea Comprar leche");
    await user.click(delBtn);
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Confirmar eliminar Comprar leche")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Confirmar eliminar Comprar leche"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("cancelar eliminación no llama onDelete", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskCard task={makeTask()} onDelete={onDelete} />);
    await user.click(screen.getByLabelText("Eliminar tarea Comprar leche"));
    await user.click(screen.getByLabelText("Cancelar eliminación"));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Eliminar tarea Comprar leche")).toBeInTheDocument();
  });
});
