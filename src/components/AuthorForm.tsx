'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Author } from '@/lib/types'
import { Alert, Button, Field, inputClass } from './ui'

// Formulario para crear (POST /api/authors) o editar (PUT /api/authors/[id]) un autor
export default function AuthorForm({
  author,
  onSaved,
  onCancel,
}: {
  author?: Author
  onSaved: (author: Author) => void
  onCancel?: () => void
}) {
  const [form, setForm] = useState({
    name: author?.name ?? '',
    email: author?.email ?? '',
    nationality: author?.nationality ?? '',
    birthYear: author?.birthYear?.toString() ?? '',
    bio: author?.bio ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        nationality: form.nationality.trim() || null,
        birthYear: form.birthYear || null,
        bio: form.bio.trim() || null,
      }
      const saved = author
        ? await api<Author>(`/api/authors/${author.id}`, { method: 'PUT', body })
        : await api<Author>('/api/authors', { method: 'POST', body })
      if (!author) {
        setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' })
      }
      onSaved(saved)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre *">
        <input
          className={inputClass}
          value={form.name}
          onChange={set('name')}
          required
          placeholder="Gabriel García Márquez"
        />
      </Field>
      <Field label="Email *">
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={set('email')}
          required
          placeholder="gabo@example.com"
        />
      </Field>
      <Field label="Nacionalidad">
        <input
          className={inputClass}
          value={form.nationality}
          onChange={set('nationality')}
          placeholder="Colombia"
        />
      </Field>
      <Field label="Año de nacimiento">
        <input
          className={inputClass}
          type="number"
          min={1}
          max={2100}
          value={form.birthYear}
          onChange={set('birthYear')}
          placeholder="1927"
        />
      </Field>
      <Field label="Biografía" className="sm:col-span-2">
        <textarea
          className={inputClass}
          rows={3}
          value={form.bio}
          onChange={set('bio')}
          placeholder="Premio Nobel de Literatura 1982"
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
          {saving ? 'Guardando...' : author ? 'Guardar cambios' : 'Crear autor'}
        </Button>
      </div>
    </form>
  )
}
