import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Certification } from '../../types'

const INPUT =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none'

const BLANK = {
  name: '', issuer: '', issued_date: '', credential_id: '',
  credential_url: '', description: '', position: 0,
}

type FormState = typeof BLANK

function toForm(cert: Certification): FormState {
  return { ...cert }
}

export function CertificationsAdmin() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(BLANK)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Certification[]>('/api/certifications').then(setCertifications)
  }, [])

  function reset() {
    setEditing(null)
    setForm(BLANK)
    setError('')
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const payload = { ...form, position: Number(form.position) }
    try {
      if (editing === null) {
        const created = await api.post<Certification>('/api/certifications', payload)
        setCertifications((prev) => [...prev, created])
      } else {
        const updated = await api.put<Certification>(`/api/certifications/${editing}`, payload)
        setCertifications((prev) => prev.map((c) => (c.id === editing ? updated : c)))
      }
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    }
  }

  async function remove(id: number) {
    await api.del(`/api/certifications/${id}`)
    setCertifications((prev) => prev.filter((c) => c.id !== id))
    if (editing === id) reset()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Certifications
        </h3>
        <ul className="space-y-2">
          {certifications.map((cert) => (
            <li
              key={cert.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{cert.name}</p>
                <p className="truncate text-xs text-muted">{cert.issuer}</p>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                <button
                  onClick={() => {
                    setEditing(cert.id)
                    setForm(toForm(cert))
                  }}
                  className="text-ink underline hover:opacity-70"
                >
                  Edit
                </button>
                <button onClick={() => remove(cert.id)} className="text-muted hover:text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {editing === null ? 'New certification' : 'Editing certification'}
        </h3>

        <input
          required placeholder="Name (e.g. Cybersecurity Foundations Bootcamp)" className={INPUT}
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required placeholder="Issuer" className={INPUT} value={form.issuer}
          onChange={(e) => setForm({ ...form, issuer: e.target.value })}
        />
        <label className="block text-xs text-muted">
          Issued date
          <input
            required type="date" className={`${INPUT} mt-1`} value={form.issued_date}
            onChange={(e) => setForm({ ...form, issued_date: e.target.value })}
          />
        </label>
        <input
          placeholder="Credential ID" className={INPUT} value={form.credential_id}
          onChange={(e) => setForm({ ...form, credential_id: e.target.value })}
        />
        <input
          placeholder="Verification URL" className={INPUT} value={form.credential_url}
          onChange={(e) => setForm({ ...form, credential_url: e.target.value })}
        />
        <textarea
          rows={4} placeholder="Description (modules covered, etc.)" className={INPUT}
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm text-ink">
          Order
          <input
            type="number" className={`${INPUT} w-20`} value={form.position}
            onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper">
            Save
          </button>
          {editing !== null && (
            <button type="button" onClick={reset} className="text-sm text-muted hover:text-ink">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
