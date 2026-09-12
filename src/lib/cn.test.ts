import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("combines class names", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes via clsx", () => {
    const showHidden = false;
    expect(cn("base", showHidden && "hidden", "visible")).toBe("base visible");
    expect(cn({ hidden: false, block: true })).toBe("block");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
