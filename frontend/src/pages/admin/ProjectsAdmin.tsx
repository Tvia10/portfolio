import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Project } from '../../types'

const INPUT =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none'

const BLANK = {
  slug: '', title: '', summary: '', description: '', tech_stack: '',
  repo_url: '', live_url: '', image_url: '', featured: false, position: 0,
}

type FormState = typeof BLANK

function toForm(project: Project): FormState {
  return { ...project, tech_stack: project.tech_stack.join(', ') }
}

export function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(BLANK)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Project[]>('/api/projects').then(setProjects)
  }, [])

  function reset() {
    setEditing(null)
    setForm(BLANK)
    setError('')
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const payload = {
      ...form,
      position: Number(form.position),
      tech_stack: form.tech_stack.split(',').map((t) => t.trim()).filter(Boolean),
    }
    try {
      if (editing === null) {
        const created = await api.post<Project>('/api/projects', payload)
        setProjects((prev) => [...prev, created])
      } else {
        const updated = await api.put<Project>(`/api/projects/${editing}`, payload)
        setProjects((prev) => prev.map((p) => (p.id === editing ? updated : p)))
      }
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    }
  }

  async function remove(id: number) {
    await api.del(`/api/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (editing === id) reset()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Projects
        </h3>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{project.title}</p>
                <p className="truncate text-xs text-muted">/{project.slug}</p>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                <button
                  onClick={() => {
                    setEditing(project.id)
                    setForm(toForm(project))
                  }}
                  className="text-ink underline hover:opacity-70"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(project.id)}
                  className="text-muted hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="space-y-3 rounded-xl border border-line bg-surface p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {editing === null ? 'New project' : 'Editing project'}
        </h3>

        <input
          required placeholder="project-slug" className={INPUT} value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <input
          required placeholder="Title" className={INPUT} value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Short summary" className={INPUT} value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <textarea
          rows={4} placeholder="Long description" className={INPUT} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Tech stack, comma separated" className={INPUT} value={form.tech_stack}
          onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
        />
        <input
          placeholder="Repo URL" className={INPUT} value={form.repo_url}
          onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
        />
        <input
          placeholder="Live URL" className={INPUT} value={form.live_url}
          onChange={(e) => setForm({ ...form, live_url: e.target.value })}
        />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            Order
            <input
              type="number" className={`${INPUT} w-20`} value={form.position}
              onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
            />
          </label>
        </div>

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
