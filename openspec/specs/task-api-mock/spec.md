# Especificación task-api-mock

## Propósito

Fachada HTTP mock con MSW sobre `VITE_API_URL` que replica el contrato REST para pruebas funcionales, de API y Postman sin backend.

## Requisitos

### Requisito: Base y rutas MSW

El sistema DEBE interceptar `${VITE_API_URL}/api/tasks*` con `handlers.ts` para GET, POST, PUT y DELETE.

#### Escenario: Intercepción base

- GIVEN `VITE_API_URL=http://localhost:3000`
- WHEN la app llama `GET /api/tasks`
- THEN el handler MSW responde sin red real

### Requisito: Listar con filtros AND

El sistema DEBE soportar `GET /api/tasks?estado=&q=` con AND y `q` insensible en titulo/descripcion.

#### Escenario: Búsqueda insensible con estado

- GIVEN tareas `"Comprar leche"` y `"LECHE"` en estados distintos
- WHEN `GET /api/tasks?estado=pendiente&q=leche`
- THEN 200 con solo la que cumple ambos filtros

### Requisito: Obtener y crear

El sistema DEBE retornar 200|404 en `GET /:id` y 201 con Task válida en `POST /api/tasks`.

#### Escenario: GET inexistente

- GIVEN un id inexistente
- WHEN `GET /api/tasks/:id`
- THEN 404 con `{ error, details }`

#### Escenario: POST título vacío

- GIVEN body `{ "titulo": "   " }`
- WHEN `POST /api/tasks`
- THEN 400 con `"El título es obligatorio"`

### Requisito: Actualizar con transición estricta

El sistema DEBE aplicar 200|400|404 en `PUT /:id`, validando dominio y `updatedAt`.

#### Escenario: Transición inválida

- GIVEN Task en `pendiente`
- WHEN `PUT /:id` con `{"estado":"completada"}`
- THEN 400 con mensaje de transición inválida

### Requisito: Eliminar testeable

El sistema DEBE retornar 204 al eliminar y 404 si el id no existe.

#### Escenario: DELETE inexistente

- GIVEN un id inexistente
- WHEN `DELETE /api/tasks/:id`
- THEN 404 con `{ error, details }`

### Requisito: Error uniforme y 500

El sistema DEBE responder errores como `{ error, details }` y 500 ante fallo inesperado.

#### Escenario: Forma del error

- GIVEN cualquier fallo 400|404|500
- WHEN se inspecciona el body
- THEN contiene `error` (string es) y `details` (objeto o nulo)
