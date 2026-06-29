export const LAUTARO_DATA = {
  id: "01",
  name: "Lautaro Villalba",
  role: "Mentoría de Arquitectura & Backend",
  status: "Activo",
  programType: "Mentoría Personalizada", 
  objective: "Diseñar arquitecturas limpias, dominar bases de datos distribuidas y optimizar APIs corporativas con TypeScript.",
  nextSession: "Martes 16 de Junio - 19:00 (ARG)",
  meetLink: "https://meet.google.com/vey-rdri-lautaro",
  githubRepo: "github.com/Veyrdric-Students/lautaro-villalba-backend",
  classes: [
    { id: 3, title: "Optimización de Consultas SQL y Pool de Conexiones", date: "08 de Junio, 2026", duration: "1.5 horas", description: "Análisis profundo de índices, planes de ejecución de consultas y optimización de pools de conexión eficientes en PostgreSQL." },
    { id: 2, title: "Autenticación JWT y Middleware de Seguridad", date: "01 de Junio, 2026", duration: "1.5 horas", description: "Implementación de login seguro, hashing de contraseñas con bcrypt y protección de endpoints críticos mediante tokens." },
    { id: 1, title: "Estructuración de API RESTful con Express & TS", date: "25 de Mayo, 2026", duration: "2.0 horas", description: "Configuración inicial del entorno de TypeScript, ruteo escalable y manejo global de errores en servidores Node.js." }
  ],
  challenges: [
    { id: 101, title: "Implementación de Caché con Redis", description: "Optimizar el endpoint de catálogo guardando las consultas más pesadas en memoria durante 5 minutos para evitar redundancia en PostgreSQL.", status: "Pendiente" },
    { id: 102, title: "Pruebas Unitarias de Controladores", description: "Escribir pruebas de integración y unitarias usando Jest para garantizar cobertura superior al 80% en los módulos de autenticación.", status: "En Progreso" },
    { id: 103, title: "Contenerización del Entorno de Base de Datos", description: "Configurar un archivo docker-compose robusto para levantar instancias de base de datos locales de forma idéntica al servidor de producción.", status: "Aprobado" }
  ],
  codeHistory: [
    {
      classId: 3,
      classTitle: "Optimización de Consultas SQL",
      files: [
        {
          name: "database.ts",
          description: "Configuración del pool de conexiones con optimización de tiempos de espera y re-intentos automáticos.",
          code: `import { Pool } from 'pg';\n\nexport const dbPool = new Pool({\n  user: 'veyrdric_admin',\n  host: 'localhost',\n  database: 'rhine_db',\n  password: 'secure_password',\n  port: 5432,\n  max: 20,\n  idleTimeoutMillis: 30000,\n  connectionTimeoutMillis: 2000,\n});`
        },
        {
          name: "get-users-optimized.sql",
          description: "Query con índice compuesto optimizado para búsquedas filtradas por estado y fecha de registro.",
          code: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status_date \nON users (status, created_at DESC);\n\nSELECT id, name, email, created_at \nFROM users \nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 50;`
        }
      ]
    },
    {
      classId: 2,
      classTitle: "Autenticación JWT & Middleware",
      files: [
        {
          name: "auth.middleware.ts",
          description: "Validador de tokens Bearer JWT con tipado estricto para Express.",
          code: `import { Request, Response, NextFunction } from 'express';\nimport jwt from 'jsonwebtoken';\n\nexport const validateJWT = (req: Request, res: Response, next: NextFunction) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader?.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Token no provisto' });\n  }\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET!);\n    req.user = decoded;\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Token inválido o expirado' });\n  }\n};`
        }
      ]
    }
  ],
  syllabus: [
    {
      id: "mod-1",
      moduleTitle: "Fase 1: Arquitectura y Modelado de Datos",
      progress: 100,
      status: "Completado",
      topics: ["Diseño de modelos relacionales en PostgreSQL", "Normalización de tablas", "Mapeo y relaciones con Prisma ORM", "Estructuración de repositorios"],
      nodeClass: "Fase Completada"
    },
    {
      id: "mod-2",
      moduleTitle: "Fase 2: APIs de Alto Rendimiento y Seguridad",
      progress: 40,
      status: "En Progreso",
      topics: ["Ruteo robusto y validación de tipos", "Seguridad con JWT y control de accesos", "Control de errores global", "Caché de consultas en memoria con Redis"],
      nodeClass: "Fase en Curso"
    },
    {
      id: "mod-3",
      moduleTitle: "Fase 3: Infraestructura, Docker y Despliegue",
      progress: 0,
      status: "Bloqueado",
      topics: ["Configuración de contenedores con Docker", "Flujos automatizados de CI/CD", "Optimización de variables de entorno", "Estrategias de monitoreo en servidores"],
      nodeClass: "Fase Siguiente"
    }
  ],
  doubts: [
    { id: 201, question: "¿Por qué Express me dice 'Headers already sent' si solo tengo un res.json en mi controlador?", answer: "Ese error ocurre porque la ejecución de la función continúa después de enviar una respuesta. Asegúrate de poner un 'return' antes de tus envíos de respuesta dentro de condicionales.", timestamp: "Hace 2 días", isResolved: true }
  ]
};

export const PEDRO_DATA = {
  id: "02",
  name: "Pedro Gómez",
  role: "Clase de Apoyo: Estructuras de Control",
  status: "Activo",
  programType: "Clase Particular Express", 
  objective: "Aprobar el examen parcial de Programación I dominando lógica de bucles anidados y control de flujo en Python.",
  nextSession: "Jueves 11 de Junio - 18:00 (ARG)",
  meetLink: "https://meet.google.com/vey-rdri-pedrog",
  githubRepo: "github.com/Veyrdric-Students/pedro-gomez-bucles",
  classes: [
    { id: 1, title: "Anatomía de los Bucles For y While", date: "08 de Junio, 2026", duration: "1.5 horas", description: "Entendimiento del flujo de control lógico, contadores, acumuladores y la diferencia práctica entre break y continue." }
  ],
  challenges: [
    { id: 301, title: "Dibujar Patrones con Bucles Anidados", description: "Escribir un script que reciba un número N e imprima un triángulo de asteriscos en consola utilizando bucles internos de forma correcta.", status: "Listo para Corrección" },
    { id: 302, title: "Corrección de Contador Inverso Infinito", description: "Identificar y solucionar el fallo de desborde que provoca que el contador hacia atrás nunca se detenga y congele la terminal.", status: "Aprobado" }
  ],
  codeHistory: [
    {
      classId: 1,
      classTitle: "Bucles e Iteradores en Python",
      files: [
        {
          name: "patrones.py",
          description: "Resolución del ejercicio típico de parcial: dibujar grillas y pirámides de caracteres en consola.",
          code: `# Dibujo de triángulo de asteriscos\ndef dibujar_triangulo(filas):\n    for i in range(1, filas + 1):\n        # Imprime espacios y luego asteriscos\n        print(" " * (filas - i) + "*" * (2 * i - 1))\n\ndibujar_triangulo(5)`
        }
      ]
    }
  ],
  syllabus: [
    {
      id: "mod-1",
      moduleTitle: "Estructuras de Control de Flujo",
      progress: 60,
      status: "En Progreso",
      topics: ["Operadores lógicos y condicionales If/Else", "Estructura del iterador For", "Condición de corte en bucles While", "Evitar desbordes y bucles infinitos"],
      nodeClass: "En Curso"
    }
  ],
  doubts: []
};

export const SOFI_DATA = {
  id: "03",
  name: "Sofi Martínez",
  role: "Especialización de Desarrollo Frontend",
  status: "Activo",
  programType: "Carrera Completa", 
  objective: "Aprender desarrollo web profesional desde absoluto cero, construir interfaces reactivas de alta gama y publicar un portfolio.",
  nextSession: "Lunes 15 de Junio - 16:30 (ARG)",
  meetLink: "https://meet.google.com/vey-rdri-sofim",
  githubRepo: "github.com/Veyrdric-Students/sofi-martinez-portfolio",
  classes: [
    { id: 2, title: "Maquetación Avanzada con Flexbox & CSS Grid", date: "05 de Junio, 2026", duration: "1.5 horas", description: "Diseño y estructura de layouts responsivos imitando plataformas reales mediante la distribución inteligente de contenedores." },
    { id: 1, title: "Estructura Web y HTML Semántico", date: "29 de Mayo, 2026", duration: "1.5 horas", description: "Uso correcto de etiquetas estructurales para optimizar la accesibilidad web, legibilidad de código y posicionamiento SEO." }
  ],
  challenges: [
    { id: 501, title: "Recreación de Maqueta de Interfaz Real", description: "Tomar de referencia capturas de una aplicación real y replicar toda su estructura visual utilizando HTML semántico y CSS nativo.", status: "Listo para Corrección" },
    { id: 502, title: "Grilla de Tarjetas Altamente Adaptable", description: "Construir una sección de productos que se distribuya de forma automática en múltiples columnas según el tamaño del dispositivo.", status: "Aprobado" }
  ],
  codeHistory: [
    {
      classId: 2,
      classTitle: "Grid & Flexbox Layouts",
      files: [
        {
          name: "layout-tienda.css",
          description: "Estructura de grilla responsive para catálogo de productos que se adapta sin media queries.",
          code: `.catalogo {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 24px;\n  padding: 16px;\n}\n\n.tarjeta-producto {\n  display: flex;\n  flex-direction: column;\n  border-radius: 12px;\n  background-color: #ffffff;\n  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n}`
        },
        {
          name: "tienda.html",
          description: "Maquetación semántica del e-commerce utilizando las secciones correctas.",
          code: `<main class="contenedor-principal">\n  <header class="encabezado-tienda">\n    <h1>Veyrdric Marketplace</h1>\n  </header>\n  <section class="catalogo" id="grid-productos">\n    <!-- Tarjetas dinámicas aquí -->\n  </section>\n</main>`
        }
      ]
    },
    {
      classId: 1,
      classTitle: "HTML Semántico de Base",
      files: [
        {
          name: "portfolio.html",
          description: "Estructura principal del portfolio semántico.",
          code: `<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi Portfolio</title>\n</head>\n<body>\n  <header>\n    <nav><ul><li><a href="#proyectos">Proyectos</a></li></ul></nav>\n  </header>\n  <main>\n    <section id="proyectos">\n      <article>\n        <h2>Proyecto 1</h2>\n        <p>Descripción del proyecto...</p>\n      </article>\n    </section>\n  </main>\n</body>\n</html>`
        }
      ]
    }
  ],
  syllabus: [
    {
      id: "mod-1",
      moduleTitle: "Fase 1: HTML Semántico y Estructuras CSS",
      progress: 100,
      status: "Completado",
      topics: ["Estructura jerárquica de etiquetas y SEO", "Selectores y especificidad de estilos", "Diseño responsivo con Flexbox y CSS Grid", "Prácticas de accesibilidad web estándar"],
      nodeClass: "Fase Completada"
    },
    {
      id: "mod-2",
      moduleTitle: "Fase 2: Lógica JavaScript e Interactividad",
      progress: 25,
      status: "En Progreso",
      topics: ["Tipos de datos, variables y modularización", "Control de flujo, iteradores y funciones", "Interacción y manipulación dinámica del DOM", "Asincronismo, consumo de APIs y promesas"],
      nodeClass: "Fase en Curso"
    },
    {
      id: "mod-3",
      moduleTitle: "Fase 3: Componentes React y Tailwind CSS",
      progress: 0,
      status: "Bloqueado",
      topics: ["Arquitectura modular basada en componentes", "Manejo de estados globales y hooks en React", "Diseño rápido por clases utilitarias de Tailwind", "Despliegue automatizado y optimización final"],
      nodeClass: "Fase Siguiente"
    }
  ],
  doubts: []
};

export const ALL_STUDENTS = [LAUTARO_DATA, PEDRO_DATA, SOFI_DATA];
