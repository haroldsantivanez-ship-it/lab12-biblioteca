# NEXUS · Biblioteca — API Routes con Next.js, Prisma y Supabase

Laboratorio 12 — Desarrollo de Aplicaciones Web Avanzado (Tecsup).

Sistema de biblioteca (autores y libros) con API Routes del App Router de Next.js,
Prisma ORM y PostgreSQL en Supabase.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET / POST | `/api/authors` | Listar / crear autores |
| GET / PUT / DELETE | `/api/authors/[id]` | Autor por ID |
| GET | `/api/authors/[id]/books` | Libros de un autor |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor |
| GET / POST | `/api/books` | Listar (`?genre=`, `?authorId=`) / crear libros |
| GET / PUT / DELETE | `/api/books/[id]` | Libro por ID |
| GET | `/api/books/search` | Búsqueda con filtros, orden y paginación |
| GET | `/api/stats` | Estadísticas generales |

Ejemplo: `/api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc`

## Páginas

- `/` — Dashboard de autores (crear, editar, eliminar, estadísticas generales)
- `/books` — Búsqueda de libros en tiempo real con filtros y paginación
- `/authors/[id]` — Detalle y estadísticas del autor

## Ejecutar en local

```bash
npm install
cp .env.example .env        # y completar DATABASE_URL y DIRECT_URL de Supabase
npx prisma db push
npm run dev
npm run seed                # opcional: datos de ejemplo
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL (Supabase)
