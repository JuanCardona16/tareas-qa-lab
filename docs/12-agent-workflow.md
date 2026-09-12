# Metodología de Trabajo para Agentes IA

> Documento **normativo**. Define los pasos obligatorios que el agente de IA debe seguir antes, durante y después de tocar código. Ningún cambio se implementa sin pasar por este flujo.

---

## 1. Cuándo aplica este flujo

Antes de **cualquier** tarea de código:

- **Nueva funcionalidad** (feature)
- **Bug fix** (corrección de un defecto)
- **Mejora** de una funcionalidad ya desarrollada
- **Refactor** o deuda técnica

Siempre que el agente vaya a modificar, crear o eliminar código, debe generar un plan adecuado y obtener aprobación **antes** de escribir la primera línea.

---

## 2. Paso 0 — Contexto obligatorio (leer ANTES de planear)

Al iniciar una sesión o recibir una tarea, el agente **debe** leer en este orden:

1. `docs/01-overview.md` — Qué es el proyecto y funcionalidades
2. `docs/10-status.md` — Estado actual y roadmap
3. `docs/11-changelog.md` — Historial de cambios
4. `docs/02-stack.md` + `docs/03-architecture.md` — Contexto técnico y límites
5. `docs/08-conventions.md` — Cómo escribir código
6. `docs/09-git-deploy.md` — Flujo git
7. Este documento (`docs/12-agent-workflow.md`) — Metodología

Y luego profundizar solo en el archivo de la capa afectada: `docs/04-domain.md`, `docs/05-infrastructure.md`, `docs/06-application.md` o `docs/07-presentation.md`.

> Si la tarea es un **bug fix**, el Paso 0 incluye además: reproducir el bug, leer el código involucrado y **confirmar la causa raíz con evidencia** (logs, bundle, respuesta HTTP) antes de proponer el plan.

---

## 3. Paso 1 — Ficha de Requisitos

El agente entrega al usuario:

- **RF-xxx**: Requisitos funcionales ("El usuario podrá...")
- **RNF-xxx**: No funcionales (perf, responsive, a11y, type-check estricto, sin `any`)
- **Alcance**: Qué incluye / Qué NO incluye
- **Dependencias**: Qué recibe / Qué expone
- **CA-xxx**: Criterios de Aceptación en sintaxis BDD (DADO / CUANDO / ENTONCES)

---

## 4. Paso 2 — Diseño Arquitectónico

- Lista de archivos a crear/modificar con **paths exactos**
- Tipos/interfaces que definen la **API pública**
- Funciones / Componentes / Stores con sus **signatures**
- **Flujo**: User Action → Componente → Hook/Store/Servicio → UseCase → Repository → Infraestructura
- **Riesgos** identificados + mitigación
- Verificar que el cambio respete las reglas de dependencia de `docs/03-architecture.md`

---

## 5. Paso 3 — Aprobación del usuario

- El agente presenta Paso 1 + Paso 2 y **espera** la aprobación.
- Si el usuario pide cambios: ajustar la ficha/diseño y volver a presentar.
- **Nada de código** se escribe sin aprobación.

---

## 6. Paso 4 — Implementación

- En **LOTES PEQUEÑOS** (2-3 archivos máximo por diff)
- Secuencia: primero **TIPOS** → luego **LÓGICA** (usecases/stores/repos) → finalmente **UI**
- Cada archivo < 150 líneas (dividir si supera)
- Todo className condicional → helper `cn()` del proyecto
- Llamadas async: try/catch + loading state + error visible al usuario SIEMPRE
- Type-check estricto: CERO `any`, CERO `@ts-ignore`
- **Strict TDD**: cada tarea con ciclo RED → GREEN → REFACTOR y evidencia en `sdd-apply`

---

## 7. Paso 5 — Pruebas (documentar TODAS)

- **A) Funcionales**: manuales paso a paso
- **B) Integración**: con módulos/capas anteriores
- **C) No funcionales**: mobile/tablet/desktop, a11y, `pnpm check`, `pnpm build`
- **D) Regresión**: confirmar que las funcionalidades previas SIGUEN funcionando
- **E) TDD**: evidencia RED→GREEN por tarea (Vitest)

---

## 8. Paso 6 — Checklist de Aprobación (TODO en OK para cerrar)

- **Código**: Arquitectura OK, type-check estricto OK, nomenclatura OK, sin dead code
- **Requisitos**: Todos los RF y CA cumplidos, sin scope creep
- **Integración**: `pnpm build` 0 errores, `pnpm check` 0 errores, `pnpm test` OK
- **UI/UX** (si aplica): mobile sin overflow, loading OK, error OK, a11y básico OK
- **Documentación**: actualizar `docs/10-status.md`, `docs/11-changelog.md` y `AGENTS.md` si aplica

---

## 9. Paso 7 — Entregables por módulo cerrado

1. Código (archivos creados/modificados + commit msg propuesto)
2. Informe de pruebas (X/X aprobadas)
3. Informe de cumplimiento de requisitos (tabla RF vs Evidencia)
4. Documentación técnica (actualización de `docs/`)
5. Riesgos próximos + sugerencias de prioridad

---

## 10. Flujo de activación

Al iniciar cada tarea, el agente muestra textualmente:

```
════════════════════════════════════════════════════════════════════════
  TAREA: [descripción] | [feature|bugfix|mejora]
  Paso 0: contexto leído OK.
  Próximo: Paso 1 - Ficha de Requisitos
════════════════════════════════════════════════════════════════════════
```

Luego presenta Paso 1 (Ficha) y Paso 2 (Diseño) y espera aprobación.

---

## 11. Principios inquebrantables

1. **Arquitectura en capas**: Domain → Infrastructure → Application → Presentation (dependencias SOLO hacia adentro). NUNCA romper límites.
2. **1 tarea = 100% validada** antes de tocar la siguiente.
3. **Mobile-first y accesible**
4. **Type-check ESTRICTO**: CERO `any`, CERO `@ts-ignore`.
5. **TODO cambio vía diff preview. Nada sin aprobación** del usuario.
6. **Documentar siempre**: actualizar `docs/10-status.md` y `docs/11-changelog.md` al cerrar cada tarea.
7. **Strict TDD**: sin tests no hay entrega; toda tarea exige evidencia RED→GREEN→REFACTOR.
