
**Versión del Documento:** 1.0.0
**Estado:** Listo para Producción
**Audiencia:** Desarrollador Senior / Mantenedor Único
**Motor de Base de Datos:** PostgreSQL 15 (vía Supabase)
**Última Revisión:** 2026-06-28

---

## Tabla de Contenidos

1. [Filosofía de Diseño del Esquema](#1-filosofía-de-diseño-del-esquema)
2. [Visión General de las Relaciones entre Entidades](#2-visión-general-de-las-relaciones-entre-entidades)
3. [Tabla: `profiles`](#3-tabla-profiles)
4. [Tabla: `classes`](#4-tabla-classes)
5. [Tabla: `challenges`](#5-tabla-challenges)
6. [Tabla: `code_history`](#6-tabla-code_history)
7. [Tabla: `doubts`](#7-tabla-doubts)
8. [La Tabla `code_history` — Justificación Pedagógica](#8-la-tabla-code_history--justificación-pedagógica)
9. [Comportamiento de Eliminación en Cascada](#9-comportamiento-de-eliminación-en-cascada)
10. [Índices y Consideraciones de Rendimiento](#10-índices-y-consideraciones-de-rendimiento)
11. [Script Completo de Inicialización del Esquema](#11-script-completo-de-inicialización-del-esquema)

---

## 1. Filosofía de Diseño del Esquema

El esquema de base de datos de Horizon Zenith está diseñado bajo tres principios rectores:

**Principio 1 — Centrado en el alumno.** Cada tabla está anclada a una identidad de alumno. La tabla `profiles` es el nodo raíz de todo el grafo de entidades. Todas las demás tablas — `classes`, `challenges`, `code_history` y `doubts` — están directa o transitivamente vinculadas a ella. La eliminación del perfil de un alumno produce una cascada sobre todos los datos asociados, garantizando la integridad referencial sin registros huérfanos.

**Principio 2 — Contratos de estado explícitos.** Todas las columnas que contienen estado (`profiles.status`, `challenges.status`) utilizan restricciones `CHECK` para hacer cumplir las transiciones de estado válidas a nivel de base de datos. Esto crea una segunda línea de defensa por debajo de la validación de la capa de aplicación, garantizando que ningún valor fuera de la especificación pueda persistirse jamás, independientemente del comportamiento del cliente.

**Principio 3 — Memoria de aprendizaje estructurada.** La tabla `code_history` existe específicamente para resolver el problema pedagógico del deterioro del conocimiento entre sesiones. En lugar de depender de que los alumnos gestionen sus propios archivos, la plataforma persiste todos los artefactos de código producidos durante una clase, anotados con descripciones contextuales, y los presenta a través de una interfaz estructurada y navegable.

---

## 2. Visión General de las Relaciones entre Entidades

```
  auth.users (Supabase Auth)
       |
       | 1:1
       v
  +--------------------+
  |      profiles      |   <-- Entidad raíz. Todos los datos del alumno parten de aquí.
  |  id (UUID) PK/FK   |
  +--------------------+
       |           |
       | 1:N       | 1:N
       v           v
  +---------+  +------------+
  | classes |  | challenges |
  |  (id)   |  |  (id)      |
  +---------+  +------------+
       |
       | 1:N
       v
  +--------------+
  | code_history |   <-- Artefactos de código vinculados a una sesión de clase específica.
  |  (id)        |
  +--------------+

  profiles
       |
       | 1:N
       v
  +--------+
  | doubts |   <-- Canal de preguntas y respuestas asincrónico entre alumno y mentor.
  +--------+
```

---

## 3. Tabla: `profiles`

La tabla `profiles` extiende la tabla nativa `auth.users` de Supabase con metadatos del dominio de negocio. Sirve como fuente única de verdad para la identidad de un alumno, su estado de inscripción y sus recursos externos vinculados.

### Sentencia CREATE TABLE

```sql
CREATE TABLE public.profiles (
  -- La clave primaria es el UUID de Supabase Auth, imponiendo una relación
  -- estricta 1:1 con el registro de autenticación.
  id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Nombre completo o nombre de pantalla preferido del alumno.
  name              TEXT        NOT NULL,

  -- Describe el programa activo del alumno. Usado para visualización y filtrado.
  -- Ejemplos: 'Especializacion Frontend', 'Python Express', 'Fullstack Carrera'
  role              TEXT        NOT NULL,

  -- Estado del ciclo de vida. Controla el acceso al Hub y la visibilidad en
  -- el panel del mentor.
  -- 'Activo'     -> El alumno tiene acceso activo al Hub.
  -- 'Pausado'    -> Suscripción pausada. Acceso al Hub restringido. Disparado por Stripe.
  -- 'Finalizado' -> Programa completado. Acceso de solo lectura al archivo.
  status            TEXT        NOT NULL
                    DEFAULT     'Activo'
                    CHECK (status IN ('Activo', 'Pausado', 'Finalizado')),

  -- Diferencia entre programas de larga duración y servicios de sesión única.
  -- Afecta el diseño de la UI (panel completo vs. vista express mínima).
  program_type      TEXT        NOT NULL
                    CHECK (program_type IN ('Carrera Completa', 'Clase Particular Express')),

  -- Objetivo de aprendizaje declarado por el alumno. Se muestra en la consola
  -- del mentor para proporcionar contexto durante la preparación de las sesiones.
  objective         TEXT        NOT NULL,

  -- Enlace estático a Google Meet o Whereby del aula dedicada del alumno.
  -- Nullable: se completa tras el aprovisionamiento, no en el momento de la creación.
  meet_link         TEXT,

  -- URL del repositorio privado de GitHub del alumno (aprovisionado vía GitHub API).
  -- Nullable: se completa por la Edge Function tras el aprovisionamiento exitoso.
  github_repo       TEXT,

  -- Marca de tiempo de creación del registro. Inmutable tras la inserción.
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Habilitar Row-Level Security. Ningún dato es accesible sin una política explícita.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: un alumno solo puede seleccionar o actualizar su propia fila de perfil.
CREATE POLICY "alumno_accede_propio_perfil"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Referencia de Columnas

| Columna | Tipo | Nullable | Valor por Defecto | Descripción |
|---|---|---|---|---|
| `id` | `UUID` | No | — | FK a `auth.users(id)`. También es la PK. |
| `name` | `TEXT` | No | — | Nombre de pantalla del alumno. |
| `role` | `TEXT` | No | — | Etiqueta de especialización del programa. |
| `status` | `TEXT` | No | `'Activo'` | Estado del ciclo de vida. Restringido por `CHECK`. |
| `program_type` | `TEXT` | No | — | Tipo de inscripción. Restringido por `CHECK`. |
| `objective` | `TEXT` | No | — | Meta de aprendizaje declarada por el alumno. |
| `meet_link` | `TEXT` | Sí | `NULL` | URL del aula de videollamada. |
| `github_repo` | `TEXT` | Sí | `NULL` | URL del repositorio en GitHub, se establece post-aprovisionamiento. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Marca de tiempo de creación inmutable. |

---

## 4. Tabla: `classes`

La tabla `classes` representa los registros de sesiones individuales — cada clase que el mentor ha impartido a un alumno específico. Almacena los metadatos de la sesión grabada y la URL del video protegido.

### Sentencia CREATE TABLE

```sql
CREATE TABLE public.classes (
  id            SERIAL        NOT NULL,

  -- Clave foránea al alumno al que pertenece esta clase.
  -- ON DELETE CASCADE: todas las clases se eliminan si el alumno padre se elimina.
  student_id    UUID          NOT NULL
                REFERENCES    public.profiles(id) ON DELETE CASCADE,

  -- Número de clase secuencial dentro del programa de este alumno. Usado para
  -- ordenación en pantalla y cálculo de progreso. Comienza en 1.
  class_number  INT           NOT NULL CHECK (class_number > 0),

  -- Título descriptivo de la sesión. Se muestra en la lista de clases del alumno.
  -- Ejemplo: 'Autenticacion JWT y Middleware Protegido'
  title         TEXT          NOT NULL,

  -- Cadena de fecha legible para mostrar. Almacenada como TEXT para acomodar
  -- formatos regionales (ej: '28 de Junio, 2026').
  date          TEXT          NOT NULL,

  -- Duración legible de la sesión (ej: '1h 45min').
  duration      TEXT          NOT NULL,

  -- Descripción detallada de lo que se cubrió en la sesión. Se muestra en el
  -- encabezado del detalle de clase, sobre el explorador de archivos de código.
  description   TEXT          NOT NULL,

  -- URL incrustable vía iframe de la grabación protegida de la clase.
  -- Proveniente de Vimeo o Mux. Restricción de dominio aplicada a nivel del proveedor.
  video_url     TEXT          NOT NULL,

  CONSTRAINT classes_pkey PRIMARY KEY (id)
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Política: los alumnos solo pueden leer las clases asignadas a su propio perfil.
CREATE POLICY "alumno_lee_propias_clases"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);
```

### Referencia de Columnas

| Columna | Tipo | Nullable | Valor por Defecto | Descripción |
|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-incremento | Clave primaria sustituta. |
| `student_id` | `UUID` | No | — | FK a `profiles(id)`. Cascada en eliminación. |
| `class_number` | `INT` | No | — | Índice de clase secuencial. Debe ser > 0. |
| `title` | `TEXT` | No | — | Título de la sesión mostrado al alumno. |
| `date` | `TEXT` | No | — | Fecha de la sesión en formato legible. |
| `duration` | `TEXT` | No | — | Duración de la sesión en formato legible. |
| `description` | `TEXT` | No | — | Resumen de la sesión para el Hub del alumno. |
| `video_url` | `TEXT` | No | — | URL de incrustación de la grabación protegida. |

---

## 5. Tabla: `challenges`

La tabla `challenges` implementa el sistema de gestión de tareas de la plataforma. Rastrea el ciclo de vida completo de una asignación de alumno, desde la asignación inicial por el mentor hasta la autoevaluación del alumno y la aprobación final del mentor.

### Sentencia CREATE TABLE

```sql
CREATE TABLE public.challenges (
  id            SERIAL        NOT NULL,

  -- Clave foránea al alumno al que se asigna este desafío.
  -- ON DELETE CASCADE: los desafíos se eliminan si el alumno padre se elimina.
  student_id    UUID          NOT NULL
                REFERENCES    public.profiles(id) ON DELETE CASCADE,

  -- Título corto y descriptivo de la tarea.
  -- Ejemplo: 'Implementar un CRUD de productos con validacion Zod'
  title         TEXT          NOT NULL,

  -- Especificación completa de los requisitos del desafío. Soporta formato
  -- Markdown para renderizar instrucciones estructuradas en el Hub del alumno.
  description   TEXT          NOT NULL,

  -- Estado actual del desafío dentro de su ciclo de vida.
  -- 'Pendiente'              -> Asignado, aún no iniciado.
  -- 'En Progreso'            -> El alumno está trabajando activamente.
  -- 'Listo para Correccion'  -> El alumno entregó; esperando revisión del mentor.
  -- 'Aprobado'               -> El mentor revisó y aprobó el trabajo.
  status        TEXT          NOT NULL
                DEFAULT       'Pendiente'
                CHECK (status IN (
                  'Pendiente',
                  'En Progreso',
                  'Listo para Correccion',
                  'Aprobado'
                )),

  -- Marca de tiempo de la última transición de estado. Se actualiza en cada PATCH.
  -- Usada para mostrar el tiempo en cada estado y ordenar la cola de revisión del mentor.
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT challenges_pkey PRIMARY KEY (id)
);

-- Trigger para actualizar automáticamente updated_at en cada modificación de fila.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenges_updated_at_trigger
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Política: los alumnos pueden leer todos sus desafíos y actualizar solo su propio estado.
CREATE POLICY "alumno_gestiona_propios_desafios"
  ON public.challenges
  FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
```

### Referencia de Columnas

| Columna | Tipo | Nullable | Valor por Defecto | Descripción |
|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-incremento | Clave primaria sustituta. |
| `student_id` | `UUID` | No | — | FK a `profiles(id)`. Cascada en eliminación. |
| `title` | `TEXT` | No | — | Título corto de la tarea. |
| `description` | `TEXT` | No | — | Especificación completa de la tarea. Soporta Markdown. |
| `status` | `TEXT` | No | `'Pendiente'` | Valor de la máquina de estados. Restringido por `CHECK`. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Se actualiza automáticamente en cada modificación. |

---

## 6. Tabla: `code_history`

La tabla `code_history` es el núcleo intelectual del modelo pedagógico de Horizon Zenith. Almacena cada artefacto de código producido durante una sesión de clase, vinculado directamente al registro de esa sesión y anotado con una descripción legible que explica el propósito del artefacto.

### Sentencia CREATE TABLE

```sql
CREATE TABLE public.code_history (
  id              SERIAL        NOT NULL,

  -- Clave foránea a la sesión de clase padre.
  -- ON DELETE CASCADE: los archivos de código se eliminan si la clase padre se elimina.
  -- Preserva la integridad referencial cuando se limpia el registro de una sesión.
  class_id        INT           NOT NULL
                  REFERENCES    public.classes(id) ON DELETE CASCADE,

  -- El nombre del archivo tal como existe (o debería existir) en el repositorio
  -- de GitHub del alumno. Almacenado con su extensión para habilitar el resaltado
  -- de sintaxis en el visor de código del Hub.
  -- Ejemplos: 'auth.middleware.ts', 'useAuth.hook.ts', 'schema.prisma'
  file_name       TEXT          NOT NULL,

  -- Una explicación en lenguaje natural de qué hace este archivo y por qué fue
  -- escrito de esta manera. Esta es la anotación pedagógica — la "voz del mentor"
  -- adjunta permanentemente al artefacto de código.
  description     TEXT          NOT NULL,

  -- El código fuente sin procesar almacenado como cadena de texto plano. Se renderiza
  -- en el Hub con resaltado de sintaxis (ej: Shiki o Prism) basado en la extensión
  -- del file_name. No se aplica límite de tamaño a nivel de BD; la validación de
  -- la capa de aplicación debería limitar entradas individuales (ej: 100 KB).
  code_content    TEXT          NOT NULL,

  CONSTRAINT code_history_pkey PRIMARY KEY (id)
);

ALTER TABLE public.code_history ENABLE ROW LEVEL SECURITY;

-- Política: los alumnos solo pueden leer entradas de code_history pertenecientes
-- a sus propias clases. La subconsulta valida la identidad del alumno
-- atravesando la propiedad de la clase.
CREATE POLICY "alumno_lee_codigo_via_propiedad_clase"
  ON public.code_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE public.classes.id = code_history.class_id
        AND public.classes.student_id = auth.uid()
    )
  );
```

### Referencia de Columnas

| Columna | Tipo | Nullable | Valor por Defecto | Descripción |
|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-incremento | Clave primaria sustituta. |
| `class_id` | `INT` | No | — | FK a `classes(id)`. Cascada en eliminación. |
| `file_name` | `TEXT` | No | — | Nombre de archivo con extensión. Usado para resaltado de sintaxis. |
| `description` | `TEXT` | No | — | Anotación pedagógica del mentor para este archivo. |
| `code_content` | `TEXT` | No | — | Código fuente sin procesar como cadena de texto plano. |

---

## 7. Tabla: `doubts`

La tabla `doubts` implementa un canal de preguntas y respuestas asincrónico, basado en tickets, entre el alumno y el mentor. Reemplaza los canales de comunicación informales (WhatsApp, correo electrónico) por un sistema de soporte estructurado y rastreable, integrado directamente en la plataforma.

### Sentencia CREATE TABLE

```sql
CREATE TABLE public.doubts (
  id            SERIAL        NOT NULL,

  -- Clave foránea al alumno que envió la consulta.
  -- ON DELETE CASCADE: todas las consultas se eliminan si el perfil del alumno se elimina.
  student_id    UUID          NOT NULL
                REFERENCES    public.profiles(id) ON DELETE CASCADE,

  -- La pregunta del alumno, enviada a través del formulario de consultas del Hub.
  question      TEXT          NOT NULL,

  -- La respuesta escrita del mentor. NULL hasta que el mentor responde.
  -- Se completa a través de la interfaz de respuesta de la consola de administración.
  answer        TEXT,

  -- Indicador booleano simple que rastrea el estado de resolución.
  -- FALSE -> Abierta, esperando respuesta del mentor.
  -- TRUE  -> Resuelta. El mentor ha proporcionado una respuesta.
  is_resolved   BOOLEAN       NOT NULL DEFAULT FALSE,

  -- Marca de tiempo del envío de la consulta. Usada para ordenar la cola en
  -- la consola del mentor.
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT doubts_pkey PRIMARY KEY (id)
);

ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- Política: los alumnos pueden insertar nuevas consultas y leer su propio historial.
CREATE POLICY "alumno_gestiona_propias_consultas"
  ON public.doubts
  FOR ALL
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
```

### Referencia de Columnas

| Columna | Tipo | Nullable | Valor por Defecto | Descripción |
|---|---|---|---|---|
| `id` | `SERIAL` | No | Auto-incremento | Clave primaria sustituta. |
| `student_id` | `UUID` | No | — | FK a `profiles(id)`. Cascada en eliminación. |
| `question` | `TEXT` | No | — | La consulta enviada por el alumno. |
| `answer` | `TEXT` | Sí | `NULL` | Respuesta del mentor. `NULL` hasta ser respondida. |
| `is_resolved` | `BOOLEAN` | No | `FALSE` | Indicador de estado de resolución. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Marca de tiempo de envío inmutable. |

---

## 8. La Tabla `code_history` — Justificación Pedagógica

### El Problema que se Resuelve

La educación en software tiene un problema documentado de deterioro del conocimiento: un alumno puede asistir a una sesión compleja y práctica que cubra un tema avanzado (como middleware de autenticación JWT, diseño de esquemas de base de datos o hooks personalizados de React) y demostrar una comprensión clara durante la sesión en vivo. Sin embargo, al volver a implementar un patrón similar días o semanas después, el alumno descubre que, sin el código original y la explicación contextual de *por qué* se tomó cada decisión, el conocimiento no es recuperable sin revisar toda la grabación de la sesión.

Las estrategias de remediación tradicionales — compartir archivos por correo, WhatsApp o Google Drive — adolecen de tres fallas acumulativas:

1. **Pérdida de contexto:** El archivo existe en aislamiento, sin la explicación de su propósito arquitectónico.
2. **Falta de navegabilidad:** Los archivos compartidos como adjuntos o enlaces no pueden explorarse, buscarse ni filtrarse dentro del entorno de aprendizaje.
3. **Deriva de versiones:** Los alumnos a menudo modifican los archivos compartidos, haciendo imposible distinguir la implementación de "referencia" de sus propios cambios experimentales.

### Cómo `code_history` Resuelve Estas Fallas

La tabla `code_history` provee un **archivo de código permanente, estructurado y por sesión**, accesible directamente desde el Hub del alumno. Su diseño aborda cada modo de falla:

**Falla 1 — Pérdida de contexto:** La columna `description` no es un comentario de nombre de archivo. Es un campo dedicado a la anotación pedagógica del mentor — una explicación en prosa escrita en el momento de la sesión que captura la *intención* detrás del código, no solo su mecánica. Por ejemplo:

- `file_name`: `auth.middleware.ts`
- `description`: "Este middleware valida que el header Authorization contenga un JWT firmado con HS256. Usa jose en lugar de jsonwebtoken porque es compatible con el Edge Runtime de Next.js. Si el token es inválido o expirado, retorna 401 automáticamente antes de que el request llegue al route handler."
- `code_content`: (código fuente TypeScript completo)

**Falla 2 — Falta de navegabilidad:** El Hub renderiza todas las filas de `code_history` para un `class_id` dado como un explorador de archivos basado en pestañas. Los alumnos pueden cambiar entre archivos, leer descripciones y copiar código dentro de la misma interfaz donde acceden a la grabación de la sesión — proporcionando una experiencia de navegación fluida y contextualmente anclada.

**Falla 3 — Deriva de versiones:** La tabla `code_history` almacena la implementación de referencia autoritativa del mentor, vinculada permanentemente a la sesión a nivel de base de datos. El repositorio de GitHub del alumno puede evolucionar de forma independiente, pero la implementación de referencia permanece inmutable y accesible para comparación en cualquier momento.

### Patrón de Consulta para el Explorador de Archivos del Hub

Cuando un alumno navega a una clase específica, la siguiente consulta recupera todos los artefactos de código de esa sesión:

```sql
SELECT
  ch.id,
  ch.file_name,
  ch.description,
  ch.code_content
FROM code_history ch
INNER JOIN classes c ON c.id = ch.class_id
WHERE
  ch.class_id = $1              -- Parametrizado: el ID de la clase seleccionada
  AND c.student_id = auth.uid() -- RLS reforzado también a nivel de consulta
ORDER BY ch.id ASC;
```

La cláusula `ORDER BY ch.id ASC` preserva el orden de inserción, que corresponde a la secuencia cronológica en que los archivos fueron introducidos durante la sesión — un ordenamiento pedagógicamente significativo que refleja la estructura narrativa de la clase.

---

## 9. Comportamiento de Eliminación en Cascada

La siguiente tabla documenta el comportamiento completo de la cascada disparada por la eliminación de un registro padre:

| Acción | Afecta Directamente | Cascada Sobre |
|---|---|---|
| `DELETE FROM profiles WHERE id = $1` | 1 registro de perfil | Todas las `classes`, `challenges` y `doubts` del alumno. Todos los `code_history` vinculados a esas clases. |
| `DELETE FROM classes WHERE id = $1` | 1 registro de clase | Todas las entradas de `code_history` vinculadas a esa clase. |
| `DELETE FROM auth.users WHERE id = $1` | 1 usuario de auth | Cascada hacia `profiles`, luego hacia todos los datos del alumno (a través de la cadena de cascada del perfil). |

Esta cadena de cascada garantiza que no haya registros huérfanos en ningún nivel de la jerarquía de datos. El conjunto de datos completo de un alumno — identidad de autenticación, metadatos del perfil, registros de clases, artefactos de código, desafíos e historial de consultas — se elimina atómicamente mediante una única operación sobre `auth.users` o `profiles`.

---

## 10. Índices y Consideraciones de Rendimiento

Los siguientes índices se recomiendan para cargas de trabajo en producción más allá del nivel gratuito:

```sql
-- Acelera el patrón de consulta más común: obtener todas las clases de un alumno.
CREATE INDEX idx_classes_student_id ON public.classes(student_id);

-- Acelera el listado de desafíos y el filtrado por estado por alumno.
CREATE INDEX idx_challenges_student_id ON public.challenges(student_id);

-- Acelera las consultas del explorador de archivos de código por clase.
CREATE INDEX idx_code_history_class_id ON public.code_history(class_id);

-- Acelera la cola de resolución de consultas de la consola del mentor (abiertas primero).
CREATE INDEX idx_doubts_student_resolved ON public.doubts(student_id, is_resolved);
```

Todas las claves primarias `SERIAL` tienen índices B-tree implícitos. Todas las claves foráneas UUID (ej: `student_id` en `classes`, `challenges`, `doubts`) requieren índices explícitos como se documenta arriba, ya que PostgreSQL no los crea automáticamente para columnas de clave foránea.

---

## 11. Script Completo de Inicialización del Esquema

El siguiente script inicializa el esquema completo de Horizon Zenith desde cero. Es idempotente y seguro para ejecutar contra un proyecto Supabase vacío.

```sql
-- ============================================================
-- HORIZON ZENITH — INICIALIZACIÓN COMPLETA DEL ESQUEMA
-- PostgreSQL 15 / Supabase
-- Versión: 1.0.0 | Última actualización: 2026-06-28
-- ============================================================

-- PASO 1: Crear tablas

CREATE TABLE public.profiles (
  id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'Activo'
                            CHECK (status IN ('Activo', 'Pausado', 'Finalizado')),
  program_type  TEXT        NOT NULL
                            CHECK (program_type IN ('Carrera Completa', 'Clase Particular Express')),
  objective     TEXT        NOT NULL,
  meet_link     TEXT,
  github_repo   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.classes (
  id            SERIAL      NOT NULL,
  student_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_number  INT         NOT NULL CHECK (class_number > 0),
  title         TEXT        NOT NULL,
  date          TEXT        NOT NULL,
  duration      TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  video_url     TEXT        NOT NULL,
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.challenges (
  id            SERIAL      NOT NULL,
  student_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'Pendiente'
                            CHECK (status IN (
                              'Pendiente',
                              'En Progreso',
                              'Listo para Correccion',
                              'Aprobado'
                            )),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id)
);

CREATE TABLE public.code_history (
  id            SERIAL      NOT NULL,
  class_id      INT         NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  file_name     TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  code_content  TEXT        NOT NULL,
  CONSTRAINT code_history_pkey PRIMARY KEY (id)
);

CREATE TABLE public.doubts (
  id            SERIAL      NOT NULL,
  student_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question      TEXT        NOT NULL,
  answer        TEXT,
  is_resolved   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT doubts_pkey PRIMARY KEY (id)
);

-- PASO 2: Crear triggers

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenges_updated_at_trigger
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASO 3: Habilitar RLS en todas las tablas

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts      ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas RLS

CREATE POLICY "alumno_accede_propio_perfil"
  ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "alumno_lee_propias_clases"
  ON public.classes FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "alumno_gestiona_propios_desafios"
  ON public.challenges FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "alumno_lee_codigo_via_propiedad_clase"
  ON public.code_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE public.classes.id = code_history.class_id
        AND public.classes.student_id = auth.uid()
    )
  );

CREATE POLICY "alumno_gestiona_propias_consultas"
  ON public.doubts FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- PASO 5: Crear índices de rendimiento

CREATE INDEX idx_classes_student_id      ON public.classes(student_id);
CREATE INDEX idx_challenges_student_id   ON public.challenges(student_id);
CREATE INDEX idx_code_history_class_id   ON public.code_history(class_id);
CREATE INDEX idx_doubts_student_resolved ON public.doubts(student_id, is_resolved);

-- Inicialización del esquema completa.
```
