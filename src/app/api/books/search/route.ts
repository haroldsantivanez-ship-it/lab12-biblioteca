import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['title', 'publishedYear', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

// Convierte un query param a entero positivo; si no es válido usa el valor por defecto
function toPositiveInt(value: string | null, fallback: number) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// GET - Búsqueda de libros con filtros, ordenamiento y paginación
// Ej: /api/books/search?search=amor&genre=Novela&authorName=garcia&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  // Se lee fuera del try: Next.js usa esta lectura para saber que la ruta es dinámica
  const { searchParams } = new URL(request.url)

  try {

    const search = searchParams.get('search')?.trim()
    const genre = searchParams.get('genre')?.trim()
    const authorName = searchParams.get('authorName')?.trim()
    // Extra: filtro exacto por ID de autor (lo usa el dropdown de autores)
    const authorId = searchParams.get('authorId')?.trim()

    const page = toPositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(toPositiveInt(searchParams.get('limit'), 10), 50)

    const sortParam = searchParams.get('sortBy') as SortField | null
    const sortBy: SortField =
      sortParam && SORT_FIELDS.includes(sortParam) ? sortParam : 'createdAt'
    const order: Prisma.SortOrder =
      searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    const where: Prisma.BookWhereInput = {
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(genre && { genre }),
      ...(authorId && { authorId }),
      ...(authorName && {
        author: { name: { contains: authorName, mode: 'insensitive' } },
      }),
    }

    const [total, data] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
        },
        // Segundo criterio para que el orden sea estable entre páginas
        orderBy: [{ [sortBy]: order }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}
