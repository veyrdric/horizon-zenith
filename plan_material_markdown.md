# Plan Arquitectónico: Material de Estudio en Markdown

## 1. Objetivo
Permitir que el mentor redacte material de estudio (ej: guías de bucle for) en texto plano (Markdown) e incorpore imágenes fácilmente, para luego vincularlo a clases específicas y mostrarlo en el dashboard del alumno.

## 2. Base de Datos (Supabase Postgres)
- **Tabla sugerida**: `class_materials`
  - `id` (UUID, Primary Key)
  - `class_id` (FK apuntando a la tabla `classes`)
  - `title` (Texto, ej: "Guía Bucle For")
  - `content` (TEXT) -> Almacena el código Markdown en crudo. Extremadamente ligero (10-15KB por guía).

## 3. Manejo de Imágenes (Supabase Storage)
- **Las imágenes NO van en Postgres**. Para no saturar los 500MB gratuitos de la DB, las imágenes se subirán a un bucket público en **Supabase Storage** (que ofrece 1GB gratuito).
- El Markdown en la DB solo guardará el texto con la URL de la imagen: `![alt](https://supabase.../imagen.png)`.

## 4. Experiencia de Usuario (Admin Panel)
- Para evitar la fricción de subir imágenes manualmente a Supabase y copiar links, **integraremos un editor Markdown React** (ej: `UIW React Markdown Editor` o `TipTap`).
- Configuraríamos el editor para que soporte **Drag & Drop / Copy & Paste**. 
- Cuando el mentor arrastre una captura al cuadro de texto, una función interna en React intercepta la imagen, la sube silenciosamente a Supabase Storage, obtiene la URL, e inyecta la sintaxis `![imagen](url)` automáticamente.

## 5. Visualización del Alumno
- En su panel, al abrir una clase, el alumno verá un botón para ver el material.
- La aplicación usará `react-markdown` y el plugin de tailwind `@tailwindcss/typography` (`prose`) para renderizar el código Markdown (texto e imágenes) en una vista hermosa, legible y profesional.
