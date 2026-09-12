import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/application/factory";

describe("TaskForm", () => {
  it("labels asociados y aria-live", () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
  });

  it("envío vacío muestra 'El título es obligatorio' sin llamar onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Título");
    await user.clear(input);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(await screen.findByText("El título es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El título es obligatorio").closest("[aria-live]")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida máximo 100 caracteres", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Título"), "a".repeat(101));
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(await screen.findByText("El título debe tener como máximo 100 caracteres")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida descripción máximo 500", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Título"), "Valido");
    const desc = screen.getByLabelText("Descripción");
    fireEvent.change(desc, { target: { value: "b".repeat(501) } });
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(await screen.findByText("La descripción debe tener como máximo 500 caracteres")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submit válido llama onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Título"), "Comprar pan");
    await user.type(screen.getByLabelText("Descripción"), "Integral");
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(onSubmit).toHaveBeenCalledWith({ titulo: "Comprar pan", descripcion: "Integral" });
  });

  it("modo edición muestra valores iniciales y botón Guardar cambios", async () => {
    const task: Task = {
      id: "1",
      titulo: "Original",
      descripcion: "Desc",
      estado: "pendiente",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm initialTask={task} onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue("Original")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("muestra error de submit con aria-live assertive", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Error de red"));
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText("Título"), "Hola");
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    expect(await screen.findByText("Error de red")).toBeInTheDocument();
  });
});
