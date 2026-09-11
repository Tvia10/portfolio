import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

export function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setLoading(true)
    setError('')
    try {
      await api.login(String(form.get('email')), String(form.get('password')))
      navigate('/admin')
    } catch {
      setError('Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8"
      >
        <h1 className="text-xl font-semibold text-ink">Admin panel</h1>
        <p className="mt-1 text-sm text-muted">Private access.</p>

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="username"
          className="mt-6 w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          className="mt-3 w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
