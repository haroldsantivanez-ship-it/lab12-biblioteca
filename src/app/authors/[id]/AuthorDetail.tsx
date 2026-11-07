'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import AuthorForm from '@/components/AuthorForm'
import BookForm from '@/components/BookForm'
import {
  Alert,
  Badge,
  Button,
  Card,
  Modal,
  SectionTitle,
  Spinner,
  StatCard,
} from '@/components/ui'
import { api } from '@/lib/api'
import type { AuthorStats, AuthorWithBooks, Book } from '@/lib/types'

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// Detalle de autor: info, estadísticas (GET /api/authors/[id]/stats),
// sus libros, edición del autor y agregar libro a este autor
export default function AuthorDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [author, setAuthor] = useState<AuthorWithBooks | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingAuthor, setEditingAuthor] = useState(false)
  const [addingBook, setAddingBook] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Cambiar reloadKey vuelve a pedir los datos a la API
  const [reloadKey, setReloadKey] = useState(0)
  const load = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<AuthorWithBooks>(`/api/authors/${id}`),
      api<AuthorStats>(`/api/authors/${id}/stats`),
    ])
      .then(([a, s]) => {
        if (cancelled) return
        setAuthor(a)
        setStats(s)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        const msg = (err as Error).message
        if (msg === 'Autor no encontrado') setNotFound(true)
        else setError(msg)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  function flash(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
    load()
  }

  async function deleteBook(book: Book) {
    if (!confirm(`¿Eliminar el libro "${book.title}"?`)) return
    try {
      await api(`/api/books/${book.id}`, { method: 'DELETE' })
      flash('Libro eliminado correctamente')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function deleteAuthor() {
    if (!author) return
    if (!confirm(`¿Eliminar a "${author.name}" y todos sus libros?`)) return
    try {
      await api(`/api/authors/${author.id}`, { method: 'DELETE' })
      router.push('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loading) return <Spinner label="Cargando perfil" />

  if (notFound || !author) {
    return (
      <Card className="text-center">
        <p className="py-6 text-slate-400">
          {error || 'El autor no existe o fue eliminado.'}
        </p>
        <Link href="/" className="text-sm font-medium text-cyan-300 hover:underline">
          ← Volver al dashboard
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:text-cyan-300"
      >
        ← Volver a autores
      </Link>

      {/* Información completa del autor */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 font-mono text-2xl font-bold text-white shadow-[0_0_40px_-6px_rgba(168,85,247,0.9)]">
              {initials(author.name)}
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {author.name}
              </h1>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Email</dt>
                <dd className="break-all text-slate-200">{author.email}</dd>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Nacionalidad</dt>
                <dd className="text-slate-200">{author.nationality ?? '—'}</dd>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Nacimiento</dt>
                <dd className="text-slate-200">{author.birthYear ?? '—'}</dd>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Registrado</dt>
                <dd className="text-slate-200">
                  {new Date(author.createdAt).toLocaleDateString('es-PE')}
                </dd>
              </dl>
              {author.bio && (
                <p className="mt-4 max-w-2xl border-l-2 border-violet-400/50 pl-3 text-sm italic text-slate-300">
                  {author.bio}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setEditingAuthor(true)}>
              Editar autor
            </Button>
            <Button variant="danger" onClick={deleteAuthor}>
              Eliminar
            </Button>
          </div>
        </div>
      </Card>

      {message && <Alert kind="success">{message}</Alert>}
      {error && <Alert>{error}</Alert>}

      {/* Estadísticas del autor */}
      {stats && (
        <section>
          <SectionTitle>Estadísticas del autor</SectionTitle>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total de libros" value={stats.totalBooks} />
            <StatCard
              label="Primer libro"
              value={stats.firstBook?.year ?? '—'}
              hint={stats.firstBook?.title}
            />
            <StatCard
              label="Último libro"
              value={stats.latestBook?.year ?? '—'}
              hint={stats.latestBook?.title}
            />
            <StatCard label="Prom. páginas" value={stats.averagePages} />
            <StatCard
              label="Más largo"
              value={stats.longestBook ? `${stats.longestBook.pages}p` : '—'}
              hint={stats.longestBook?.title}
            />
            <StatCard
              label="Más corto"
              value={stats.shortestBook ? `${stats.shortestBook.pages}p` : '—'}
              hint={stats.shortestBook?.title}
            />
            <div className="glass animate-rise col-span-2 rounded-2xl p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Géneros ({stats.genres.length})
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.genres.length ? (
                  stats.genres.map((g) => <Badge key={g}>{g}</Badge>)
                ) : (
                  <span className="text-sm text-slate-500">Sin géneros</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Libros del autor */}
      <Card>
        <SectionTitle
          right={<Button onClick={() => setAddingBook(true)}>+ Agregar libro</Button>}
        >
          Libros ({author.books.length})
        </SectionTitle>
        {author.books.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Este autor aún no tiene libros.
          </p>
        ) : (
          <ul className="space-y-2">
            {author.books.map((b, i) => (
              <li
                key={b.id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-rise glow-hover flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-12 shrink-0 text-center font-mono text-sm text-cyan-300">
                    {b.publishedYear ?? '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-white">{b.title}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                      {b.pages ?? '—'} págs
                      {b.isbn && ` · ISBN ${b.isbn}`}
                    </p>
                  </div>
                  {b.genre && <Badge>{b.genre}</Badge>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => setEditingBook(b)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => deleteBook(b)}>
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editingAuthor && (
        <Modal title="Editar autor" onClose={() => setEditingAuthor(false)}>
          <AuthorForm
            author={author}
            onCancel={() => setEditingAuthor(false)}
            onSaved={() => {
              setEditingAuthor(false)
              flash('Autor actualizado correctamente')
            }}
          />
        </Modal>
      )}

      {addingBook && (
        <Modal
          title={`Nuevo libro de ${author.name}`}
          onClose={() => setAddingBook(false)}
        >
          <BookForm
            authors={[author]}
            fixedAuthorId={author.id}
            genres={stats?.genres}
            onCancel={() => setAddingBook(false)}
            onSaved={(b) => {
              setAddingBook(false)
              flash(`Libro "${b.title}" agregado`)
            }}
          />
        </Modal>
      )}

      {editingBook && (
        <Modal title="Editar libro" onClose={() => setEditingBook(null)}>
          <BookForm
            book={editingBook}
            authors={[author]}
            fixedAuthorId={author.id}
            genres={stats?.genres}
            onCancel={() => setEditingBook(null)}
            onSaved={() => {
              setEditingBook(null)
              flash('Libro actualizado correctamente')
            }}
          />
        </Modal>
      )}
    </div>
  )
}
