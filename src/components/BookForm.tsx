'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Author, Book } from '@/lib/types'
import { Alert, Button, Field, inputClass } from './ui'

// Formulario para crear (POST /api/books) o editar (PUT /api/books/[id]) un libro.
// Si se pasa fixedAuthorId, el autor queda fijo (para "agregar libro a este autor").
export default function BookForm({
  book,
  authors,
  fixedAuthorId,
  genres = [],
  onSaved,
  onCancel,
}: {
  book?: Book
  authors: Pick<Author, 'id' | 'name'>[]
  fixedAuthorId?: string
  genres?: string[]
  onSaved: (book: Book) => void
  onCancel?: () => void
}) {
  const empty = {
    title: '',
    authorId: fixedAuthorId ?? '',
    genre: '',
    publishedYear: '',
    pages: '',
    isbn: '',
    description: '',
  }
  const [form, setForm] = useState(
    book
      ? {
          title: book.title,
          authorId: book.authorId,
          genre: book.genre ?? '',
          publishedYear: book.publishedYear?.toString() ?? '',
          pages: book.pages?.toString() ?? '',
          isbn: book.isbn ?? '',
          description: book.description ?? '',
        }
      : empty
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title.trim(),
        authorId: form.authorId,
        genre: form.genre.trim() || null,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
        pages: form.pages ? Number(form.pages) : null,
        isbn: form.isbn.trim() || null,
        description: form.description.trim() || null,
      }
      const saved = book
        ? await api<Book>(`/api/books/${book.id}`, { method: 'PUT', body })
        : await api<Book>('/api/books', { method: 'POST', body })
      if (!book) setForm(empty)
      onSaved(saved)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Título *" className="sm:col-span-2">
        <input
          className={inputClass}
          value={form.title}
          onChange={set('title')}
          required
          minLength={3}
          placeholder="Cien años de soledad"
        />
      </Field>
      <Field label="Autor *">
        <select
          className={inputClass}
          value={form.authorId}
          onChange={set('authorId')}
          required
          disabled={!!fixedAuthorId}
        >
          <option value="">Selecciona un autor</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Género">
        <input
          className={inputClass}
          value={form.genre}
          onChange={set('genre')}
          list="genre-options"
          placeholder="Novela"
        />
        <datalist id="genre-options">
          {genres.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </Field>
      <Field label="Año de publicación">
        <input
          className={inputClass}
          type="number"
          min={1}
          max={2100}
          value={form.publishedYear}
          onChange={set('publishedYear')}
          placeholder="1967"
        />
      </Field>
      <Field label="Páginas">
        <input
          className={inputClass}
          type="number"
          min={1}
          value={form.pages}
          onChange={set('pages')}
          placeholder="417"
        />
      </Field>
      <Field label="ISBN" className="sm:col-span-2">
        <input
          className={inputClass}
          value={form.isbn}
          onChange={set('isbn')}
          placeholder="978-0307474728"
        />
      </Field>
      <Field label="Descripción" className="sm:col-span-2">
        <textarea
          className={inputClass}
          rows={2}
          value={form.description}
          onChange={set('description')}
        />
      </Field>
      {error && (
        <div className="sm:col-span-2">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="flex justify-end gap-2 sm:col-span-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : book ? 'Guardar cambios' : 'Crear libro'}
        </Button>
      </div>
    </form>
  )
}
