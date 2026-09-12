import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskList } from "./TaskList";
import type { Task } from "@/application/factory";

function makeTask(id: string, titulo: string, estado: Task["estado"] = "pendiente"): Task {
  return {
    id,
    titulo,
    estado,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("TaskList", () => {
  it("muestra loading", () => {
    render(<TaskList tasks={[]} loading={true} error={null} />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando tareas");
  });

  it("muestra error", () => {
    render(<TaskList tasks={[]} loading={false} error="Error al cargar" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar");
  });

  it("muestra vacío en español", () => {
    render(<TaskList tasks={[]} loading={false} error={null} />);
    expect(screen.getByText("No hay tareas")).toBeInTheDocument();
  });

  it("muestra lista con roles", () => {
    const tasks = [makeTask("1", "T1"), makeTask("2", "T2")];
    render(<TaskList tasks={tasks} loading={false} error={null} />);
    expect(screen.getByRole("list", { name: "Lista de tareas" })).toBeInTheDocument();
    expect(screen.getByText("T1")).toBeInTheDocument();
    expect(screen.getByText("T2")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("delega acciones a TaskCard", async () => {
    const onDelete = vi.fn();
    const tasks = [makeTask("1", "T1")];
    const { container } = render(<TaskList tasks={tasks} loading={false} error={null} onDelete={onDelete} />);
    expect(container.querySelectorAll("li")).toHaveLength(1);
  });
});
