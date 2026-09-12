# Especificación qa-tooling

## Propósito

Herramientas que hacen el SUT testeable: Vitest con Strict TDD, axe para a11y y colección Postman versionada sobre el contrato MSW.

## Requisitos

### Requisito: Strict TDD con Vitest

El sistema DEBE verificar cada slice con ciclo RED→GREEN→TRIANGULATE→REFACTOR y `pnpm check/test` en verde.

#### Escenario: Evidencia por slice

- GIVEN un slice implementado
- WHEN se revisa su historial de tests
- THEN existe test que falló antes del código y pasa después

### Requisito: Accesibilidad axe sin críticas

El sistema DEBE pasar axe con 0 violaciones críticas en `TasksPage` y focos/labels correctos.

#### Escenario: Auditoría axe

- GIVEN `TasksPage` con lista, filtros y formulario
- WHEN se ejecuta `axe-core` con Testing Library
- THEN cero violaciones críticas y cada input tiene label asociado

### Requisito: Colección Postman versionada

El sistema DEBE versionar `public/postman/collection.json` con CRUD, filtros y casos 400/404 contra `{{baseUrl}}/api/tasks*`.

#### Escenario: Casos negativos en colección

- GIVEN la colección importada en Postman
- WHEN se ejecutan `POST titulo "   "` y `DELETE id inexistente`
- THEN el primero espera 400 y el segundo 404 con `{ error, details }`

### Requisito: Determinismo testeable

Las pruebas DEBEN usar reloj e ids inyectables, `msw/node` en jsdom y `useFakeTimers` para debounce.

#### Escenario: Reproducibilidad

- GIVEN reloj fijo y handlers `msw/node`
- WHEN la suite corre dos veces seguidas
- THEN los mismos tests pasan sin flakiness por tiempo o red
