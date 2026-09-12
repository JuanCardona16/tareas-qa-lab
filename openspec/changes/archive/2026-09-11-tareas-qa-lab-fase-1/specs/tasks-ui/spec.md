# Especificación tasks-ui

## Propósito

Interfaz en español `TaskList/Form/Filter/TasksPage` consumiendo solo `application/`, mobile-first, accesible y con estados completos.

## Requisitos

### Requisito: Composición y límites

El sistema DEBE componer `TasksPage` con lista, filtros y formulario; ningún componente supera 150 líneas ni importa `infrastructure/` directo.

#### Escenario: Importación por capas

- GIVEN el código de `presentation/`
- WHEN se inspeccionan sus imports
- THEN ninguno referencia `infrastructure/` directamente

### Requisito: Formulario con validación inline

`TaskForm` DEBE validar titulo 1-100 y descripcion 0-500 con mensajes en español y `aria-live`.

#### Escenario: Envío vacío

- GIVEN `TaskForm` con titulo `"   "`
- WHEN se envía
- THEN muestra `"El título es obligatorio"` sin llamar a aplicación

### Requisito: Lista con cuatro estados

`TaskList` DEBE renderizar `loading`, `error`, `empty` y `success` diferenciados.

#### Escenario: Lista vacía

- GIVEN cero tareas y sin error ni carga
- WHEN se renderiza `TaskList`
- THEN muestra estado vacío en español

### Requisito: Filtros AND con debounce 300ms

`TaskFilter` DEBE combinar `estado`+`q` con AND y disparar búsqueda 300ms tras tecleo.

#### Escenario: Debounce con timers falsos

- GIVEN `useFakeTimers` y texto tecleado
- WHEN avanzan 299ms y luego 1ms
- THEN `fetch` se llama una vez solo tras 300ms

#### Escenario: Filtro AND insensible

- GIVEN filtro `estado=pendiente` y `q=leche`
- WHEN se aplica sobre `"Comprar leche"` y `"LECHE"` en otro estado
- THEN solo la primera permanece visible

### Requisito: Accesibilidad y responsive

La UI DEBE ser operable por teclado, con labels asociados, y usable en 390/768/1280 con `cn()`.

#### Escenario: Navegación por teclado

- GIVEN `TasksPage` renderizada
- WHEN se navega con Tab hasta el formulario
- THEN foco visible y labels anuncian cada campo
