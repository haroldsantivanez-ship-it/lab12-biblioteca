'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import AuthorForm from '@/components/AuthorForm'
import {
  Alert,
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  SectionTitle,
  Spinner,
  StatCard,
  linkButtonClass,
} from '@/components/ui'
import { api } from '@/lib/api'
import type { Author, AuthorWithCount, GeneralStats } from '@/lib/types'

// Iniciales para el avatar del autor
const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// Dashboard inicial: crear, listar, editar y eliminar autores + estadísticas generales
export default function DashboardPage() {
  const [authors, setAuthors] = useState<AuthorWithCount[]>([])
  const [stats, setStats] = useState<GeneralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<Author | null>(null)

  // Cambiar reloadKey vuelve a pedir los datos a la API
  const [reloadKey, setReloadKey] = useState(0)
  const load = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<AuthorWithCount[]>('/api/authors'),
      api<GeneralStats>('/api/stats'),
    ])
      .then(([a, s]) => {
        if (cancelled) return
        setAuthors(a)
        setStats(s)
        setError('')
      })
      .catch((err) => !cancelled && setError((err as Error).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function flash(text: string) {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handleDelete(author: AuthorWithCount) {
    const extra = author._count.books
      ? ` y sus ${author._count.books} libro(s)`
      : ''
    if (!confirm(`¿Eliminar a "${author.name}"${extra}?`)) return
    try {
      await api(`/api/authors/${author.id}`, { method: 'DELETE' })
      flash('Autor eliminado correctamente')
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const maxGenreCount = Math.max(1, ...(stats?.genres.map((g) => g.count) ?? []))
  const topGenre = stats?.genres.find((g) => g.count === maxGenreCount)

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <>
            Dashboard de <span className="neon-text">autores</span>
          </>
        }
      />

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Autores" value={stats?.totalAuthors ?? '—'} />
        <StatCard label="Libros" value={stats?.totalBooks ?? '—'} />
        <StatCard
          label="Géneros"
          value={stats?.totalGenres ?? '—'}
          hint={topGenre ? `Top: ${topGenre.genre}` : undefined}
        />
        <StatCard
          label="Prom. páginas"
          value={stats ? stats.averagePages : '—'}
        />
      </div>

      {stats && stats.genres.length > 0 && (
        <Card>
          <SectionTitle>Distribución por género</SectionTitle>
          <div className="space-y-3">
            {stats.genres.map((g) => (
              <div key={g.genre} className="flex items-center gap-4 text-sm">
                <span className="w-24 shrink-0 truncate text-slate-300">
                  {g.genre}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_14px_rgba(168,85,247,0.7)] transition-[width] duration-700"
                    style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-cyan-200">
                  {g.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Crear autor */}
        <Card className="h-fit">
          <SectionTitle>Nuevo autor</SectionTitle>
          <AuthorForm
            onSaved={(a) => {
              flash(`Autor "${a.name}" creado`)
              load()
            }}
          />
        </Card>

        {/* Lista de autores */}
        <Card>
          <SectionTitle
            right={
              <span className="font-mono text-xs text-slate-500">
                {authors.length} registro(s)
              </span>
            }
          >
            Autores
          </SectionTitle>
          <div className="space-y-3">
            {message && <Alert kind="success">{message}</Alert>}
            {error && <Alert>{error}</Alert>}
          </div>

          {loading ? (
            <Spinner label="Sincronizando autores" />
          ) : authors.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Aún no hay autores. Crea el primero con el formulario.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {authors.map((a, i) => (
                <li
                  key={a.id}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-rise glow-hover flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-cyan-500/20 to-violet-500/25 font-mono text-sm font-semibold text-cyan-100">
                      {initials(a.name)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/authors/${a.id}`}
                        className="font-medium text-white transition hover:text-cyan-300"
                      >
                        {a.name}
                      </Link>
                      <p className="truncate text-xs text-slate-400">
                        {a.email}
                        {a.nationality && ` · ${a.nationality}`}
                        {a.birthYear && ` · ${a.birthYear}`}
                      </p>
                      <div className="mt-1">
                        <Badge>{a._count.books} libro(s)</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/books?authorId=${a.id}`} className={linkButtonClass}>
                      Ver libros
                    </Link>
                    <Button variant="secondary" onClick={() => setEditing(a)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(a)}>
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {editing && (
        <Modal title="Editar autor" onClose={() => setEditing(null)}>
          <AuthorForm
            author={editing}
            onCancel={() => setEditing(null)}
            onSaved={(a) => {
              setEditing(null)
              flash(`Autor "${a.name}" actualizado`)
              load()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
