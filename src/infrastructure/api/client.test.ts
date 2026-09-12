import { describe, expect, it, beforeEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers, resetStore } from "./handlers";
import { apiList, apiGetById, apiCreate, apiUpdate, apiRemove } from "./client";

const server = setupServer(...handlers);
beforeEach(() => resetStore());

describe("client fetch tipado contra MSW fachada", () => {
  it("RED: client usa VITE_API_URL y es consumido por fetch/msw", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    const created = await apiCreate({ titulo: "Desde client" });
    expect(created.titulo).toBe("Desde client");
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeInstanceOf(Date);

    const list = await apiList();
    expect(list).toHaveLength(1);

    const fetched = await apiGetById(created.id);
    expect(fetched?.id).toBe(created.id);

    const updated = await apiUpdate(created.id, { estado: "en_progreso" });
    expect(updated.estado).toBe("en_progreso");

    await apiRemove(created.id);
    const after = await apiGetById(created.id);
    expect(after).toBeNull();

    server.close();
  });

  it("propaga 400 como Error con details", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    await expect(apiCreate({ titulo: "   " })).rejects.toThrow(/obligatorio/i);
    server.close();
  });

  it("propaga 404 en get y delete", async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    expect(await apiGetById("missing")).toBeNull();
    await expect(apiRemove("missing")).rejects.toThrow("NOT_FOUND");
    server.close();
  });
});
