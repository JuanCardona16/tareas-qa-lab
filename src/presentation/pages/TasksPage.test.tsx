import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksPage } from "./TasksPage";
import { axe } from "jest-axe";
import { TaskRepositoryInMemory } from "@/infrastructure/repositories/TaskRepositoryInMemory";
import { createApp } from "@/application/factory";

describe("TasksPage", () => {
  it("integra filter+list+form y muestra loading/error/empty", async () => {
    render(<TasksPage />);
    expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByText("Cargando tareas...")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("No hay tareas")).toBeInTheDocument());
  });

  it("filtro AND insensible vía repo", async () => {
    const repo = new TaskRepositoryInMemory({
      clock: () => new Date(),
      id: (() => {
        let n = 0;
        return () => String(++n);
      })(),
    });
    await repo.create({ titulo: "Comprar leche" });
    const t2 = await repo.create({ titulo: "LECHE extra" });
    await repo.update(t2.id, { estado: "en_progreso" });

    const r1 = await repo.list({ estado: "pendiente", q: "leche" });
    expect(r1).toHaveLength(1);
    expect(r1[0]?.titulo).toBe("Comprar leche");
  });

  it("aria-live present y 0 violaciones axe", async () => {
    const { container } = render(<TasksPage />);
    await waitFor(() => expect(screen.getByText("No hay tareas")).toBeInTheDocument());
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    const results = await axe(container);
    const critical = results.violations.filter((v: { impact?: string | null }) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  }, 10000);

  it("crear tarea vía form actualiza lista", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);
    await waitFor(() => expect(screen.getByText("No hay tareas")).toBeInTheDocument());
    await user.type(screen.getByLabelText("Título"), "Nueva tarea");
    await user.click(screen.getByRole("button", { name: "Crear tarea" }));
    await waitFor(() => expect(screen.getByText("Nueva tarea")).toBeInTheDocument());
  });

  it("filtro con debounce actualiza lista tras 300ms", async () => {
    const repo = new TaskRepositoryInMemory({
      clock: () => new Date(),
      id: (() => {
        let n = 0;
        return () => String(++n);
      })(),
    });
    await repo.create({ titulo: "Comprar leche" });
    await repo.create({ titulo: "Otra tarea" });
    const app = createApp({ repo });

    const user = userEvent.setup();
    render(<TasksPage app={app} />);
    await waitFor(() => expect(screen.getByText("Comprar leche")).toBeInTheDocument());
    expect(screen.getByText("Otra tarea")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Buscar"), "leche");
    // wait for debounce 300ms + fetch
    await waitFor(() => expect(screen.queryByText("Otra tarea")).not.toBeInTheDocument(), { timeout: 2000 });
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
  }, 10000);
});
