import { describe, it, expect } from "vitest";
import collection from "../../../public/postman/collection.json";

type PostmanRequest = {
  method?: string;
  url?: string | { raw?: string };
  header?: unknown[];
  body?: { mode?: string; raw?: string };
};

type PostmanItem = {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
};

function flatten(items: PostmanItem[]): PostmanItem[] {
  return items.flatMap((entry) =>
    entry.item ? flatten(entry.item) : [entry],
  );
}

describe("Postman collection — estructura y cobertura QA", () => {
  const info = collection.info as {
    schema: string;
    name: string;
    description?: string;
  };
  const variables = collection.variable as { key: string; value: string }[];
  const items = collection.item as PostmanItem[];
  const allRequests = flatten(items);

  it("usa schema Postman v2.1", () => {
    expect(info.schema).toBe(
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    );
  });

  it("expone info básica y variable baseUrl", () => {
    expect(info.name.toLowerCase()).toContain("tareas-qa-lab");
    expect(variables.some((v) => v.key === "baseUrl")).toBe(true);
    const baseUrl = variables.find((v) => v.key === "baseUrl")?.value;
    expect(baseUrl).toMatch(/^http:\/\/localhost:\d+$/);
  });

  it("cubre CRUD completo (GET/POST/PUT/DELETE) contra {{baseUrl}}/api/tasks", () => {
    const methods = allRequests.map((r) => r.request?.method);
    expect(methods).toEqual(expect.arrayContaining(["GET", "POST", "PUT", "DELETE"]));

    const urls = allRequests
      .map((r) => (typeof r.request?.url === "string" ? r.request.url : ""))
      .filter(Boolean);
    expect(urls.some((u) => u.includes("{{baseUrl}}/api/tasks"))).toBe(true);
    expect(urls.some((u) => u.includes("{{baseUrl}}/api/tasks/:id"))).toBe(true);
  });

  it("incluye casos de error 400 y 404 documentados", () => {
    const names = allRequests.map((r) => r.name.toLowerCase());
    expect(names.some((n) => n.includes("400"))).toBe(true);
    expect(names.some((n) => n.includes("404"))).toBe(true);
    expect(names.filter((n) => n.includes("400")).length).toBeGreaterThanOrEqual(3);
    expect(names.filter((n) => n.includes("404")).length).toBeGreaterThanOrEqual(3);
  });

  it("modela validación de título y descripción en los bodies 400", () => {
    const bodies = allRequests
      .map((r) => r.request?.body?.raw ?? "")
      .filter(Boolean);
    expect(bodies.some((b) => b.includes('"titulo"'))).toBe(true);
    expect(allRequests.some((r) => r.name === "POST 400 titulo vacío")).toBe(true);
    expect(allRequests.some((r) => r.name === "POST 400 titulo 101 chars")).toBe(true);
    expect(allRequests.some((r) => r.name === "POST 400 descripcion 501")).toBe(true);
  });

  it("incluye filtros por estado y búsqueda case-insensitive", () => {
    const urls = allRequests
      .map((r) => (typeof r.request?.url === "string" ? r.request.url : ""))
      .filter(Boolean);
    expect(urls.some((u) => u.includes("estado=") && u.includes("q="))).toBe(true);
    expect(allRequests.some((r) => r.name.toLowerCase().includes("case-insensitive"))).toBe(true);
  });

  it("cubre transición inválida y health check", () => {
    expect(allRequests.some((r) => r.name === "PUT 400 transición inválida")).toBe(true);
    expect(allRequests.some((r) => r.name === "Health")).toBe(true);
  });

  it("asegura correlación con handlers MSW (al menos 14 requests)", () => {
    expect(allRequests.length).toBeGreaterThanOrEqual(14);
    const health = allRequests.find((r) => r.name === "Health");
    expect(health?.request?.url).toBe("{{baseUrl}}/api/health");
  });
});
