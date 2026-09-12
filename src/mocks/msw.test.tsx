import { describe, expect, it } from "vitest";

describe("msw bootstrap", () => {
  it("intercepts fetch via msw/node (dummy R->G)", async () => {
    const url = `${import.meta.env.VITE_API_URL}/api/health`;
    const res = await fetch(url);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("jsdom + Testing Library available", async () => {
    const { render, screen } = await import("@testing-library/react");
    const Dummy = () => <span>hello</span>;
    render(<Dummy />);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("axe-core importable", async () => {
    const axe = await import("axe-core");
    expect(axe).toBeDefined();
  });
});
