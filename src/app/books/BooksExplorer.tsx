'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BookForm from '@/components/BookForm'
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Modal,
  PageHeader,
  Spinner,
  inputClass,
} from '@/components/ui'
import { api } from '@/lib/api'
import type {
  AuthorWithCount,
  Book,
  BookWithAuthor,
  GeneralStats,
  SearchResponse,
} from '@/lib/types'

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Más recientes' },
  { value: 'createdAt:asc', label: 'Más antiguos (registro)' },
  { value: 'title:asc', label: 'Título A → Z' },
  { value: 'title:desc', label: 'Título Z → A' },
  { value: 'publishedYear:desc', label: 'Año (más nuevo)' },
  { value: 'publishedYear:asc', label: 'Año (más antiguo)' },
]

export default function BooksExplorer() {
  const searchParams = useSearchParams()

  // Filtros
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState(searchParams.get('authorId') ?? '')
  const [sort, setSort] = useState('createdAt:desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Datos
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [loadedQuery, setLoadedQuery] = useState('')
  const [authors, setAuthors] = useState<AuthorWithCount[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // Modales
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<BookWithAuthor | null>(null)

  // Búsqueda en tiempo real: espera 350 ms después de la última tecla
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  // Query string que se envía a GET /api/books/search
  const query = useMemo(() => {
    const [sortBy, order] = sort.split(':')
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      order,
    })
    if (debouncedSearch) qs.set('search', debouncedSearch)
    if (genre) qs.set('genre', genre)
    if (authorId) qs.set('authorId', authorId)
    return qs.toString()
  }, [debouncedSearch, genre, authorId, sort, page, limit])

  // Si la última respuesta no corresponde a la query actual, está cargando
  const queryKey = `${query}#${reloadKey}`
  const loading = loadedQuery !== queryKey

  useEffect(() => {
    let cancelled = false
    api<SearchResponse>(`/api/books/search?${query}`)
      .then((data) => {
        if (cancelled) return
        setResult(data)
        setError('')
      })
      .catch((err) => !cancelled && setError((err as Error).message))
      .finally(() => !cancelled && setLoadedQuery(queryKey))
    return () => {
      cancelled = true
    }
  }, [query, queryKey])

  // Autores y géneros para los dropdowns
  const loadOptions = useCallback(() => {
    Promise.all([
      api<AuthorWithCount[]>('/api/authors'),
      api<GeneralStats>('/api/stats'),
    ])
      .then(([a, s]) => {
        setAuthors(a)
        setGenres(s.genres.map((g) => g.genre))
      })
      .catch((err) => setError((err as Error).message))
  }, [])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  function refresh(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
    setReloadKey((k) => k + 1)
    loadOptions()
  }

  async function handleDelete(book: BookWithAuthor) {
    if (!confirm(`¿Eliminar el libro "${book.title}"?`)) return
    try {
      await api(`/api/books/${book.id}`, { method: 'DELETE' })
      // Si era el último de la página, volver a la anterior
      if (result && result.data.length === 1 && page > 1) setPage(page - 1)
      refresh('Libro eliminado correctamente')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function clearFilters() {
    setSearch('')
    setDebouncedSearch('')
    setGenre('')
    setAuthorId('')
    setSort('createdAt:desc')
    setPage(1)
  }

  const pagination = result?.pagination
  const hasFilters = search || genre || authorId || sort !== 'createdAt:desc'

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <>
            Explorador de <span className="neon-text">libros</span>
          </>
        }
        action={
          <Button onClick={() => setCreating(true)} disabled={!authors.length}>
            + Nuevo libro
          </Button>
        }
      />

      {/* Barra de búsqueda y filtros */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <Field label="Buscar por título">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/70">
                ⌕
              </span>
              <input
                className={`${inputClass} pl-9`}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: soledad, amor..."
                autoFocus
              />
            </div>
          </Field>
          <Field label="Género">
            <select
              className={inputClass}
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Autor">
            <select
              className={inputClass}
              value={authorId}
              onChange={(e) => {
                setAuthorId(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Todos los autores</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ordenar por">
            <select
              className={inputClass}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-sm">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400" aria-live="polite">
            {loading ? (
              <span className="inline-flex items-center gap-2 text-cyan-300">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
                Escaneando catálogo...
              </span>
            ) : (
              <>
                <span className="neon-text text-base font-semibold">
                  {pagination?.total ?? 0}
                </span>{' '}
                resultado(s) encontrado(s)
              </>
            )}
          </p>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              ✕ Limpiar filtros
            </Button>
          )}
        </div>
      </Card>

      {message && <Alert kind="success">{message}</Alert>}
      {error && <Alert>{error}</Alert>}

      {/* Resultados */}
      {!result && loading ? (
        <Spinner label="Cargando catálogo" />
      ) : result && result.data.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-slate-500">
            No se encontraron libros con esos filtros.
          </p>
        </Card>
      ) : (
        <div
          className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-40' : ''}`}
        >
          {result?.data.map((b, i) => (
            <article
              key={b.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="glass glow-hover animate-rise group relative flex flex-col overflow-hidden rounded-2xl p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug text-white">{b.title}</h3>
                {b.genre && <Badge>{b.genre}</Badge>}
              </div>
              <Link
                href={`/authors/${b.author.id}`}
                className="mt-1 text-sm text-violet-300 transition hover:text-cyan-300"
              >
                {b.author.name}
              </Link>
              {b.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                  {b.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                <span>
                  <span className="text-cyan-300/80">AÑO</span> {b.publishedYear ?? '—'}
                </span>
                <span>
                  <span className="text-cyan-300/80">PÁGS</span> {b.pages ?? '—'}
                </span>
                {b.isbn && (
                  <span>
                    <span className="text-cyan-300/80">ISBN</span> {b.isbn}
                  </span>
                )}
              </div>
              <div className="mt-auto flex gap-2 pt-5">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditing(b)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleDelete(b)}
                >
                  Eliminar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 0 && (
        <div className="glass flex flex-col items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:flex-row">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400">
            <span>Por página</span>
            <select
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-slate-100 outline-none focus:border-cyan-400/60"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Paginación">
            <Button
              variant="secondary"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPage(page - 1)}
            >
              ←
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  disabled={loading}
                  aria-current={n === page ? 'page' : undefined}
                  className={`h-9 min-w-9 rounded-xl px-2 font-mono text-sm font-medium transition ${
                    n === page
                      ? 'bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-[0_0_18px_-2px_rgba(34,211,238,0.8)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <Button
              variant="secondary"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPage(page + 1)}
            >
              →
            </Button>
          </nav>
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400">
            Página <span className="text-cyan-200">{pagination.page}</span> de{' '}
            <span className="text-cyan-200">{pagination.totalPages}</span>
          </p>
        </div>
      )}

      {creating && (
        <Modal title="Nuevo libro" onClose={() => setCreating(false)}>
          <BookForm
            authors={authors}
            fixedAuthorId={authorId || undefined}
            genres={genres}
            onCancel={() => setCreating(false)}
            onSaved={(b: Book) => {
              setCreating(false)
              refresh(`Libro "${b.title}" creado`)
            }}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar libro" onClose={() => setEditing(null)}>
          <BookForm
            book={editing}
            authors={authors}
            genres={genres}
            onCancel={() => setEditing(null)}
            onSaved={(b: Book) => {
              setEditing(null)
              refresh(`Libro "${b.title}" actualizado`)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
