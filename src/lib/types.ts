// Tipos que devuelven las API Routes (las fechas llegan como string en JSON)

export type Author = {
  id: string
  name: string
  email: string
  bio: string | null
  nationality: string | null
  birthYear: number | null
  createdAt: string
  updatedAt: string
}

export type Book = {
  id: string
  title: string
  description: string | null
  isbn: string | null
  publishedYear: number | null
  genre: string | null
  pages: number | null
  authorId: string
  createdAt: string
  updatedAt: string
}

export type AuthorWithCount = Author & { _count: { books: number } }
export type AuthorWithBooks = AuthorWithCount & { books: Book[] }
export type BookWithAuthor = Book & { author: { id: string; name: string } }

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type SearchResponse = { data: BookWithAuthor[]; pagination: Pagination }

export type AuthorStats = {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number } | null
  latestBook: { title: string; year: number } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

export type GeneralStats = {
  totalAuthors: number
  totalBooks: number
  totalGenres: number
  averagePages: number
  genres: { genre: string; count: number }[]
}
