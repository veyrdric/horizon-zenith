**Versión del Documento:** 1.0.0
**Estado:** Listo para Producción
**Audiencia:** Desarrollador Senior / Mantenedor Único
**Última Revisión:** 2026-06-28

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Caso de Uso 1: Onboarding Automatizado por Pasarela de Pago](#2-caso-de-uso-1-onboarding-automatizado-por-pasarela-de-pago)
3. [Caso de Uso 2: El Fichero de Código Interactivo por Clase](#3-caso-de-uso-2-el-fichero-de-código-interactivo-por-clase)
4. [Caso de Uso 3: Flujo de Desafíos Autoevaluados](#4-caso-de-uso-3-flujo-de-desafíos-autoevaluados)
5. [Consideraciones Transversales](#5-consideraciones-transversales)

---

## 1. Introducción

Este documento describe los tres casos de uso principales de la plataforma Horizon Zenith desde una perspectiva de nivel de sistema. Cada caso de uso está documentado con el siguiente formato estructurado:

- **Resumen:** Una descripción concisa del caso de uso y su valor para el negocio.
- **Actores:** Los roles que participan en el flujo.
- **Precondiciones:** El estado en que debe encontrarse el sistema antes de que el flujo pueda comenzar.
- **Flujo Principal:** La secuencia nominal de eventos y operaciones de datos del camino feliz.
- **Manejo de Excepciones:** Los modos de falla identificados y la respuesta del sistema ante cada uno.
- **Postcondiciones:** El estado garantizado del sistema tras una ejecución exitosa.

Estos casos de uso representan colectivamente el ciclo de vida completo del alumno dentro de la plataforma: desde el primer pago hasta el aprendizaje activo y la validación de habilidades.

---

## 2. Caso de Uso 1: Onboarding Automatizado por Pasarela de Pago

### Resumen

Un alumno potencial descubre Horizon Zenith a través de la landing page pública y adquiere una suscripción de mentoría vía Stripe. La plataforma aprovisiona automáticamente todos los recursos necesarios — credenciales de autenticación, un perfil de alumno y un repositorio de GitHub dedicado — sin requerir ninguna acción manual del mentor. El alumno puede iniciar sesión en un Hub completamente poblado en cuestión de minutos tras completar el pago.

**Valor para el negocio:** Elimina la carga administrativa del mentor por cada nuevo alumno. Habilita un modelo de ingreso pasivo donde los alumnos pueden incorporarse de forma asincrónica a cualquier hora, incluso mientras el mentor está dictando otras sesiones.

### Actores

| Actor | Rol |
|---|---|
| Alumno Potencial | Inicia el flujo de pago desde la landing page. |
| Stripe | Procesa el pago y despacha los eventos de webhook. |
| Supabase Edge Function (`/stripe-webhook`) | Orquesta el pipeline de aprovisionamiento al recibir un evento de Stripe verificado. |
| GitHub REST API | Crea el repositorio privado del alumno a partir de una plantilla designada. |
| Proveedor de Email (Resend / AWS SES) | Entrega el email de bienvenida con las credenciales de acceso. |
| Mentor (pasivo) | No requiere participación activa. Recibe una notificación de resumen. |

### Precondiciones

1. El producto de Stripe (plan de suscripción) está configurado y activo en el Dashboard de Stripe.
2. El endpoint del webhook de Stripe está registrado en `https://horizonzenith.com/api/webhooks/stripe` y el secreto de firma está almacenado en `STRIPE_WEBHOOK_SECRET`.
3. El repositorio plantilla de GitHub (`{GITHUB_ORG}/{GITHUB_TEMPLATE_REPO}`) existe y está marcado como plantilla.
4. La variable de entorno `GITHUB_TOKEN` en la Edge Function contiene un Personal Access Token con alcance `repo`.
5. El proyecto Supabase está activo con el esquema completo (documentado en `database_guide_pg.md`) inicializado.

### Flujo Principal

La siguiente secuencia describe la ruta de ejecución nominal cuando todas las precondiciones se cumplen y no ocurren fallas de servicios externos.

**Paso 1 — El alumno inicia la compra**

El alumno navega a la landing page pública y hace clic en el botón de llamada a la acción del plan de programa correspondiente. La aplicación Next.js llama a una Server Action (o ruta API) que crea una Sesión de Checkout de Stripe usando la `STRIPE_SECRET_KEY`. El alumno es redirigido a la página de Stripe Checkout alojada.

**Paso 2 — El pago es procesado**

El alumno completa el formulario de pago en la página alojada de Stripe. Stripe procesa la transacción y, ante un cargo exitoso, marca la Sesión de Checkout como `complete`.

**Paso 3 — El webhook es despachado**

Stripe envía una solicitud HTTPS `POST` a `/api/webhooks/stripe` que contiene un payload del evento `checkout.session.completed`. La solicitud incluye un header `Stripe-Signature` para la verificación HMAC-SHA256.

**Paso 4 — Verificación de la firma del webhook**

La Edge Function recibe el cuerpo de la solicitud sin procesar y valida la firma HMAC usando `stripe.webhooks.constructEvent(rawBody, firma, STRIPE_WEBHOOK_SECRET)`. Si la validación falla, la función retorna `HTTP 400` y termina. No se realizan escrituras en la base de datos. Stripe reintentará el webhook según su calendario estándar de reintentos.

**Paso 5 — Verificación de idempotencia**

La Edge Function consulta la tabla `profiles` en busca de una fila con el email extraído del evento de Stripe. Si ya existe un perfil (entrega duplicada del webhook o escenario de reintento), la función evalúa si ejecutar un flujo de reactivación (si `status = 'Pausado'`) o saltar la operación completamente (si `status = 'Activo'`). Retorna `HTTP 200` en cualquiera de los casos para prevenir futuros reintentos de Stripe.

**Paso 6 — Creación del usuario de autenticación**

La Edge Function usa `supabase.auth.admin.createUser({ email, password: contraseñaGenerada, email_confirm: true })` con la `SERVICE_ROLE_KEY` para crear el registro de autenticación del alumno. La contraseña generada es una cadena aleatoria criptográficamente segura (ej: usando `crypto.getRandomValues`). Será enviada al alumno en el email de bienvenida.

**Paso 7 — Inserción del perfil**

La Edge Function extrae los metadatos del programa del evento de Stripe (ID del producto, campos de metadatos configurados en el producto de Stripe) e inserta una nueva fila en `public.profiles` usando el UUID del usuario recién creado:

```sql
INSERT INTO public.profiles (id, name, role, status, program_type, objective)
VALUES ($1, $2, $3, 'Activo', $4, '');
```

**Paso 8 — Aprovisionamiento del repositorio de GitHub**

La Edge Function llama a la GitHub REST API para generar un nuevo repositorio privado a partir de la plantilla:

```
POST https://api.github.com/repos/{GITHUB_ORG}/{GITHUB_TEMPLATE_REPO}/generate
Authorization: token {GITHUB_TOKEN}
Content-Type: application/json

{
  "owner": "{GITHUB_ORG}",
  "name": "horizonzenith-{slug-nombre-alumno}",
  "private": true,
  "description": "Repositorio privado de mentoría — Horizon Zenith"
}
```

Ante una respuesta `201 Created`, la Edge Function actualiza el perfil del alumno con la URL del repositorio:

```sql
UPDATE public.profiles
SET github_repo = $1
WHERE id = $2;
```

**Paso 9 — Despacho del email de bienvenida**

La Edge Function llama a la API del proveedor de email configurado (Resend o AWS SES) para enviar un email de bienvenida estructurado que contiene:
- La dirección de email del alumno (identificador de inicio de sesión).
- La contraseña temporal generada, con instrucciones para cambiarla en el primer inicio de sesión.
- La URL directa a la página de login del Hub.
- Una breve guía de orientación para navegar la plataforma.

**Paso 10 — Respuesta a Stripe**

La Edge Function retorna `HTTP 200` a Stripe, señalizando el procesamiento exitoso. Si esta respuesta no se recibe dentro del tiempo de espera de Stripe, Stripe reintentará el webhook (ver manejo de excepciones a continuación).

**Paso 11 — El alumno inicia sesión**

El alumno recibe el email de bienvenida, navega al Hub e inicia sesión con las credenciales proporcionadas. La sesión autenticada es establecida por Supabase Auth. El alumno es redirigido a su panel completamente poblado, donde su perfil, los detalles del programa y cualquier registro de clase precargado son inmediatamente visibles.

### Manejo de Excepciones

| Punto de Falla | Condición de Error | Comportamiento del Sistema | Acción de Recuperación |
|---|---|---|---|
| Stripe Checkout | El alumno abandona el pago | No se dispara ningún webhook. No hay cambio de estado. | No se requiere ninguna. La sesión de la landing page expira naturalmente. |
| Entrega del webhook | Fallo de red antes de que la Edge Function reciba la solicitud | Stripe reintenta la entrega con retroceso exponencial hasta 72 horas. | Monitorear el log de eventos de webhooks del Dashboard de Stripe ante fallas persistentes. |
| Verificación de firma | Header `Stripe-Signature` inválido | La Edge Function retorna `HTTP 400`. No se realizan escrituras en BD. Stripe no reintenta respuestas `4xx` por defecto; revisar el Dashboard de Stripe. | Verificar que `STRIPE_WEBHOOK_SECRET` coincida con el secreto en el Dashboard de Stripe para este endpoint. |
| Creación del usuario Auth | El email ya existe en `auth.users` | La Edge Function detecta el duplicado y enruta al flujo de reactivación. | No se requiere ninguna acción; se maneja programáticamente. |
| GitHub API — límite de tasa | Respuesta `HTTP 429` | La Edge Function inserta una fila en una tabla `provisioning_queue` con `status = 'pending'`. Retorna `HTTP 200` a Stripe. Un cron de Supabase (pg_cron) reintenta las filas pendientes cada 5 minutos. | Monitorear `provisioning_queue` para filas atascadas en `'pending'` por más de 30 minutos. |
| GitHub API — plantilla no encontrada | Respuesta `HTTP 404` | La Edge Function establece `profiles.status = 'Pendiente Provision'`. Envía un email de alerta a la dirección de admin del mentor. Retorna `HTTP 200` a Stripe. | Verificar el nombre del repositorio plantilla y los permisos del `GITHUB_TOKEN`. Re-disparar el aprovisionamiento manualmente desde la consola de administración. |
| Fallo en la entrega del email | La API del proveedor retorna un error | El error se registra en una tabla `system_logs`. La creación de la cuenta del alumno no se ve afectada. | El mentor recibe notificación a través de la consola de administración. El mentor puede reenviar las credenciales manualmente desde el panel de admin. |
| Timeout de la Edge Function | La función excede el tiempo de espera del runtime Deno | La función termina. Si la respuesta a Stripe no fue enviada, Stripe reintenta. | La verificación de idempotencia del Paso 5 previene el aprovisionamiento duplicado en el reintento. |

### Postcondiciones

Tras la ejecución exitosa de este flujo, el sistema se encuentra en el siguiente estado garantizado:

- Existe un registro en `auth.users` para el email del alumno.
- Existe un registro correspondiente en `public.profiles` con `status = 'Activo'`.
- `profiles.github_repo` contiene la URL del repositorio privado aprovisionado.
- Se ha entregado un email de bienvenida a la bandeja de entrada del alumno.
- El alumno puede autenticarse en el Hub y acceder a su panel.
- El mentor no ha necesitado realizar ninguna acción manual.

---

## 3. Caso de Uso 2: El Fichero de Código Interactivo por Clase

### Resumen

Un alumno ha completado una sesión práctica y compleja con el mentor. Días o semanas después, el alumno necesita consultar el código escrito durante esa sesión mientras trabaja en una funcionalidad relacionada. El alumno navega al registro de la clase específica en su Hub y usa el explorador de archivos de código integrado para navegar artefactos de código anotados, leer las explicaciones contextuales del mentor y copiar fragmentos de código directamente a su editor — sin tener que rebobinar la grabación de video ni buscar entre archivos adjuntos desorganizados.

**Valor para el negocio:** Aborda directamente el problema de deterioro del conocimiento inherente a la educación de software asincrónica. Transforma las grabaciones de sesiones de contenido pasivo indexado por tiempo en una biblioteca de referencia de código activa y navegable. Reduce el volumen de consultas repetitivas de los alumnos que de otro modo requerirían tiempo del mentor para ser respondidas.

### Actores

| Actor | Rol |
|---|---|
| Alumno | Navega el Hub para localizar y explorar los artefactos de código de la clase. |
| Mentor | Ha cargado previamente los artefactos de código en `code_history` vía la consola de administración, durante o después de la sesión. |
| Supabase (PostgREST) | Sirve los registros de artefactos de código en respuesta a las consultas autenticadas. |

### Precondiciones

1. El alumno está autenticado y tiene una sesión activa en el Hub.
2. Existe al menos un registro de clase en `public.classes` asociado al `id` del alumno.
3. El registro de clase padre tiene al menos una fila asociada en `public.code_history`.
4. La política RLS del alumno permite el acceso `SELECT` a las filas relevantes de `code_history` a través de la verificación de propiedad de la clase.

### Flujo Principal

**Paso 1 — El alumno navega a la sección de Clases**

El alumno hace clic en el ítem "Clases" en la navegación del Hub. La página Next.js en `/clases` se renderiza como un React Server Component, ejecutando la siguiente consulta en el servidor:

```sql
SELECT id, class_number, title, date, duration
FROM public.classes
WHERE student_id = auth.uid()
ORDER BY class_number ASC;
```

La lista de clases resultante se renderiza como un conjunto de tarjetas navegables.

**Paso 2 — El alumno selecciona una clase**

El alumno hace clic en una tarjeta de clase específica (ej: "Clase #3 — Autenticación JWT"). Next.js navega a `/clases/[classId]`. El React Server Component de la página ejecuta dos consultas en paralelo:

Consulta A — Metadatos de la clase:
```sql
SELECT id, class_number, title, date, duration, description, video_url
FROM public.classes
WHERE id = $1 AND student_id = auth.uid();
```

Consulta B — Artefactos de código para esta clase:
```sql
SELECT id, file_name, description, code_content
FROM public.code_history
WHERE class_id = $1
ORDER BY id ASC;
```

Ambas consultas se ejecutan del lado del servidor. Los resultados se serializan en el payload HTML inicial de la página.

**Paso 3 — La página de detalle de la clase se renderiza**

La página se renderiza con tres secciones principales:
- El encabezado de la sesión (título, fecha, duración, descripción).
- El reproductor de video incrustado (iframe de Vimeo/Mux usando `video_url`).
- El componente explorador de archivos de código debajo del video.

**Paso 4 — Interacción con el explorador de archivos de código**

El explorador de archivos de código es un Client Component (`'use client'`) renderizado debajo del contenido provisto por el servidor. Recibe los datos de artefactos de código como props desde el Server Component padre. El alumno puede:

- Hacer clic en cualquier pestaña de nombre de archivo para cambiar la vista de código activa.
- Leer el campo `description` renderizado como un bloque de anotación resaltado sobre el código.
- Ver el código con resaltado de sintaxis renderizado vía Shiki o Prism, con el lenguaje inferido de la extensión del `file_name` (ej: `.ts` → TypeScript, `.prisma` → Prisma Schema).
- Hacer clic en un botón "Copiar al portapapeles" para copiar el `code_content` al portapapeles del sistema.

**Paso 5 — Sin solicitudes adicionales al servidor tras la carga inicial**

Dado que todos los artefactos de código fueron cargados del lado del servidor en el Paso 2 y pasados como props, el cambio de pestañas dentro del explorador de archivos no requiere solicitudes de red adicionales. El archivo de código completo de la sesión está disponible inmediatamente y es tolerante a desconexiones una vez cargada la página.

### Manejo de Excepciones

| Punto de Falla | Condición de Error | Comportamiento del Sistema |
|---|---|---|
| Clase no encontrada | El `classId` no existe o no pertenece a este alumno | El Server Component recibe un conjunto de resultados vacío. La página renderiza un estado de error "Clase no encontrada" con un enlace de regreso al listado de clases. No hay fuga de datos porque RLS hace cumplir la propiedad a nivel de base de datos. |
| Sin artefactos de código | La consulta a `code_history` retorna un array vacío | El explorador de archivos renderiza un estado vacío informativo: "El mentor aún no ha cargado el fichero de código para esta clase." El video y los metadatos de la sesión siguen renderizándose normalmente. |
| URL de video no disponible | `video_url` es null o retorna un error de incrustación | La sección del reproductor de video renderiza un placeholder con el mensaje "Grabación no disponible aún." El archivo de código sigue siendo totalmente accesible. |
| API del portapapeles no disponible | El contexto del navegador no soporta `navigator.clipboard` (ej: HTTP sin SSL en desarrollo) | El botón "Copiar" muestra un fallback: el bloque de código se vuelve seleccionable para copia manual. Un pequeño tooltip indica "Selecciona el código manualmente." |

### Postcondiciones

- El alumno ha accedido exitosamente al archivo de código anotado de la sesión seleccionada.
- No se han producido cambios de estado en la base de datos (este es un flujo de solo lectura).
- El portapapeles local del alumno puede contener un fragmento de código copiado.

---

## 4. Caso de Uso 3: Flujo de Desafíos Autoevaluados

### Resumen

El mentor asigna un desafío técnico a un alumno. El alumno trabaja en el desafío de forma independiente en su repositorio de GitHub, actualizando su estado dentro del Hub a medida que avanza. Al completar, el alumno marca el desafío como listo para revisión. El mentor es notificado vía el sistema en tiempo real, revisa la rama de GitHub del alumno, graba un breve video de feedback si es necesario, actualiza el estado del desafío a aprobado, y la barra de progreso del alumno se actualiza al instante mediante un push por WebSocket — todo sin que ninguna de las dos partes necesite enviar un mensaje o coordinar una reunión sincrónica.

**Valor para el negocio:** Formaliza el ciclo de evaluación en un flujo de trabajo rastreable con registro de auditoría. Elimina la carga comunicacional informal. Proporciona tanto al alumno como al mentor una vista clara y compartida del progreso a través de todos los desafíos activos.

### Actores

| Actor | Rol |
|---|---|
| Alumno | Trabaja en el desafío y gestiona sus propias transiciones de estado. |
| Mentor | Revisa el trabajo entregado y registra el estado final de aprobación. |
| Supabase (PostgREST + Realtime) | Persiste las transiciones de estado y emite los cambios a todos los clientes suscritos. |

### Precondiciones

1. El mentor ha insertado un registro de desafío en `public.challenges` con `status = 'Pendiente'` para el `id` del alumno vía la consola de administración.
2. El alumno está autenticado en el Hub y tiene una suscripción WebSocket de Supabase Realtime activa sobre sus filas de `challenges`.
3. La consola de administración del mentor también está conectada y suscrita a los eventos de Realtime en la tabla `challenges`, filtrados por el conjunto de alumnos que gestiona.

### Flujo Principal

**Paso 1 — El alumno visualiza los desafíos asignados**

El alumno navega a la sección "Desafíos". El Server Component de la página obtiene todos los desafíos del alumno autenticado:

```sql
SELECT id, title, description, status, updated_at
FROM public.challenges
WHERE student_id = auth.uid()
ORDER BY updated_at DESC;
```

Los desafíos se renderizan como tarjetas estructuradas con badges de estado con código de colores.

**Paso 2 — El alumno comienza a trabajar**

El alumno lee la descripción del desafío y comienza a programar en una rama de su repositorio privado de GitHub (`git checkout -b desafio/nombre-del-desafio`). En el Hub, el alumno hace clic en "Comenzar Desafío", lo que dispara una solicitud `PATCH` desde el cliente para actualizar el estado del desafío:

```json
PATCH /rest/v1/challenges?id=eq.{challengeId}
{
  "status": "En Progreso"
}
```

La API PostgREST de Supabase aplica la actualización. El `challenges_updated_at_trigger` se dispara automáticamente, actualizando la marca de tiempo `updated_at`. El motor de Realtime emite el cambio.

**Paso 3 — El alumno completa el trabajo y lo envía para revisión**

Tras completar la implementación, el alumno sube su rama a GitHub:

```
git add .
git commit -m "feat: implementar desafio de autenticacion JWT"
git push origin desafio/autenticacion-jwt
```

En el Hub, el alumno hace clic en "Enviar para Corrección." El cliente envía:

```json
PATCH /rest/v1/challenges?id=eq.{challengeId}
{
  "status": "Listo para Correccion"
}
```

Esta transición de estado es el evento de disparo crítico en el sistema de feedback.

**Paso 4 — Notificación en tiempo real al mentor**

El motor de Realtime de Supabase emite el evento `UPDATE` en la tabla `challenges`. La consola de administración del mentor, que mantiene una suscripción WebSocket activa, recibe la notificación push de inmediato. La tarjeta del desafío en la cola del mentor se actualiza para mostrar el badge "Listo para Corrección" y sube al tope de la cola de revisión.

**Paso 5 — El mentor revisa la entrega**

El mentor navega al enlace del repositorio de GitHub del alumno (almacenado en `profiles.github_repo`) y revisa la rama enviada. El mentor evalúa la calidad del código, las decisiones arquitectónicas y el cumplimiento de la especificación del desafío.

**Paso 6 — El mentor graba el feedback (opcional)**

Si la implementación contiene errores o áreas de mejora que requieren explicación, el mentor graba un breve video de captura de pantalla (Loom, o una carga a Vimeo) demostrando la corrección. La URL del video puede almacenarse en una columna adicional `feedback_video_url` si se agrega al esquema.

**Paso 7 — El mentor aprueba el desafío**

Desde la consola de administración, el mentor actualiza el estado del desafío a su estado terminal:

```json
PATCH /rest/v1/challenges?id=eq.{challengeId}
{
  "status": "Aprobado"
}
```

Esta operación utiliza la `SERVICE_ROLE_KEY` para omitir las políticas RLS, ya que el mentor está actualizando una fila que no pertenece a su propio ID de usuario.

**Paso 8 — El alumno recibe la actualización en tiempo real**

El motor de Realtime de Supabase emite el evento `UPDATE` a todos los clientes suscritos, incluyendo el Hub del alumno. El badge de estado de la tarjeta del desafío del alumno transiciona instantáneamente a "Aprobado" sin recargar la página. La barra de progreso general en la parte superior del panel recalcula su porcentaje de completitud del lado del cliente basado en los datos de desafíos actualizados.

### Cálculo de la Barra de Progreso

El porcentaje de progreso se deriva del lado del cliente a partir de los datos de desafíos ya cargados en el estado del componente:

```typescript
const totalDesafios = challenges.length;
const desafiosAprobados = challenges.filter(c => c.status === 'Aprobado').length;
const porcentajeProgreso = totalDesafios > 0
  ? Math.round((desafiosAprobados / totalDesafios) * 100)
  : 0;
```

Dado que este cálculo se deriva puramente del flujo de datos de Realtime al que ya está suscrito, se actualiza sincrónicamente en el momento en que se procesa el evento de Realtime — sin solicitudes de red adicionales.

### Manejo de Excepciones

| Punto de Falla | Condición de Error | Comportamiento del Sistema |
|---|---|---|
| WebSocket de Realtime se desconecta | La interrupción de red rompe la conexión WebSocket | El SDK de Supabase Realtime intenta reconectarse automáticamente con retroceso exponencial. Un indicador de conexión sutil en la UI señala el estado desconectado. Al reconectarse, el cliente vuelve a obtener el estado actual de los desafíos para reconciliar cualquier actualización perdida. |
| Transición de estado inválida | El cliente intenta enviar un valor de estado que no está en la restricción `CHECK` | Supabase PostgREST retorna `HTTP 400` con un error de violación de restricción. La UI muestra un mensaje de error tipo toast y revierte la actualización optimista de la UI. |
| El alumno intenta actualizar el desafío de otro alumno | Solicitud maliciosa o errónea del cliente apuntando a un ID de desafío ajeno | La política RLS `"alumno_gestiona_propios_desafios"` bloquea la operación. Supabase PostgREST retorna un conjunto de resultados vacío (sin filas afectadas), lo que equivale a una denegación silenciosa. La UI no muestra ningún cambio de estado. |
| El mentor olvida aprobar | El desafío permanece en "Listo para Corrección" por un período prolongado | Un cron de Supabase (pg_cron) se ejecuta nocturnamente, consultando los desafíos en estado "Listo para Corrección" con más de 48 horas de antigüedad, y envía un email recordatorio a la dirección de administración del mentor. |
| Repositorio de GitHub no disponible | El enlace al repositorio del alumno es inaccesible (eliminado, hecho público, etc.) | Este es un evento fuera de banda. El Hub en sí no se ve afectado. El mentor es responsable de verificar la integridad del repositorio vía la API de GitHub o la consola de administración. |

### Postcondiciones

- El registro del desafío en `public.challenges` tiene `status = 'Aprobado'` y una marca de tiempo `updated_at` actualizada.
- Tanto el Hub del alumno como la consola del mentor reflejan el estado terminal sin requerir una recarga de página.
- El porcentaje de la barra de progreso del alumno ha aumentado para reflejar el desafío recién aprobado.
- El mentor no ha necesitado iniciar ninguna comunicación sincrónica con el alumno.

---

## 5. Consideraciones Transversales

### Frontera de Autenticación

Los tres casos de uso asumen una sesión autenticada gestionada por Supabase Auth. La frontera de autenticación se hace cumplir en dos capas independientes:

1. **Capa de middleware (Next.js):** Los layouts de los grupos de rutas `(hub)` y `(admin)` validan la sesión del lado del servidor usando `supabase.auth.getUser()`. Las solicitudes no autenticadas son redirigidas a `/login` antes de que ocurra cualquier obtención de datos.
2. **Capa de base de datos (RLS):** Todas las consultas PostgREST se ejecutan en el contexto del JWT del usuario autenticado. Las políticas RLS rechazan cualquier consulta que retornaría datos fuera del alcance autorizado del usuario, independientemente de cómo se construyó la solicitud.

Esta aplicación de doble capa significa que una falla de validación de sesión en el nivel de middleware no puede exponer datos, porque la capa de base de datos hace cumplir la misma restricción de forma independiente.

### Actualizaciones Optimistas de la UI

Los Casos de Uso 2 y 3 implican actualizaciones de estado del lado del cliente. El patrón recomendado para las transiciones de estado en el flujo de desafíos es la **actualización optimista de UI**: el cliente actualiza el estado mostrado inmediatamente tras la acción del usuario, antes de que el servidor confirme la escritura. Si el servidor retorna un error, la UI revierte al estado anterior y muestra un toast de error. Este patrón garantiza que la interfaz se sienta responsive incluso bajo condiciones de mayor latencia.

### Registro de Auditoría

Para despliegues en producción más allá de la fase MVP, todas las transiciones de estado en `challenges.status` deberían capturarse en una tabla `audit_log` de solo inserción:

```sql
CREATE TABLE public.audit_log (
  id          SERIAL      NOT NULL,
  table_name  TEXT        NOT NULL,
  record_id   INT         NOT NULL,
  field_name  TEXT        NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  changed_by  UUID        REFERENCES auth.users(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);
```

Un trigger `BEFORE UPDATE` en `public.challenges` puede poblar esta tabla automáticamente, proveyendo un historial completo de cada transición de estado para la resolución de disputas y el análisis de progreso.
