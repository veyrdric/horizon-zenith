# Arquitectura y Diseño de Sistema

**Versión del Documento:** 1.0.0
**Estado:** Listo para Producción
**Audiencia:** Desarrollador Senior / Mantenedor Único
**Última Revisión:** 2026-06-28

---

## Tabla de Contenidos

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Filosofía Arquitectónica](#2-filosofía-arquitectónica)
3. [Stack Tecnológico — Justificación Técnica](#3-stack-tecnológico--justificación-técnica)
4. [Mapa de Integración de Servicios](#4-mapa-de-integración-de-servicios)
5. [Flujo de Datos Asincrónico: Sistema Central](#5-flujo-de-datos-asincrónico-sistema-central)
6. [Flujo A: Onboarding Automatizado por Pasarela de Pago](#6-flujo-a-onboarding-automatizado-por-pasarela-de-pago)
7. [Flujo B: Sistema de Feedback y Propagación de Estado en Tiempo Real](#7-flujo-b-sistema-de-feedback-y-propagación-de-estado-en-tiempo-real)
8. [Arquitectura Frontend — Next.js App Router](#8-arquitectura-frontend--nextjs-app-router)
9. [Modelo de Seguridad: Row-Level Security (RLS)](#9-modelo-de-seguridad-row-level-security-rls)
10. [Arquitectura de Entrega de Video](#10-arquitectura-de-entrega-de-video)
11. [Consideraciones de Escalabilidad](#11-consideraciones-de-escalabilidad)

---

## 1. Visión General del Sistema

Horizon Zenith es un Student Hub premium de mentoría, diseñado para operar como una **infraestructura educativa de intervención cero**. Su mandato de diseño principal es eliminar toda la carga administrativa asociada al alta de nuevos alumnos, el seguimiento del progreso de aprendizaje y la gestión de la comunicación asincrónica — sustituyendo los flujos de trabajo manuales por pipelines automatizados impulsados por eventos.

La plataforma opera como un **sistema serverless-first orientado a eventos**, estructurado alrededor de tres dominios principales:

- **Dominio de Identidad y Autorización:** Gestionado por Supabase Auth y extendido con una tabla `profiles` que persiste metadatos específicos del negocio más allá de los primitivos de OAuth.
- **Dominio de Contenido y Aprendizaje:** Impulsado por Supabase PostgreSQL, exponiendo grabaciones de sesiones (vía Vimeo/Mux), archivos de código interactivos (`code_history`) y sistemas de gestión de desafíos.
- **Dominio de Comercio y Aprovisionamiento:** Impulsado por webhooks de Stripe procesados a través de Supabase Edge Functions, que orquestan el aprovisionamiento de repositorios de GitHub y la creación automatizada de cuentas de alumnos.

---

## 2. Filosofía Arquitectónica

El sistema está diseñado bajo tres restricciones no negociables que gobiernan cada decisión arquitectónica:

**Restricción 1 — Mantenibilidad por un Solo Desarrollador.** Cada componente debe ser operable, depurable y desplegable por un único desarrollador sin conocimientos de DevOps. Esto excluye la infraestructura autogestionada (VMs, clústeres Kubernetes propios) en favor de soluciones PaaS completamente administradas.

**Restricción 2 — Costo Activo Cero en MVP.** La arquitectura del MVP debe operar dentro de los niveles gratuitos de Vercel, Supabase y GitHub sin degradar la experiencia de usuario. El costo escala proporcionalmente con los ingresos (Stripe, Vimeo/Mux son de pago por uso).

**Restricción 3 — Escalabilidad Progresiva.** Las decisiones arquitectónicas deben permitir el escalado horizontal mediante configuración (agregar réplicas de lectura en Supabase, actualizar planes de Vercel, cambiar de proveedor de video) sin requerir reescrituras de código.

---

## 3. Stack Tecnológico — Justificación Técnica

### Frontend

| Tecnología              | Rol                           | Justificación Arquitectónica                                                                                                                                                                                                                                                             |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js 15 (App Router) | Framework de aplicación       | Los React Server Components (RSC) permiten obtener datos sensibles en el servidor, sin exponer nunca claves de API ni SQL crudo al cliente. Los Client Components se usan exclusivamente para islas interactivas (pestañas del explorador de archivos, badges de estado en tiempo real). |
| Tailwind CSS            | Capa de utilidades de estilos | Permite implementar rápidamente el lenguaje visual geométrico y asimétrico inspirado en Arknights: Endfield sin introducir dependencias de preprocesadores CSS personalizados.                                                                                                           |
| Radix UI / shadcn-ui    | Primitivas de UI accesibles   | Las primitivas de componentes headless (Dialog, Tabs, Tooltip) proporcionan cumplimiento de WCAG 2.1 AA sin sacrificar el control total del estilo.                                                                                                                                      |

### Backend y Datos

| Tecnología | Rol | Justificación Arquitectónica |
|---|---|---|
| Supabase (PostgreSQL 15) | Almacén de datos principal | Provee seguridad a nivel de fila (RLS), suscripciones WebSocket en tiempo real, autenticación integrada y una API PostgREST accesible por HTTP — reemplazando completamente la necesidad de un servidor Express/Fastify dedicado. |
| Supabase Edge Functions | Capa de cómputo serverless | Las funciones basadas en Deno procesan webhooks de Stripe, orquestan llamadas a la API de GitHub y envían correos transaccionales — todo dentro de la propia infraestructura de Supabase, eliminando las preocupaciones de latencia por arranque en frío para tareas de corta duración. |

### Servicios Externos

| Servicio | Rol | Punto de Integración |
|---|---|---|
| GitHub REST API | Aprovisionamiento de repositorios | La Edge Function llama a `POST /repos/{template_owner}/{template_repo}/generate` tras confirmar el pago. |
| Stripe | Procesamiento de pagos y gestión del ciclo de vida | Los webhooks disparan Edge Functions en los eventos `checkout.session.completed`, `customer.subscription.updated` y `customer.subscription.deleted`. |
| Vimeo / Mux | Hosting protegido de video | Las URLs de video se almacenan en `classes.video_url`; la restricción de dominio se configura a nivel del proveedor para prevenir incrustaciones no autorizadas o descargas directas. |

---

## 4. Mapa de Integración de Servicios

El siguiente diagrama representa los límites lógicos entre servicios y la direccionalidad del intercambio de datos dentro del sistema.

```
+----------------------------------------------------------------------+
|                        INTERNET PÚBLICO                              |
|                                                                      |
|  +------------------+         +----------------------------------+   |
|  |   NAVEGADOR      |  HTTPS  |      VERCEL EDGE NETWORK         |   |
|  |   DEL ALUMNO     |<------->|  Aplicación Next.js (SSR/RSC)    |   |
|  +------------------+         +-----------------+----------------+   |
|                                                 |                    |
+---------------------------------------------------\------------------+
                                                    |
             +--------------------------------------+------------------+
             |      INFRAESTRUCTURA SUPABASE         |                  |
             |                                      |                  |
             |  +-----------------------------------v--------------+   |
             |  |              SUPABASE AUTH                       |   |
             |  |   Emisión de JWT . Validación de sesión . OAuth  |   |
             |  +----------------------+---------------------------+   |
             |                         |                              |
             |  +----------------------v---------------------------+   |
             |  |        POSTGRESQL 15 (Almacén Principal)         |   |
             |  |  profiles . classes . challenges . code_history  |   |
             |  |  doubts . Políticas RLS . Motor Realtime         |   |
             |  +----------------------+---------------------------+   |
             |                         |                              |
             |  +----------------------v---------------------------+   |
             |  |       EDGE FUNCTIONS (Runtime Deno)              |   |
             |  |  /stripe-webhook . /github-provision . /mailer   |   |
             |  +-----------+-----------------------+--------------+   |
             |              |                       |                  |
             +--------------\-----------------------\------------------+
                            |                       |
             +--------------v-----------+  +--------v---------------+
             |      STRIPE API          |  |    GITHUB REST API      |
             |  Suscripciones . Factura |  |  Aprovisionamiento      |
             |  Webhooks -> Edge Fn     |  |  Clonado de plantilla   |
             +--------------------------+  +------------------------+

             +-----------------------------------------------------+
             |              VIMEO / MUX CDN                        |
             |  Entrega de video restringida por dominio . HLS     |
             |  URLs referenciadas por classes.video_url           |
             +-----------------------------------------------------+
```

---

## 5. Flujo de Datos Asincrónico: Sistema Central

La ruta de lectura estándar para un alumno autenticado sigue una secuencia estrictamente por capas para garantizar seguridad y rendimiento.

```
CICLO DE VIDA DE UNA SOLICITUD AUTENTICADA

  Navegador           Vercel Edge            Supabase (PostgREST + Auth)
  ---------           -----------            ---------------------------
     |                      |                              |
     |  GET /dashboard       |                              |
     |--------------------->|                              |
     |                      | RSC: fetch() con JWT         |
     |                      |----------------------------->|
     |                      |                              | [RLS: valida JWT]
     |                      |                              | [Filtra por auth.uid()]
     |                      |      JSON Serializado        |
     |                      |<-----------------------------|
     |   HTML Hidratado     |                              |
     |<---------------------|                              |
     |                      |                              |
     |  [Client Component]  |                              |
     |  Suscribe Realtime   |                              |
     |-------------------------------------------------------> Canal WS
     |                      |                              |
     |<------------------------------------------------------- Push al cambiar DB
```

**Decisión de diseño clave:** La obtención de datos para la carga inicial de página ocurre siempre dentro de React Server Components en el Edge de Vercel. La `SUPABASE_SERVICE_ROLE_KEY` (o el JWT del usuario) nunca atraviesa el bundle del cliente. Los Client Components únicamente se suscriben a los canales WebSocket de Supabase Realtime para recibir actualizaciones delta — nunca para realizar la búsqueda inicial.

---

## 6. Flujo A: Onboarding Automatizado por Pasarela de Pago

Este flujo es la automatización más crítica del sistema. Una ejecución exitosa convierte a un cliente pagador en un alumno completamente aprovisionado sin ninguna intervención manual del mentor.

```
FLUJO DE ONBOARDING AUTOMATIZADO

Alumno        Landing Page     Stripe         Edge Function       GitHub API     Servicio Email
------        ------------     ------         -------------       ----------     --------------
   |               |              |                  |                 |                |
   | Hace clic en  |              |                  |                 |                |
   | "Comprar"     |              |                  |                 |                |
   |-------------->|              |                  |                 |                |
   |               | Redirige a   |                  |                 |                |
   |               | Stripe Check.|                  |                 |                |
   |               |------------->|                  |                 |                |
   | Interfaz de   |              |                  |                 |                |
   | pago          |              |                  |                 |                |
   |<------------- |              |                  |                 |                |
   |               |              |                  |                 |                |
   | [Completa el pago]           |                  |                 |                |
   |------------------------------>                  |                 |                |
   |               |              |                  |                 |                |
   |               |              | checkout.session |                 |                |
   |               |              | .completed       |                 |                |
   |               |              | (Webhook POST)   |                 |                |
   |               |              |----------------->|                 |                |
   |               |              |                  | 1. Verifica     |                |
   |               |              |                  |    firma Stripe |                |
   |               |              |                  |    (HMAC-SHA256)|                |
   |               |              |                  |                 |                |
   |               |              |                  | 2. Crea usuario |                |
   |               |              |                  |    Auth via     |                |
   |               |              |                  |    admin API    |                |
   |               |              |                  |                 |                |
   |               |              |                  | 3. INSERT INTO  |                |
   |               |              |                  |    profiles (...)|               |
   |               |              |                  |                 |                |
   |               |              |                  | 4. POST /repos  |                |
   |               |              |                  |    /{plantilla} |                |
   |               |              |                  |    /generate    |                |
   |               |              |                  |---------------->|                |
   |               |              |                  |                 | Aprovisiona    |
   |               |              |                  |<----------------|  repo (201)    |
   |               |              |                  |                 |                |
   |               |              |                  | 5. UPDATE       |                |
   |               |              |                  |    profiles SET |                |
   |               |              |                  |    github_repo  |                |
   |               |              |                  |                 |                |
   |               |              |                  | 6. Envía email  |                |
   |               |              |                  |    de bienvenida|                |
   |               |              |                  |---------------------------------------->|
   |               |              |   HTTP 200 OK    |                 |                |
   |               |              |<-----------------|                 |                |
   |               |              |                  |                 |                |
   | [Recibe email de bienvenida] |                  |                 |                |
   | [Inicia sesión — cuenta lista]                  |                 |                |
```

### Onboarding — Estados de Error Críticos

| Punto de Falla | Condición de Error | Estrategia de Recuperación |
|---|---|---|
| Webhook de Stripe | Firma HMAC inválida | La Edge Function retorna HTTP 400. Stripe reintenta hasta 72 horas. No se realizan escrituras en la BD. |
| Creación de usuario Auth | El email ya existe en `auth.users` | La Edge Function detecta el duplicado y ejecuta el flujo de reactivación en lugar del de creación. |
| GitHub API | Límite de tasa excedido (HTTP 429) | La Edge Function encola un reintento en una tabla `provisioning_queue`. Un cron de Supabase reintenta las filas pendientes cada 5 minutos. |
| GitHub API | Repositorio plantilla no encontrado (HTTP 404) | La Edge Function establece `profiles.status = 'Pendiente Provision'`. Envía una alerta al email de administrador del mentor. |
| Entrega de email | Fallo del proveedor SMTP | No bloquea el flujo; el error se registra en la tabla `system_logs`. La cuenta del alumno se crea igualmente. El mentor recibe notificación en el panel de administración. |

---

## 7. Flujo B: Sistema de Feedback y Propagación de Estado en Tiempo Real

El ciclo de feedback es el mecanismo pedagógico central de la plataforma. Reemplaza las cadenas de correos electrónicos asincrónicos por una máquina de estados estructurada y dirigida por la base de datos.

```
FLUJO DE FEEDBACK DE DESAFÍOS (Máquina de Estados en Tiempo Real)

  Hub del Alumno (Navegador)   Supabase DB       Consola del Mentor (Navegador)
  --------------------------   -----------       -----------------------------
          |                        |                          |
          | [Entrega trabajo en    |                          |
          |  rama de GitHub]       |                          |
          |                        |                          |
          | PATCH /challenges      |                          |
          | {status: "Listo        |                          |
          |  para Correccion"}     |                          |
          |----------------------->|                          |
          |                        | UPDATE en DB dispara     |
          |                        | broadcast Realtime       |
          |                        |------------------------->|
          |                        |                          | [Recibe notificación push]
          |                        |                          | [Mentor revisa rama GitHub]
          |                        |                          |
          |                        |                          | PATCH /challenges
          |                        |                          | {status: "Aprobado"}
          |                        |<-------------------------|
          |                        |                          |
          |                        | UPDATE en DB dispara     |
          |<-----------------------| broadcast Realtime       |
          |                        |                          |
          | [Barra de progreso     |                          |
          |  se actualiza al       |                          |
          |  instante]             |                          |
          | [Badge: "Aprobado"]    |                          |
```

### Máquina de Estados del Desafío

La columna `challenges.status` hace cumplir una máquina de estados válida mediante una restricción `CHECK`. Solo se permiten las siguientes transiciones desde la capa de aplicación:

```
  +---------------------+
  |      Pendiente      |   (Estado inicial — asignado por el mentor)
  +---------+-----------+
            |
            | El alumno comienza a trabajar
            v
  +---------------------+
  |     En Progreso     |   (El alumno se actualiza a sí mismo en el Hub)
  +---------+-----------+
            |
            | El alumno marca su trabajo como completado
            v
  +-----------------------------+
  |  Listo para Correccion      |   (Dispara notificación al mentor vía Realtime)
  +------------+----------------+
               |
               | El mentor revisa y aprueba
               v
  +---------------------+
  |       Aprobado      |   (Estado terminal — actualiza la barra de progreso)
  +---------------------+
```

---

## 8. Arquitectura Frontend — Next.js App Router

La estructura de rutas impone una separación estricta entre las páginas públicas de marketing y el shell autenticado de la aplicación.

```
app/
|-- (marketing)/
|   |-- page.tsx              -> Landing page (pública, generada estáticamente)
|   +-- layout.tsx            -> Shell de marketing (sin verificación de auth)
|
|-- (hub)/
|   |-- layout.tsx            -> Guardia de auth: redirige a /login sin sesión
|   |-- dashboard/
|   |   +-- page.tsx          -> Resumen del alumno (RSC: obtiene perfil + stats)
|   |-- clases/
|   |   |-- page.tsx          -> Listado de clases (RSC)
|   |   +-- [classId]/
|   |       +-- page.tsx      -> Detalle de clase + explorador de código (RSC + tabs cliente)
|   |-- desafios/
|   |   +-- page.tsx          -> Tablero de desafíos (RSC + suscripción Realtime cliente)
|   +-- consultas/
|       +-- page.tsx          -> Buzón de consultas (RSC + actualizaciones UI optimistas)
|
|-- (admin)/
|   |-- layout.tsx            -> Guardia de rol: requiere profiles.role = 'mentor'
|   +-- consola/
|       +-- page.tsx          -> Consola del mentor (gestión completa de alumnos)
|
+-- api/
    +-- webhooks/
        +-- stripe/
            +-- route.ts      -> Manejador de webhook de Stripe (requiere body sin parsear)
```

**Estrategia de Renderizado de Componentes:**

Todos los componentes que obtienen datos son React Server Components por defecto. La directiva `'use client'` se aplica únicamente a los componentes que requieren `useState`, `useEffect`, suscripciones a Supabase Realtime o APIs específicas del navegador. Las variables de entorno sensibles como `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY` son accesibles exclusivamente dentro de los Server Components y los manejadores de rutas API — son estructuralmente inaccesibles desde el bundle del cliente.

---

## 9. Modelo de Seguridad: Row-Level Security (RLS)

Todas las tablas del esquema de Supabase tienen RLS habilitado por defecto. Ninguna consulta del lado del cliente puede acceder a datos fuera del ámbito del usuario autenticado.

**Políticas RLS Principales:**

```sql
-- profiles: los alumnos solo pueden leer y actualizar su propio registro
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumno_accede_propio_perfil"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- classes: los alumnos solo pueden leer las clases asignadas a ellos
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumno_lee_propias_clases"
  ON classes FOR SELECT
  USING (auth.uid() = student_id);

-- challenges: los alumnos pueden leer y actualizar el estado de sus propios desafíos
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumno_gestiona_propios_desafios"
  ON challenges FOR ALL
  USING (auth.uid() = student_id);

-- code_history: solo lectura, validada a través de la propiedad de la clase padre
ALTER TABLE code_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumno_lee_codigo_via_propiedad_clase"
  ON code_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = code_history.class_id
        AND classes.student_id = auth.uid()
    )
  );
```

La consola de administración del mentor se comunica con Supabase exclusivamente usando la `SERVICE_ROLE_KEY`, que omite las políticas RLS. Esta clave nunca se expone al cliente bajo ninguna circunstancia y debe usarse únicamente en contextos del lado del servidor.

---

## 10. Arquitectura de Entrega de Video

Las grabaciones de clases se almacenan y transmiten a través de Vimeo (proveedor principal) o Mux (para flujos de trabajo de carga programática).

**Restricción de dominio:** Todos los recursos de video están configurados a nivel del proveedor para permitir la incrustación exclusivamente desde `horizonzenith.com` (y `localhost` durante el desarrollo). Esto previene:
- Que la URL compartida directamente reproduzca el video fuera de la plataforma.
- Los intentos de descarga programática dirigidos a URLs de iframe no listadas.

**Modelo de almacenamiento de URL:** La columna `classes.video_url` almacena la URL final incrustable vía iframe. La aplicación nunca almacena URLs brutas de CDN ni tokens firmados en la base de datos. Las URLs firmadas de Mux, cuando son necesarias, se generan por solicitud dentro de un Server Component y nunca se persisten.

---

## 11. Consideraciones de Escalabilidad

Los siguientes puntos de pivote arquitectónico están preplaneados para acomodar el crecimiento sin requerir reescrituras fundamentales:

| Estado Actual (MVP) | Alternativa Escalada | Condición Recomendada |
|---|---|---|
| Supabase Nivel Gratuito | Supabase Pro ($25/mes) | Más de 500 usuarios activos mensuales o más de 500 MB de base de datos |
| Vimeo Básico | Vimeo Advanced o Mux | Más de 50 videos o más de 5 TB de ancho de banda mensual |
| Edge Functions para toda la lógica | Rutas API dedicadas de Next.js en Vercel | Transacciones complejas de múltiples pasos que requieren estado persistente |
| Rol de mentor único | RBAC multi-mentor vía `profiles.role` | Expansión de la plataforma a múltiples educadores |
| Stripe Checkout (página alojada) | Stripe Elements (UI incrustada) | Requisitos de UX personalizados para el proceso de pago |
| Proyecto Supabase único | Branching de Supabase (separación staging/prod) | Primer cliente pagador en producción |
