# Especificación task-application

## Propósito

Orquestación entre presentación e infraestructura: fábrica única, stores y hooks con estados async consistentes. Sin lógica de negocio.

## Requisitos

### Requisito: Fábrica única de dependencias

El sistema DEBE exponer `createApp()` como único punto que elige `InMemory` vs `Http` e inyecta casos de uso.

#### Escenario: Inyección para tests

- GIVEN un repositorio falso inyectado a `createApp`
- WHEN se ejecuta `createTask`
- THEN opera sobre el falso sin tocar la UI

### Requisito: Carga con loading y error visible

Los hooks DEBEN exponer `{ tasks, loading, error, refresh }` con try/catch y error visible.

#### Escenario: Fallo de carga

- GIVEN un repositorio que lanza error
- WHEN `useTasks` carga la lista
- THEN `loading` termina en `false` y `error` muestra mensaje en español

### Requisito: Mutaciones con recarga

Las mutaciones DEBEN usar try/catch, exponer loading/error y refrescar la lista tras éxito.

#### Escenario: Crear recarga lista

- GIVEN `useTaskMutations` con lista cargada
- WHEN `create` termina con éxito
- THEN la lista incluye la nueva Task y `error` es nulo

### Requisito: Filtros solo de vista

El sistema DEBE mantener `estado` y `q` en aplicación sin mutar el dominio; combinan con AND.

#### Escenario: Filtros no mutan dominio

- GIVEN filtros `{ estado:"pendiente", q:"leche" }`
- WHEN se aplican y luego se limpian
- THEN el dominio conserva todas las tareas intactas
