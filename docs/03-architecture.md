# Arquitectura: Clean Architecture

El proyecto sigue **Clean Architecture** con separación estricta en capas. **NUNCA cruces límites incorrectos.**

## Estructura de directorios

```
tareas-qa-lab/
├── docs/                         # Documentación (12 archivos)
├── src/
│   ├── domain/                   # Capa pura: entidades, contratos, casos de uso
│   │   ├── entities/             # Task, TaskStatus, etc.
│   │   ├── repositories/         # Interfaces (TaskRepository)
│   │   └── usecases/             # CreateTask, UpdateTask, ListTasks, etc.
│   ├── infrastructure/           # Implementación técnica
│   │   ├── api/                  # Cliente HTTP / handlers REST
│   │   ├── repositories/         # TaskRepositoryInMemory / TaskRepositoryHttp
│   │   └── storage/              # Persistencia local si aplica
│   ├── application/              # Orquestación y estado
│   │   ├── stores/               # useTaskStore / TaskContext
│   │   ├── hooks/                # useTasks, useTaskFilters
│   │   └── factory.ts            # Composición raíz (fábrica de dependencias)
│   ├── presentation/             # React UI
│   │   ├── components/           # TaskList, TaskForm, TaskFilter, TaskCard
│   │   ├── pages/                # TasksPage, etc.
│   │   └── routes/               # Definición de rutas
│   └── lib/                      # Utilidades compartidas (cn, validators, constants)
├── AGENTS.md
└── README.md
```

## Regla de dependencias (NUNCA romper)

- **domain** → **NO importa de nadie más** (capa pura, sin dependencias externas)
- **infrastructure** → SOLO importa de `domain`
- **application** → Importa de `domain` e `infrastructure`
- **presentation** → Importa de `application`. NUNCA directo de `infrastructure`

```
presentation → application → infrastructure → domain
                    └──────────────┘
                   Solo hacia adentro
```

## Cómo debe trabajar el agente dentro de la arquitectura

1. **Localiza la capa antes de tocar código**: identifica si un cambio pertenece a `domain`, `infrastructure`, `application` o `presentation`.
2. **Respeta los límites**: si necesitas un dato de infraestructura en UI, pasa por `application/`. Nunca importes `infrastructure/` desde `presentation/`.
3. **Domain es puro**: no añadas imports de librerías externas (React, fetch, etc.) a la capa de dominio.
4. **La composición raíz** (factory de repositorios/servicios) vive en `application/factory.ts`: la UI nunca instancia dependencias técnicas directamente.
5. **Flujo de una acción típica**: `User Action → Componente → Hook/Store/Servicio → UseCase → Repository → Infraestructura` y de vuelta con el estado actualizado.

Si un cambio rompe cualquiera de estas reglas, **detente y rediseña** antes de continuar.

## Notas específicas para tareas-qa-lab

- El dominio inicial es `Task` (ver `docs/04-domain.md`); mantenerlo mínimo para que el laboratorio QA sea trazable.
- La API REST se modela como puerto en `domain/repositories` y se implementa en `infrastructure/api`.
- Los filtros por estado son lógica de `application` (no de UI ni de infraestructura).
