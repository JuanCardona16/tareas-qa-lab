import { describe, expect, it } from "vitest";
import {
  validateTitulo,
  validateDescripcion,
  isValidTransition,
  validateTransicion,
} from "./taskValidators";

describe("taskValidators", () => {
  describe("validateTitulo", () => {
    it("CA-01: '   ' -> El título es obligatorio", () => {
      expect(validateTitulo("   ")).toBe("El título es obligatorio");
    });
    it("vacío -> obligatorio", () => {
      expect(validateTitulo("")).toBe("El título es obligatorio");
    });
    it("1 char válido -> null", () => {
      expect(validateTitulo("a")).toBeNull();
    });
    it("100 chars válido -> null", () => {
      expect(validateTitulo("a".repeat(100))).toBeNull();
    });
    it("101 chars -> máximo 100", () => {
      const msg = validateTitulo("a".repeat(101));
      expect(msg).not.toBeNull();
      expect(msg).toMatch(/máximo 100/i);
    });
    it("trim aplicado: '  hola  ' válido", () => {
      expect(validateTitulo("  hola  ")).toBeNull();
    });
  });

  describe("validateDescripcion", () => {
    it("undefined -> null (opcional)", () => {
      expect(validateDescripcion(undefined)).toBeNull();
    });
    it("vacía -> null", () => {
      expect(validateDescripcion("")).toBeNull();
    });
    it("500 chars -> null", () => {
      expect(validateDescripcion("a".repeat(500))).toBeNull();
    });
    it("501 chars -> máximo 500", () => {
      const msg = validateDescripcion("a".repeat(501));
      expect(msg).not.toBeNull();
      expect(msg).toMatch(/máximo 500/i);
    });
  });

  describe("isValidTransition", () => {
    it("pendiente -> en_progreso válido", () => {
      expect(isValidTransition("pendiente", "en_progreso")).toBe(true);
    });
    it("en_progreso -> completada válido", () => {
      expect(isValidTransition("en_progreso", "completada")).toBe(true);
    });
    it("CA-03: pendiente -> completada inválido (salto)", () => {
      expect(isValidTransition("pendiente", "completada")).toBe(false);
    });
    it("retroceso en_progreso -> pendiente inválido", () => {
      expect(isValidTransition("en_progreso", "pendiente")).toBe(false);
    });
    it("completada -> cualquiera inválido", () => {
      expect(isValidTransition("completada", "pendiente")).toBe(false);
      expect(isValidTransition("completada", "en_progreso")).toBe(false);
      expect(isValidTransition("completada", "completada")).toBe(false);
    });
    it("mismo estado no es transición válida", () => {
      expect(isValidTransition("pendiente", "pendiente")).toBe(false);
    });
  });

  describe("validateTransicion", () => {
    it("transición válida -> null", () => {
      expect(validateTransicion("pendiente", "en_progreso")).toBeNull();
    });
    it("transición inválida -> transición inválida", () => {
      const msg = validateTransicion("pendiente", "completada");
      expect(msg).not.toBeNull();
      expect(msg).toMatch(/transición inválida/i);
    });
  });
});
