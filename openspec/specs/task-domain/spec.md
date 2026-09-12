# Especificación task-domain

## Propósito

Entidad Task, validaciones en español y casos de uso puros sin dependencias externas. Fuente única de reglas para UI, API mock y pruebas.

## Requisitos

### Requisito: Validación de título

El sistema DEBE rechazar títulos vacíos, solo espacios o fuera de 1-100 caracteres tras `trim`, con mensajes en español.

#### Escenario: Título solo espacios

- GIVEN un `CreateTaskInput` con titulo `"   "`
- WHEN se ejecuta `CreateTask`
- THEN falla con `"El título es obligatorio"`

#### Escenario: Título de 101 caracteres

- GIVEN un titulo de 101 caracteres
- WHEN se ejecuta `CreateTask`
- THEN falla con mensaje que incluye `"máximo 100"`

### Requisito: Validación de descripción y estado inicial

El sistema DEBE aceptar descripción opcional de 0-500 caracteres y crear con estado `pendiente`.

#### Escenario: Descripción de 501 caracteres

- GIVEN una descripción de 501 caracteres
- WHEN se ejecuta `CreateTask`
- THEN falla con mensaje que incluye `"máximo 500"`

#### Escenario: Creación válida

- GIVEN titulo `"Comprar leche"` válido
- WHEN se ejecuta `CreateTask`
- THEN retorna Task con `estado="pendiente"` y `titulo` recortado

### Requisito: Transición estricta de estados

El sistema DEBE permitir solo `pendiente→en_progreso→completada` y actualizar `updatedAt`.

#### Escenario: Salto pendiente→completada

- GIVEN una Task en `pendiente`
- WHEN se ejecuta `UpdateTask` con `estado="completada"`
- THEN falla con `"transición inválida"` y no muta

#### Escenario: Avance válido

- GIVEN una Task en `pendiente`
- WHEN se actualiza a `en_progreso`
- THEN `estado` cambia y `updatedAt` es posterior a `createdAt`

### Requisito: Identidad y tiempos inyectables

El sistema DEBE generar `id` con `randomUUID` y fechas con reloj inyectable; `id` es inmutable.

#### Escenario: Determinismo en tests

- GIVEN reloj fijo e id fijo inyectados
- WHEN se crea una Task
- THEN `id`, `createdAt` y `updatedAt` igualan los valores inyectados

### Requisito: Contrato TaskRepository

El sistema DEBE exponer `list(filters?)`, `getById`, `create`, `update`, `delete` según `docs/04-domain.md`.

#### Escenario: Filtros AND insensibles

- GIVEN tareas `"Comprar leche"` y `"LECHE de avena"` en estados distintos
- WHEN `list({ estado:"pendiente", q:"leche" })`
- THEN retorna solo la coincidente en ambos criterios

#### Escenario: Eliminación de inexistente

- GIVEN un id inexistente
- WHEN se ejecuta `DeleteTask`
- THEN lanza error `NOT_FOUND` testeable con Vitest
