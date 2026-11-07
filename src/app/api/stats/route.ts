import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Estadísticas generales de la biblioteca (para el dashboard)
export async function GET() {
  try {
    const [totalAuthors, totalBooks, pagesAgg, byGenre] = await Promise.all([
      prisma.author.count(),
      prisma.book.count(),
      prisma.book.aggregate({ _avg: { pages: true } }),
      prisma.book.groupBy({
        by: ['genre'],
        where: { genre: { not: null } },
        _count: { _all: true },
        orderBy: { genre: 'asc' },
      }),
    ])

    const genres = byGenre.map((g) => ({
      genre: g.genre as string,
      count: g._count._all,
    }))

    return NextResponse.json({
      totalAuthors,
      totalBooks,
      totalGenres: genres.length,
      averagePages: Math.round(pagesAgg._avg.pages ?? 0),
      genres,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
