import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) collectFiles(p, out);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

describe("presentation layer boundaries", () => {
  it("no importa infrastructure o mocks directamente", () => {
    const files = collectFiles(join(process.cwd(), "src/presentation")).filter(
      (f) => !f.includes(".test.") && !f.includes(".spec."),
    );
    const bad: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf8");
      if (/from\s+["'].*infrastructure\//.test(content) || /from\s+["'].*\/mocks\//.test(content)) {
        bad.push(f);
      }
      if (/from\s+["']@\/infrastructure/.test(content)) bad.push(f);
      if (/from\s+["']@\/mocks/.test(content)) bad.push(f);
    }
    expect(bad, `Archivos con import prohibido: ${bad.join(", ")}`).toEqual([]);
  });

  it("archivos <150 líneas", () => {
    const files = collectFiles(join(process.cwd(), "src/presentation"));
    const over: string[] = [];
    for (const f of files) {
      const lines = readFileSync(f, "utf8").split("\n").length;
      if (lines > 150) over.push(`${f} (${lines})`);
    }
    expect(over, `Archivos >150 líneas: ${over.join(", ")}`).toEqual([]);
  });
});
