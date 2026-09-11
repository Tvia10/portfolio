import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Profile } from '../../types'

const INPUT =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none'

const BLANK = {
  full_name: '', headline: '', bio: '', email: '', location: '',
  github_url: '', linkedin_url: '', cv_url: '', avatar_url: '',
}

const FIELDS: [keyof typeof BLANK, string][] = [
  ['full_name', 'Full name'],
  ['headline', 'Headline (e.g. Full Stack Developer)'],
  ['email', 'Contact email'],
  ['location', 'Location'],
  ['github_url', 'GitHub URL'],
  ['linkedin_url', 'LinkedIn URL'],
  ['cv_url', 'CV URL'],
  ['avatar_url', 'Photo URL'],
]

export function ProfileAdmin() {
  const [form, setForm] = useState(BLANK)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get<Profile>('/api/profile')
      .then(({ id: _id, updated_at: _u, ...rest }) => setForm(rest))
      .catch(() => undefined) // no profile yet: it's created on first save
  }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    await api.put('/api/profile', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-3 rounded-xl border border-line bg-surface p-6">
      {FIELDS.map(([key, label]) => (
        <input
          key={key} placeholder={label} className={INPUT} value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}
      <textarea
        rows={5} placeholder="Bio" className={INPUT} value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <div className="flex items-center gap-4 pt-2">
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper">
          Save
        </button>
        {saved && <span className="text-sm text-ink">Saved ✓</span>}
      </div>
    </form>
  )
}
