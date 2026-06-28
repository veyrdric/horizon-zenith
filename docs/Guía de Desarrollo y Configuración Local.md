
**Versión del Documento:** 1.0.0
**Estado:** Listo para Producción
**Audiencia:** Desarrollador Senior / Mantenedor Único
**Prerrequisitos:** Node.js 20+, Docker Desktop, Git
**Última Revisión:** 2026-06-28

---

## Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Configuración del Repositorio](#2-configuración-del-repositorio)
3. [Desarrollo Local con Supabase](#3-desarrollo-local-con-supabase)
4. [Referencia de Variables de Entorno](#4-referencia-de-variables-de-entorno)
5. [Instalación de Dependencias y Ejecución del Servidor de Desarrollo](#5-instalación-de-dependencias-y-ejecución-del-servidor-de-desarrollo)
6. [Inicialización del Esquema de Base de Datos](#6-inicialización-del-esquema-de-base-de-datos)
7. [Configuración de Stripe para Pruebas de Webhook Locales](#7-configuración-de-stripe-para-pruebas-de-webhook-locales)
8. [Configuración de la API de GitHub](#8-configuración-de-la-api-de-github)
9. [Configuración de Vimeo / Mux](#9-configuración-de-vimeo--mux)
10. [Despliegue a Producción](#10-despliegue-a-producción)
11. [Problemas Frecuentes y Resolución de Errores](#11-problemas-frecuentes-y-resolución-de-errores)

---

## 1. Prerrequisitos

Antes de iniciar el proceso de configuración, verificar que las siguientes herramientas estén instaladas y cumplan los requisitos mínimos de versión.

| Herramienta | Versión Mínima | Comando de Verificación | Propósito |
|---|---|---|---|
| Node.js | 20.x LTS | `node --version` | Runtime de JavaScript para Next.js. |
| npm | 10.x | `npm --version` | Gestor de paquetes (alternativa: pnpm 9+). |
| pnpm (opcional) | 9.x | `pnpm --version` | Gestor de paquetes preferido para instalaciones más rápidas. |
| Git | 2.40+ | `git --version` | Control de versiones. |
| Docker Desktop | 4.x | `docker --version` | Requerido para ejecutar Supabase localmente vía contenedores. |
| Supabase CLI | 1.200+ | `supabase --version` | Gestiona el stack local de Supabase y las Edge Functions. |

**Instalación de la Supabase CLI:**

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Linux (vía npm, global)
npm install -g supabase

# Windows (vía Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verificar que Docker esté en ejecución antes de continuar.** El stack local de Supabase depende de contenedores Docker para PostgreSQL, GoTrue (Auth), PostgREST y Realtime.

---

## 2. Configuración del Repositorio

**Paso 1 — Clonar el repositorio**

```bash
git clone https://github.com/{GITHUB_ORG}/horizon-zenith.git
cd horizon-zenith
```

**Paso 2 — Verificar la estructura del proyecto**

Tras clonar, el directorio raíz debe contener:

```
horizon-zenith/
|-- app/                  -> Páginas y layouts del App Router de Next.js
|-- components/           -> Componentes de UI reutilizables
|-- lib/                  -> Funciones utilitarias y clientes de API
|-- supabase/             -> Proyecto CLI de Supabase (migraciones, funciones, config)
|   |-- functions/        -> Archivos fuente de las Edge Functions
|   |-- migrations/       -> Archivos de migración SQL
|   +-- config.toml       -> Configuración del proyecto CLI de Supabase
|-- docs/                 -> Documentación técnica (este archivo)
|-- public/               -> Recursos estáticos
|-- .env.local.example    -> Plantilla de variables de entorno
|-- next.config.ts        -> Configuración de Next.js
|-- package.json
+-- tsconfig.json
```

---

## 3. Desarrollo Local con Supabase

Horizon Zenith usa la **Supabase CLI** para ejecutar un stack completo y contenedorizado de Supabase localmente. Esto incluye una base de datos PostgreSQL, el servicio de autenticación GoTrue, la capa de API PostgREST y el motor de Realtime — todos aislados del proyecto de producción.

**Paso 1 — Vincular la CLI de Supabase al proyecto remoto (solo la primera vez)**

Si estás configurando el proyecto por primera vez y ya tienes un proyecto de Supabase remoto, vincular la CLI a él:

```bash
supabase login
supabase link --project-ref {TU_SUPABASE_PROJECT_REF}
```

Reemplazar `{TU_SUPABASE_PROJECT_REF}` con el ID de referencia que se encuentra en el Dashboard de Supabase bajo Configuración del Proyecto > General.

**Paso 2 — Iniciar el stack local de Supabase**

```bash
supabase start
```

Este comando descarga las imágenes Docker necesarias (en la primera ejecución) e inicia todos los servicios de Supabase. Al completar, la CLI muestra las URLs de los servicios locales y las credenciales:

```
API URL: http://127.0.0.1:54321
DB URL:  postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio:  http://127.0.0.1:54323
Inbucket: http://127.0.0.1:54324

anon key: eyJhbGc...   (usar como NEXT_PUBLIC_SUPABASE_ANON_KEY)
service_role key: eyJhbGc...   (usar como SUPABASE_SERVICE_ROLE_KEY)
```

Copiar estos valores en el archivo `.env.local` (ver Sección 4).

**Paso 3 — Verificar que el stack local esté saludable**

```bash
supabase status
```

Todos los servicios deben reportar estado `RUNNING`. Si algún servicio falla al iniciar, la causa más común es un conflicto de puertos. Consultar la Sección 11 para la resolución de conflictos de puertos.

**Paso 4 — Detener el stack local**

```bash
supabase stop
```

Este comando detiene y elimina los contenedores en ejecución preservando el estado de la base de datos local. Agregar el flag `--no-backup` si también se quiere limpiar la base de datos local.

---

## 4. Referencia de Variables de Entorno

Todas las variables de entorno se almacenan en un archivo `.env.local` en la raíz del proyecto. Este archivo está excluido del control de versiones vía `.gitignore`. Copiar la plantilla provista antes de configurar:

```bash
cp .env.local.example .env.local
```

Abrir `.env.local` en el editor y completar cada variable como se documenta a continuación.

### 4.1 Supabase

```bash
# URL pública del proyecto de Supabase (local o remoto).
# Desarrollo local: usar la API URL que muestra 'supabase start'
# Producción: encontrar en Dashboard de Supabase > Configuración del Proyecto > API
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# La clave anónima pública. Es seguro exponerla al navegador.
# Desarrollo local: usar la 'anon key' que muestra 'supabase start'
# Producción: encontrar en Dashboard de Supabase > Configuración del Proyecto > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# La clave de rol de servicio. NUNCA exponerla al cliente.
# Usada exclusivamente en Server Components, rutas API y Edge Functions.
# Desarrollo local: usar la 'service_role key' que muestra 'supabase start'
# Producción: encontrar en Dashboard de Supabase > Configuración del Proyecto > API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Nota de seguridad:** El prefijo `NEXT_PUBLIC_` en Next.js incluye la variable en el bundle JavaScript del cliente. Por lo tanto, es seguro únicamente para `SUPABASE_URL` y `ANON_KEY`, que están diseñadas para ser públicamente accesibles y protegidas por políticas RLS. La `SUPABASE_SERVICE_ROLE_KEY` nunca debe llevar este prefijo.

### 4.2 Stripe

```bash
# Clave Secreta de Stripe. Usada del lado del servidor para crear Sesiones de Checkout.
# Modo de prueba: encontrar en Dashboard de Stripe > Desarrolladores > Claves API (comienza con 'sk_test_')
# Producción: usar la clave live (comienza con 'sk_live_')
STRIPE_SECRET_KEY=sk_test_...

# Clave Publicable de Stripe. Usada del lado del cliente si se implementa Stripe Elements.
# Para el flujo de Checkout alojado (por defecto), solo es necesaria si se inicializa
# Stripe.js en el cliente por algún motivo.
# Modo de prueba: comienza con 'pk_test_'
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# El secreto de firma del webhook para el endpoint registrado.
# LOCAL: generado por la CLI de Stripe al ejecutar 'stripe listen' (comienza con 'whsec_')
# PRODUCCIÓN: encontrar en Dashboard de Stripe > Webhooks > [tu endpoint] > Secreto de firma
STRIPE_WEBHOOK_SECRET=whsec_...

# El ID de Precio de Stripe para el producto de suscripción de mentoría.
# Encontrar en Dashboard de Stripe > Productos > [tu producto] > Precios
STRIPE_PRICE_ID=price_...
```

### 4.3 GitHub

```bash
# Un Personal Access Token (PAT) de GitHub con alcance 'repo'.
# Usado por la Edge Function para aprovisionar repositorios de alumnos a partir de una plantilla.
# Crear en: https://github.com/settings/tokens (clásico) o PATs de grano fino.
# Alcances requeridos: repo (control completo de repositorios privados)
GITHUB_TOKEN=ghp_...

# La organización o nombre de usuario de GitHub que es dueño del repositorio plantilla.
GITHUB_ORG=tu-org-o-usuario-de-github

# El nombre exacto del repositorio plantilla a clonar para cada nuevo alumno.
# Este repositorio debe tener el checkbox "Template repository" habilitado en su configuración.
GITHUB_TEMPLATE_REPO=horizonzenith-student-template
```

**Alternativa con PAT de grano fino (recomendado):** En lugar de un PAT clásico, crear un token de grano fino con alcance específico a la organización y repositorio. Permisos requeridos:
- Permisos de repositorio: `Contents` (Lectura y Escritura), `Administration` (Lectura y Escritura).

### 4.4 Proveedor de Email (Resend)

```bash
# Clave API para el proveedor de email transaccional.
# Resend: encontrar en https://resend.com/api-keys
# Alternativa AWS SES: usar AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY en su lugar.
RESEND_API_KEY=re_...

# La dirección de email de remitente verificada usada en el campo 'De' de los correos salientes.
# Debe estar verificada en el panel de tu proveedor de email.
FROM_EMAIL=noreply@horizonzenith.com

# La dirección de email de administración del mentor. Usada para recibir alertas de fallas.
MENTOR_ADMIN_EMAIL=mentor@ejemplo.com
```

### 4.5 Vimeo (si aplica)

```bash
# Token de acceso de la API de Vimeo con los siguientes alcances: public, private, video_files, upload.
# Crear en: https://developer.vimeo.com/apps
VIMEO_ACCESS_TOKEN=...

# Tu ID de usuario de Vimeo (numérico). Encontrar en la URL de tu perfil de Vimeo.
VIMEO_USER_ID=12345678
```

### 4.6 Mux (proveedor de video alternativo)

```bash
# Credenciales de API de Mux. Ambas son necesarias para llamadas API del lado del servidor.
# Crear en: https://dashboard.mux.com/settings/access-tokens
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...

# Clave de entorno de Mux Data (analíticas del reproductor). De acceso público.
NEXT_PUBLIC_MUX_ENV_KEY=...
```

### Plantilla Completa `.env.local.example`

La siguiente es la plantilla canónica que debe committearse al repositorio como `.env.local.example` (con todos los valores redactados):

```bash
# =====================================================
# HORIZON ZENITH — PLANTILLA DE VARIABLES DE ENTORNO
# Copiar este archivo como .env.local y completar todos los valores.
# NUNCA committear .env.local al control de versiones.
# =====================================================

# --- SUPABASE ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- STRIPE ---
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# --- GITHUB ---
GITHUB_TOKEN=
GITHUB_ORG=
GITHUB_TEMPLATE_REPO=

# --- EMAIL (RESEND) ---
RESEND_API_KEY=
FROM_EMAIL=
MENTOR_ADMIN_EMAIL=

# --- VIDEO (VIMEO) ---
VIMEO_ACCESS_TOKEN=
VIMEO_USER_ID=

# --- VIDEO (MUX — alternativa) ---
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
NEXT_PUBLIC_MUX_ENV_KEY=
```

---

## 5. Instalación de Dependencias y Ejecución del Servidor de Desarrollo

**Paso 1 — Instalar las dependencias del proyecto**

Con npm:
```bash
npm install
```

Con pnpm (recomendado por mayor velocidad de resolución y eficiencia de disco):
```bash
pnpm install
```

**Paso 2 — Verificar el entorno**

Antes de iniciar el servidor de desarrollo, confirmar que:
- `.env.local` existe y contiene valores para al menos las variables de Supabase.
- El stack local de Supabase está en ejecución (`supabase status`).

**Paso 3 — Iniciar el servidor de desarrollo de Next.js**

```bash
npm run dev
# o
pnpm dev
```

El servidor de desarrollo se inicia en `http://localhost:3000` con Hot Module Replacement (HMR) habilitado. El modo de desarrollo del App Router de Next.js incluye overlays de error a nivel de componente que muestran los errores del lado del servidor directamente en el navegador.

**Paso 4 — Verificar la conexión a Supabase**

Navegar a `http://localhost:3000`. Si la aplicación se renderiza sin errores de autenticación, la conexión a Supabase está establecida correctamente. Abrir la consola del navegador para confirmar la ausencia de errores de `SUPABASE_URL` o `SUPABASE_ANON_KEY` indefinidos.

---

## 6. Inicialización del Esquema de Base de Datos

Una vez que el stack local de Supabase está en ejecución, aplicar el esquema a la instancia local de PostgreSQL.

**Opción A — Vía archivo de migración (recomendado por reproducibilidad)**

El SQL de inicialización del esquema completo (documentado en `database_guide_pg.md`, Sección 11) se almacena como un archivo de migración:

```bash
supabase migration new esquema_inicial
```

Copiar el SQL completo del esquema en el archivo de migración generado en `supabase/migrations/{timestamp}_esquema_inicial.sql`, luego aplicarlo:

```bash
supabase db reset
```

`supabase db reset` elimina la base de datos local, la recrea desde cero y re-aplica todas las migraciones en orden. Este es el método de inicialización más seguro y reproducible.

**Opción B — Vía Supabase Studio (iteración rápida)**

Navegar a `http://127.0.0.1:54323` (Studio local), abrir el Editor SQL, pegar el script de inicialización completo y ejecutarlo. Este método es apropiado para iteración rápida pero no crea un archivo de migración reproducible.

**Verificar el esquema:**

```bash
supabase db diff
```

Este comando compara el estado de la base de datos local contra el esquema del proyecto remoto. Durante la configuración inicial, debe mostrar las tablas como nuevas adiciones. En un proyecto establecido, no debe mostrar diferencias si los esquemas local y remoto están sincronizados.

---

## 7. Configuración de Stripe para Pruebas de Webhook Locales

Los webhooks de Stripe no pueden alcanzar `localhost` directamente desde internet. La CLI de Stripe provee un proxy de reenvío local que enruta los eventos de webhook de Stripe a tu servidor de desarrollo local.

**Paso 1 — Instalar la CLI de Stripe**

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# npm (global)
npm install -g @stripe/stripe-cli

# Linux (vía apt)
# Ver https://stripe.com/docs/stripe-cli para las instrucciones oficiales de instalación.
```

**Paso 2 — Autenticar la CLI de Stripe**

```bash
stripe login
```

Este comando abre una ventana del navegador para autorizar la CLI con tu cuenta de Stripe.

**Paso 3 — Iniciar el listener de webhooks**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La CLI muestra un secreto de firma `whsec_` específico para esta sesión del listener local:

```
> Ready! Your webhook signing secret is whsec_abc123... (^C para salir)
```

Copiar este valor en `.env.local` como `STRIPE_WEBHOOK_SECRET`. Será necesario reiniciar el servidor de desarrollo de Next.js tras actualizar este valor para que surta efecto.

**Paso 4 — Disparar un evento de prueba**

En una terminal separada, disparar un evento simulado de `checkout.session.completed`:

```bash
stripe trigger checkout.session.completed
```

Observar los logs de la Edge Function (o la ruta API de Next.js) para verificar que el evento se recibe, la firma se valida y la lógica de aprovisionamiento se ejecuta correctamente contra la instancia local de Supabase.

**Importante:** El secreto `whsec_` generado por `stripe listen` tiene alcance de sesión. Cada vez que se reinicia el listener, se genera un nuevo secreto. Actualizar `.env.local` y reiniciar el servidor de desarrollo según corresponda. En producción, el secreto de firma es estable y permanente.

---

## 8. Configuración de la API de GitHub

**Paso 1 — Crear un Personal Access Token**

Navegar a [https://github.com/settings/tokens](https://github.com/settings/tokens) y crear un nuevo token:

- Para **PAT Clásico**: habilitar el alcance `repo` (otorga control total de repositorios).
- Para **PAT de Grano Fino** (recomendado): seleccionar la organización objetivo, otorgar `Administration` (Lectura y Escritura) y `Contents` (Lectura y Escritura) en el repositorio plantilla.

**Paso 2 — Crear y configurar el repositorio plantilla**

El endpoint de generación de repositorios de la API de GitHub requiere un repositorio fuente con la configuración "Template repository" habilitada:

1. Crear un nuevo repositorio de GitHub llamado `horizonzenith-student-template` en la organización o cuenta de usuario objetivo.
2. Navegar a Configuración del repositorio > General.
3. Bajo la sección "Repository Details", habilitar el checkbox **Template repository**.
4. Poblar la plantilla con la estructura de directorios base para nuevos alumnos (ej: un `README.md`, un scaffold de proyecto inicial y cualquier archivo de ejercicio inicial).

**Paso 3 — Completar las variables de GitHub en `.env.local`**

```bash
GITHUB_TOKEN=ghp_tu_token_aqui
GITHUB_ORG=tu-org-o-usuario
GITHUB_TEMPLATE_REPO=horizonzenith-student-template
```

**Paso 4 — Probar la llamada de aprovisionamiento localmente**

Una prueba simple con cURL para verificar los permisos del token y la configuración de la plantilla:

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/$GITHUB_ORG/$GITHUB_TEMPLATE_REPO/generate \
  -d '{"owner":"'"$GITHUB_ORG"'","name":"test-alumno-repo","private":true}'
```

Una respuesta `201 Created` confirma que el token y la plantilla están correctamente configurados. Eliminar el repositorio de prueba tras la verificación.

---

## 9. Configuración de Vimeo / Mux

### Vimeo

1. Crear una aplicación en [https://developer.vimeo.com/apps](https://developer.vimeo.com/apps).
2. Generar un **Token de Acceso** con los siguientes alcances: `public`, `private`, `video_files`, `upload`, `interact`.
3. Navegar a tu cuenta de Vimeo y encontrar tu **ID de usuario** en la URL: `vimeo.com/{USER_ID}`.
4. Para cada video subido, configurar el **Control de Dominio** bajo la configuración de Privacidad del video para restringir la incrustación únicamente a `horizonzenith.com`.
5. Copiar la URL incrustable del reproductor (formato: `https://player.vimeo.com/video/{VIDEO_ID}`) y almacenarla en la columna `classes.video_url`.

### Mux

1. Crear una cuenta en [https://dashboard.mux.com](https://dashboard.mux.com).
2. Navegar a Configuración > Tokens de Acceso y crear un nuevo token con permisos de lectura/escritura en `Mux Video` y `Mux Data`.
3. Para reproducción firmada (recomendado): configurar el entorno de Mux para requerir URLs de reproducción firmadas. Las claves de firma se generan en el Dashboard de Mux bajo Configuración > Claves de Firma.
4. Completar `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` y `NEXT_PUBLIC_MUX_ENV_KEY` en `.env.local`.
5. Almacenar los IDs de Asset de Mux (no la URL firmada completa) en `classes.video_url` y generar las URLs de reproducción firmadas por solicitud dentro de un Server Component.

---

## 10. Despliegue a Producción

Los destinos de despliegue recomendados son **Vercel** (frontend) y **Supabase Cloud** (backend). Ambas plataformas tienen integraciones nativas.

**Paso 1 — Crear el proyecto de Supabase en producción**

1. Iniciar sesión en [https://app.supabase.com](https://app.supabase.com).
2. Crear un nuevo proyecto y seleccionar la región más cercana a la base de usuarios principal.
3. Una vez aprovisionado, navegar a Configuración del Proyecto > API y copiar la `Project URL`, `anon key` y `service_role key`.

**Paso 2 — Aplicar las migraciones a producción**

```bash
supabase db push
```

Este comando sube todas las migraciones locales en `supabase/migrations/` al proyecto remoto vinculado. Ejecutar `supabase link` primero si aún no está vinculado.

**Paso 3 — Desplegar las Edge Functions a producción**

```bash
supabase functions deploy stripe-webhook
supabase functions deploy github-provision
supabase functions deploy mailer
```

Cada función se despliega de forma independiente. Establecer las variables de entorno de producción para las funciones vía el Dashboard de Supabase (Configuración del Proyecto > Edge Functions) o vía la CLI:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set GITHUB_TOKEN=ghp_...
supabase secrets set RESEND_API_KEY=re_...
```

**Paso 4 — Desplegar la aplicación Next.js en Vercel**

1. Subir el repositorio a GitHub.
2. Iniciar sesión en [https://vercel.com](https://vercel.com) e importar el repositorio.
3. Durante la importación, configurar todas las variables de entorno de `.env.local` bajo la sección de Variables de Entorno del proyecto de Vercel. Establecer las variables para el entorno de `Production` únicamente (usar claves de prueba para los entornos de `Preview`).
4. Vercel detecta automáticamente el framework Next.js y configura la compilación correctamente.
5. Hacer clic en Desplegar.

**Paso 5 — Registrar el webhook de Stripe en producción**

1. En el Dashboard de Stripe, navegar a Desarrolladores > Webhooks.
2. Hacer clic en "Agregar endpoint."
3. Ingresar la URL de producción: `https://horizonzenith.com/api/webhooks/stripe`.
4. Suscribirse a los siguientes eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copiar el secreto de firma y agregarlo como `STRIPE_WEBHOOK_SECRET` en las variables de entorno de producción de Vercel.

**Paso 6 — Configurar el dominio personalizado**

1. En Vercel, navegar a Configuración del proyecto > Dominios.
2. Agregar `horizonzenith.com` y seguir las instrucciones de configuración de DNS.
3. Una vez que el DNS se propague, actualizar los orígenes permitidos en el Dashboard de Supabase bajo Autenticación > Configuración de URL (URL del Sitio y URLs de Redirección).

---

## 11. Problemas Frecuentes y Resolución de Errores

### El stack local de Supabase no inicia

**Síntoma:** `supabase start` falla con un error de conflicto de puerto.

**Resolución:** Identificar el proceso en conflicto y terminarlo, o cambiar el puerto en `supabase/config.toml`:

```bash
# Encontrar el proceso usando el puerto 54321
lsof -i :54321

# Terminarlo
kill -9 {PID}

# O cambiar el puerto en supabase/config.toml:
[api]
port = 54329
```

### Las variables de entorno no son reconocidas por Next.js

**Síntoma:** `process.env.NEXT_PUBLIC_SUPABASE_URL` es `undefined` en el navegador.

**Resolución:** Reiniciar el servidor de desarrollo de Next.js tras modificar `.env.local`. Next.js carga las variables de entorno al inicio; los cambios en tiempo de ejecución a `.env.local` no se recargan en caliente.

```bash
# Detener el servidor con Ctrl+C, luego reiniciar:
npm run dev
```

### La verificación de firma del webhook de Stripe falla localmente

**Síntoma:** El manejador del webhook retorna `HTTP 400` con el error "No signatures found matching the expected signature."

**Resolución:** Esto ocurre cuando `STRIPE_WEBHOOK_SECRET` en `.env.local` no coincide con el secreto generado por la sesión actual de `stripe listen`.

1. Detener el proceso de `stripe listen`.
2. Reiniciarlo: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. Copiar el nuevo valor `whsec_` a `.env.local`.
4. Reiniciar el servidor de desarrollo de Next.js.

Adicionalmente, asegurarse de que el manejador de la ruta del webhook de Stripe esté leyendo el **cuerpo sin procesar** (raw body) — no el cuerpo JSON parseado. En el App Router de Next.js, el objeto `Request` provee el cuerpo sin procesar vía `await request.text()` o `await request.arrayBuffer()` — sin configuración adicional necesaria.

### El aprovisionamiento de GitHub retorna `HTTP 422 Unprocessable Entity`

**Síntoma:** La Edge Function recibe un error 422 al llamar al endpoint de generación de repositorio de GitHub.

**Causas comunes y resoluciones:**

| Causa | Resolución |
|---|---|
| El nombre del repositorio destino ya existe | Agregar un sufijo único (ej: fragmento de UUID) al nombre de repositorio generado. |
| El repositorio plantilla no tiene la configuración "Template" habilitada | Habilitar la configuración en Configuración del repositorio > General de GitHub. |
| El campo `owner` en el cuerpo de la solicitud no coincide con el alcance accesible por el token | Verificar que `GITHUB_ORG` coincida con la organización o usuario dueño de la plantilla y que el PAT tenga los permisos requeridos para ese alcance. |

### Las políticas RLS bloquean lecturas en desarrollo

**Síntoma:** Las consultas retornan arrays vacíos a pesar de que existen datos en la base de datos, al consultarlos vía Supabase Studio o una llamada directa a PostgREST.

**Resolución:** Las políticas RLS se hacen cumplir para todas las conexiones autenticadas y anónimas. Para omitir RLS en Supabase Studio durante la depuración, usar el **Editor SQL** con la opción "Usar service_role key" habilitada (encontrar en el panel de configuración de conexión del Editor SQL del Studio). Alternativamente, conectarse directamente a la base de datos local de PostgreSQL usando `psql`:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Las conexiones directas de `psql` omiten completamente las políticas RLS, funcionando como superusuario.
