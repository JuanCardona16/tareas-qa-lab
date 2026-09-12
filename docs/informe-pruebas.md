# Informe de Diseño de Pruebas de Software

**Software evaluado:** `tareas-qa-lab` v0.1.0
**Fecha:** 11 de septiembre de 2026
**Autor(es):** Juan David Cardona, Sergio Luis Doria, Christian Traeger Gamero 

---

## 1. Introducción

### 1.1 Software seleccionado

`tareas-qa-lab` es un gestor de tareas web (CRUD + filtros + búsqueda) construido como laboratorio académico para el diseño de pruebas de software. Sus características técnicas:

| Aspecto | Detalle |
|---|---|
| **Frontend** | React 18 + TypeScript (modo estricto) + Vite + Tailwind CSS |
| **Testing** | Vitest 4 + Testing Library + jsdom + axe-core |
| **API REST** | Fachada simulada con MSW sobre `VITE_API_URL` (por defecto `http://localhost:3000`), consumible desde Postman/Insomnia |
| **Arquitectura** | Clean Architecture: `domain → infrastructure → application → presentation` |
| **Persistencia** | En memoria (intencional, para trazabilidad del laboratorio) |

**Reglas de negocio principales:**

- Entidad `Task { id, titulo, descripcion?, estado, createdAt, updatedAt }`.
- `titulo`: obligatorio, 1–100 caracteres (con `trim`). `descripcion`: opcional, 0–500.
- Estados: `pendiente → en_progreso → completada` (transición **estricta**: no se permiten saltos ni retrocesos).
- Búsqueda `q`: insensible a mayúsculas/minúsculas, combinable (AND) con filtro por `estado`, con *debounce* de 300 ms.
- API con códigos 200/201/204/400/404/500 y error uniforme `{ error, details }`.
- Delete de una tarea inexistente devuelve 404 (diseñado para ser testeable).

### 1.2 Tipos de pruebas identificados

Se identificaron **6 tipos de pruebas**, cada uno orientado a un aspecto de calidad distinto:

| # | Tipo de prueba | Aspecto de calidad que valida |
|---|---|---|
| 1 | **Funcionalidad** | Que las reglas de negocio (validación, transición de estados, filtros) se cumplan |
| 2 | **API REST** | Cumplimiento del contrato HTTP (códigos, formato de error, querystring) |
| 3 | **Rendimiento** | Tiempos de respuesta, comportamiento del *debounce*, carga con volumen de datos |
| 4 | **Seguridad** | Validación de entrada, protección contra XSS e inyección, límites anti-DoS |
| 5 | **Compatibilidad** | Comportamiento en distintos viewports y navegadores |
| 6 | **Accesibilidad** | Cumplimiento de criterios básicos WCAG (labels, teclado, contraste) |

Para cada tipo se diseñan **2 pruebas** (12 en total). Todas son ejecutables de forma reproducible sobre el SUT real.

---

## 2. Diseño de pruebas

### 2.1 Pruebas de funcionalidad

#### F-01: Alta de tarea válida y validación de título

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que una tarea válida se crea correctamente con estado inicial `pendiente` y que un título inválido (vacío o solo espacios) es rechazado con mensaje en español. |
| **Escenario** | 1. Abrir la aplicación. 2. Escribir en el formulario el título `"  Comprar leche  "` (con espacios al inicio y al final) y una descripción opcional. 3. Enviar el formulario. 4. Intentar crear una segunda tarea con título vacío (solo espacios). |
| **Datos de entrada** | Entrada 1: `titulo = "  Comprar leche  "`, `descripcion = "Ir al supermercado"`. Entrada 2: `titulo = "   "`, `descripcion = ""`. |
| **Resultados esperados** | Entrada 1: tarea creada y visible en la lista, con título recortado `"Comprar leche"`, estado `pendiente`, y anuncio accesible "Tarea creada". Entrada 2: la tarea NO se crea y se muestra el mensaje `"El título es obligatorio"`. |
| **Métricas** | Tasa de éxito de la operación (100% esperado para el caso válido); exactitud de mensajes de error (comparación exacta); tiempo de respuesta del alta (< 1 s esperado). |

#### F-02: Transición estricta de estados

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que el cambio de estado respeta la regla `pendiente → en_progreso → completada` y que una transición ilegal (salto de estado o retroceso) es rechazada. |
| **Escenario** | 1. Crear una tarea en estado `pendiente`. 2. Intentar cambiarla directamente a `completada`. 3. Cambiarla a `en_progreso`. 4. Cambiarla a `completada`. 5. Intentar devolverla a `pendiente`. |
| **Datos de entrada** | Estados solicitados en orden: `completada` (ilegal), `en_progreso` (legal), `completada` (legal), `pendiente` (ilegal). |
| **Resultados esperados** | Paso 2: rechazo con mensaje `"transición inválida"` (se mantiene `pendiente`, `updatedAt` no cambia). Pasos 3–4: aceptados, `updatedAt` se actualiza. Paso 5: rechazo con `"transición inválida"`. |
| **Métricas** | N.º de transiciones legales aceptadas / n.º de ilegales rechazadas (4/4 esperado); consistencia de `updatedAt` tras mutación legal (debe incrementarse). |

---

### 2.2 Pruebas de API REST

> Herramienta utilizada: **Postman** (colección versionada en `public/postman/collection.json`, importable también en **Insomnia**). Base URL: `{{baseUrl}} = http://localhost:3000`.

#### API-01: Listado con filtros combinados y búsqueda insensitive

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que `GET /api/tasks` aplica los filtros `estado` y `q` de forma combinada (AND) e insensible a mayúsculas, devolviendo 200 con el subconjunto correcto. |
| **Escenario** | 1. Crear 3 tareas: `"Comprar leche"` (pendiente), `"LECHE de avena"` (completada), `"Pasear al perro"` (pendiente). 2. Ejecutar en Postman: `GET {{baseUrl}}/api/tasks?estado=pendiente&q=leche`. 3. Ejecutar `GET {{baseUrl}}/api/tasks?q=PERRO`. |
| **Datos de entrada** | Query 1: `estado=pendiente&q=leche`. Query 2: `q=PERRO`. |
| **Resultados esperados** | Query 1: HTTP 200, array con una sola tarea (`"Comprar leche"`): cumple estado `pendiente` Y contiene `leche` en texto (case-insensitive). Query 2: 200, array con `"Pasear al perro"`. |
| **Métricas** | Código de estado HTTP (200); tamaño del array resultante (1 y 1); latencia de la respuesta (< 300 ms esperado en memoria); conformidad del contrato (objetos con `id`, `titulo`, `estado`, `createdAt`, `updatedAt`). |

#### API-02: Ciclo CRUD completo y manejo de errores (400/404)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar el ciclo `POST → GET/:id → PUT → DELETE` con sus códigos de éxito, y la respuesta de error uniforme `{ error, details }` para entrada inválida e inexistencia. |
| **Escenario** | 1. `POST {{baseUrl}}/api/tasks` con título de 101 caracteres. 2. `POST` válido. 3. `GET /api/tasks/:id` del creado. 4. `PUT /api/tasks/:id` a estado `completada` saltando etapas. 5. `PUT` válido a `en_progreso`. 6. `DELETE /api/tasks/:id`. 7. Repetir `DELETE` con el mismo id. |
| **Datos de entrada** | Paso 1: `{ "titulo": "<101 caracteres>" }`. Paso 2: `{ "titulo": "Estudiar QA", "descripcion": "" }`. Paso 4: `{ "estado": "completada" }`. Paso 5: `{ "estado": "en_progreso" }`. |
| **Resultados esperados** | Paso 1: 400 con `{ "error": "Error de validación", "details": { "titulo": "El título debe tener como máximo 100 caracteres" } }`. Paso 2: 201 con la tarea. Paso 3: 200. Paso 4: 400 `details.estado = "transición inválida"`. Paso 5: 200. Paso 6: 204 sin cuerpo. Paso 7: 404 con `{ "error": "Tarea no encontrada", "details": { "id": "No existe" } }`. |
| **Métricas** | Códigos HTTP exactos por paso (201/200/400/400/200/204/404); forma del error uniforme en todos los 4xx; tiempo de respuesta. |

---

### 2.3 Pruebas de rendimiento

#### R-01: Carga y filtrado con volumen de datos (1000 tareas)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que `GET /api/tasks` y el render de la lista se comportan de forma aceptable con 1000 tareas sembradas en memoria. |
| **Escenario** | 1. Sembrar 1000 tareas en el repositorio (`seedStore`/Repositorio InMemory). 2. Ejecutar `GET /api/tasks?q=abc` (filtro que devuelve ~10). 3. Medir latencia y render. |
| **Datos de entrada** | Volumetría: 1000 registros; query de filtro acotado: `q=abc`. |
| **Resultados esperados** | Listado completo y filtrado responde correctamente; la UI no se congela; el filtro reduce el resultado a las tareas coincidentes. |
| **Métricas** | Latencia de `GET /api/tasks` (umbral objetivo < 500 ms con 1000 items); latencia de la respuesta filtrada (< 200 ms); uso de memoria estable (Δ < 10 % tras filtrar); ausencia de "script timeout". |

#### R-02: Debounce de la búsqueda (300 ms)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que la búsqueda por `q` no dispara consultas ni re-renders por cada tecla, sino una única consulta tras 300 ms de pausa. |
| **Escenario** | 1. Escribir rápidamente `leche` (una tecla cada ~100 ms, sin pausa larga) en el campo Buscar. 2. Contar las peticiones a `/api/tasks` durante la escritura. 3. Hacer pausa de 300 ms y contar la petición final. |
| **Datos de entrada** | Secuencia de teclas: `l, e, c, h, e` con ~100 ms entre pulsaciones. |
| **Resultados esperados** | Durante la escritura: 0 peticiones (solo el valor inmediato actualiza la UI). A los 300 ms de pausa: exactamente 1 petición filtrada. Con pausa de 299 ms: ninguna petición adicional (borde del umbral). |
| **Métricas** | N.º de peticiones a `/api/tasks` en una ventana de 5 s de escritura (esperado 1); tiempo entre última tecla y disparo del request (esperado 300 ± 30 ms); n.º de re-renders de la lista (esperado mínimo). |

---

### 2.4 Pruebas de seguridad

#### S-01: Prevención de XSS en títulos y búsqueda

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que una tarea que contiene HTML/marca de script se renderiza como texto literal y el script NO se ejecuta. |
| **Escenario** | 1. Crear una tarea con título `<script>alert("xss")</script>`. 2. Buscar por `<script>`. 3. Abrir la lista y verificar en el DOM que no exista el nodo `script` y que no aparezca el `alert`. |
| **Datos de entrada** | `titulo = "<script>alert(\"xss\")</script>"`; `q = "<script>"`. |
| **Resultados esperados** | La tarea se muestra como texto (React escapa el contenido); no aparece ningún diálogo `alert`; el nodo `<script>` NO existe en el DOM; la consola no muestra errores de ejecución de scripts. |
| **Métricas** | N.º de ejecuciones de script inyectadas (0 esperado); presencia de texto literal en UI (1/1); resultados de `axe-core` tras la prueba (0 críticas). |

#### S-02: Límites de entrada y resistencia a payloads maliciosos

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que la validación en la API rechaza entradas fuera de rango (anti-DoS trivial) y que un payload malformado no produce errores 500 o caídas no controladas. |
| **Escenario** | 1. `POST /api/tasks` con `titulo` de 100 000 caracteres. 2. `POST` con JSON malformado (cadena inválida). 3. `POST` con tipo de dato incorrecto (`titulo` numérico). |
| **Datos de entrada** | Payload 1: `{ "titulo": "<100k chars>" }`. Payload 2: `{ "titulo": ` (JSON truncado). Payload 3: `{ "titulo": 12345 }`. |
| **Resultados esperados** | Payload 1: 400 con `details.titulo = "El título debe tener como máximo 100 caracteres"` (sin procesamiento del resto). Payload 2: 400 (JSON inválido rechazado). Payload 3: 400 (tipo inválido). En ningún caso se devuelve 500 ni se ve afectado el estado posterior del sistema. |
| **Métricas** | Código HTTP por payload (400/400/400 esperado); latencia de rechazo (< 100 ms, rápido para no permitir DoS por CPU); salud del proceso tras la prueba (sigue respondiendo `/api/health` con 200). |

---

### 2.5 Pruebas de compatibilidad

#### C-01: Layout responsive en 390 / 768 / 1280 px

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que el CRUD completo es usable en viewports móvil (390 px), tablet (768 px) y desktop (1280 px) sin desbordes horizontales. |
| **Escenario** | 1. Abrir la app en cada viewport (DevTools → responsive). 2. Crear una tarea con título largo ("Título con una longitud considerable para probar el layout"). 3. Verificar que formulario, filtros, lista y tarjetas se ven completos y accesibles. |
| **Datos de entrada** | Viewports: 390×844, 768×1024, 1280×720; tarea con 60+ caracteres. |
| **Resultados esperados** | En los 3 viewports: sin scroll horizontal, sin elementos superpuestos, todos los controles alcanzables; las tarjetas distribuyen el `select` y los botones sin romper el layout. |
| **Métricas** | Ancho de scroll horizontal de `<body>` (0 px esperado en los 3); elementos con desbordamiento detectado (0); pasos de desplazamiento necesarios para alcanzar el botón `Crear tarea`. |

#### C-02: Comportamiento en navegadores modernos (Chromium vs Firefox vs WebKit) y runtime Node

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que las funcionalidades críticas (CRUD, filtros, búsqueda) se comportan igual en los 3 motores de navegador y que el código usa solo APIs estandarizadas. |
| **Escenario** | 1. Ejecutar la suite de integración (Vitest + jsdom) y el smoke funcional en Chromium, Firefox y WebKit (Playwright). 2. Ejecutar el build. 3. Comparar resultados. |
| **Datos de entrada** | Navegadores: Chrome 131+, Edge, Firefox 132+, Safari 18+; runtime: Node 20 y Node 22. |
| **Resultados esperados** | CRUD + filtros con el mismo comportamiento y los mismos mensajes en los 3 motores; build de producción exitoso en los dos runtimes; sin uso de APIs no soportadas (fetch, Date, crypto estándar). |
| **Métricas** | N.º de pruebas funcionales que pasan por navegador (100 % esperado); divergencias de comportamiento detectadas (0); diffs de render (`toMatchSnapshot`) vacíos entre motores. |

---

### 2.6 Pruebas de accesibilidad

#### A-01: Auditoría automática con axe-core (WCAG AA básico)

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que la página no tiene violaciones de accesibilidad de impacto *critical* o *serious* según axe-core, incluyendo labels asociados y `aria-live` en estados de carga/error/éxito. |
| **Escenario** | 1. Ejecutar la auditoría con `axe-core` sobre la lista (con datos), sobre el formulario y sobre los estados de error/vacío. 2. Registrar violaciones por impacto. |
| **Datos de entrada** | Página: `TasksPage` en 4 estados: con datos, vacío, cargando, con error de mutación. |
| **Resultados esperados** | 0 violaciones *critical*; 0 violaciones *serious*; cada `input` tiene `label` asociado (`htmlFor`/`aria-labelledby`); el anuncio de "Tarea creada" se emite vía `aria-live="polite"` y errores con `role="alert"`. |
| **Métricas** | N.º de violaciones *critical* (0); n.º de violaciones *serious* (0); inputs sin label (0); ratio de contraste de textos (≥ 4.5:1 para texto normal). |

#### A-02: Navegación completa por teclado

| Aspecto | Detalle |
|---|---|
| **Objetivo** | Verificar que toda la funcionalidad (crear, filtrar, cambiar estado, editar, eliminar) es operable únicamente con teclado y con foco visible. |
| **Escenario** | 1. Sin mouse, recorrer con `Tab` desde el selector de filtros hasta el botón `Crear tarea`. 2. Con `Enter` en el botón, crear una tarea. 3. Con `Tab` llegar al `select` de estado de la tarjeta y cambiar de estado con flechas. 4. Con `Tab` llegar a `Eliminar`, `Enter`, y confirmar. 5. Limpiar filtros con `Tab` + `Enter`. |
| **Datos de entrada** | Secuencia de teclas: `Tab`, flechas en `select`, `Enter`, `Escape` (cancelar confirmación de borrado). |
| **Resultados esperados** | El foco recorre en orden lógico: filtros → formulario → lista; el foco es visible en cada paso (`focus-visible`); todas las operaciones se completan sin mouse; al cancelar con `Escape` la tarea NO se elimina. |
| **Métricas** | N.º de operaciones críticas completadas por teclado (5/5 esperado); trampas de foco (0, el foco nunca queda atrapado); indicador `:focus-visible` presente en todos los controles interactivos. |

---

## 3. Resultados esperados del plan (resumen)

| Tipo | Prueba | Resultado esperado clave |
|---|---|---|
| Funcionalidad | F-01 / F-02 | Alta válida + rechazo con mensajes ES; 4/4 transiciones correctas |
| API REST | API-01 / API-02 | Filtros AND correctos; ciclo CRUD 201/200/204 y errores 400/404 uniformes |
| Rendimiento | R-01 / R-02 | 1000 items < 500 ms; 1 sola petición de búsqueda tras 300 ms |
| Seguridad | S-01 / S-02 | 0 XSS; 400 (no 500) ante payloads maliciosos |
| Compatibilidad | C-01 / C-02 | 0 scroll horizontal en 3 viewports; 0 divergencias entre motores |
| Accesibilidad | A-01 / A-02 | 0 violaciones critical/serious; 5/5 operaciones por teclado |

## 4. Ejecución práctica (cómo reproducir)

```bash
pnpm install        # instalar dependencias
pnpm dev            # iniciar app (MSW responde en http://localhost:3000)
pnpm test           # suite Vitest (139 tests) — cubre dominio, API, hooks, UI
pnpm test:coverage  # gate de cobertura (>= 80 %)
pnpm check          # typecheck + lint
pnpm build          # build de producción
```

- **API con Postman:** importar `public/postman/collection.json` (variable `baseUrl` = `http://localhost:3000`) o usar Insomnia con el mismo archivo. La colección incluye casos CRUD, filtros, 400×3 y 404×3.
- **Accesibilidad:** la auditoría `axe` está integrada en `TasksPage.test.tsx`.
- **Rendimiento (R-01):** sembrar 1000 tareas vía `seedStore()` del repositorio InMemory y medir con la pestaña Network/Performance del navegador.

## 5. Conclusiones y recomendaciones

**Conclusiones**

1. El diseño por **6 dimensiones** demostró que un mismo sistema requiere oráculos distintos: la funcionalidad valida *reglas*, la API valida *contratos*, el rendimiento valida *tiempos*, la seguridad valida *superficie de ataque*, la compatibilidad valida *entornos* y la accesibilidad valida *usuarios*.
2. La **validación centralizada en dominio** (no en la UI) fue clave: los mismos validadores alimentan la UI, los handlers de API y los tests, lo que garantiza consistencia entre lo que se prueba en Vitest y lo que se prueba con Postman.
3. El patrón **error uniforme `{ error, details }`** simplificó las pruebas de API: bastó un único contrato para asertar todos los 4xx.
4. La **transición estricta de estados** elevó la cantidad de casos de borde funcionales y de API, lo que hizo el SUT más rico para el laboratorio.
5. El smoke test manual (`pnpm dev` + navegador) detectó un defecto real (service worker de MSW ausente) que la suite automatizada no cubría: **la automatización no reemplaza la prueba exploratoria**.

**Recomendaciones**

1. **Automatizar lo repetible:** convertir F-01, F-02, API-01 y API-02 en tests de regresión CI (ya existen como Vitest); dejar manuales solo las pruebas de percepción (rendimiento visual, compatibilidad real de navegadores).
2. **Subir cobertura de orquestación:** `TasksPage` está en ~50 % de líneas cubiertas; agregar casos de error de mutación y de eliminación para cerrar huecos.
3. **Incorporar el *smoke* en browser al flujo:** añadir un test Playwright mínimo (3 motores) para cubrir el hueco que hoy depende de la prueba manual, y así blindar C-02.
4. **Migrar la persistencia a una API real** (Express/Fastify) en una fase siguiente manteniendo el mismo contrato HTTP: la colección Postman seguiría servirá sin cambios, solo cambiando `{{baseUrl}}`.
5. **Documentar las métricas esperadas como SLO del laboratorio** (tabla de la sección 3) para que la retroalimentación de clase tenga un estándar objetivo de comparación.

## 6. Retroalimentación solicitada a la clase

Para la puesta en común, solicito revisión sobre:

1. **¿Faltan tipos de pruebas?** (p. ej., usabilidad, internacionalización, pruebas de regresión visual).
2. **¿Son suficientes 2 pruebas por tipo o alguno merece una tercera?** (candidatos: edición con validación parcial en API, concurrencia).
3. **¿Las métricas y umbrales son objetivos y medibles?** (¿algún umbral sin sustento?).
4. **¿El diseño es reproducible por otro compañero con la documentación entregada?**