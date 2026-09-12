declare module "jest-axe" {
  import type { AxeResults } from "axe-core";
  export function axe(container: Element, options?: unknown): Promise<AxeResults>;
  export function toHaveNoViolations(): unknown;
}
