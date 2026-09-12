# tareas-qa-lab - Visión General

> Laboratorio QA — mini gestión de tareas para diseño de pruebas

## Qué es tareas-qa-lab

Aplicación web de gestión de tareas (CRUD, filtros por estado y API REST) diseñada como **laboratorio académico para diseño de pruebas**. El objetivo no es solo construir la app, sino usarla como SUT (System Under Test) para practicar el diseño de planes de prueba en seis dimensiones: funcionalidad, rendimiento, seguridad, compatibilidad, accesibilidad y pruebas de API.

La app es intencionalmente pequeña pero realista: expone casos de borde, validaciones, estados y flujos que permiten ejercitar técnicas de testing y justificar por qué cada prueba existe.

## Funcionalidades actuales

- **CRUD de tareas**: crear, listar, editar y eliminar tareas con validación de campos obligatorios.
- **Filtros por estado y búsqueda**: filtrar por `pendiente | en_progreso | completada` y búsqueda por título/descripción.
- **API REST para tareas**: endpoints REST con validación, códigos HTTP semánticos y manejo de errores uniforme.

> Estado inicial: proyecto recién iniciado. Solo existe documentación y estructura de carpetas. Funcionalidades "por definir" hasta que se complete el roadmap en `docs/10-status.md`. Ver también `docs/10-status.md` para el plan por fases y `docs/04-domain.md` para el dominio previsto.

## Público objetivo

- Estudiantes de QA / testing que necesitan un SUT controlado para diseñar pruebas.
- Docentes que quieren un ejemplo trazable entre requisitos → diseño → tareas → pruebas.

## Referencias

- `docs/10-status.md` — Roadmap y estado actual
- `docs/04-domain.md` — Entidades previstas (Task)
- `docs/02-stack.md` — Stack tecnológico
- `docs/12-agent-workflow.md` — Metodología de trabajo obligatoria
