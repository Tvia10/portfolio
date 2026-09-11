import { useState } from 'react'
import { ApiError, api } from '../lib/api'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const INPUT =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('sending')
    setError('')
    try {
      await api.post('/api/contact', {
        name: form.get('name'),
        email: form.get('email'),
        subject: form.get('subject'),
        message: form.get('message'),
        website: form.get('website'), // honeypot
      })
      setStatus('sent')
      event.currentTarget.reset()
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Too many messages in a row. Try again in a bit.'
          : "Couldn't send it. Email me directly instead.",
      )
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-lg font-semibold text-ink">Message sent!</p>
        <p className="mt-1 text-sm text-muted">I'll get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="name" required minLength={2} placeholder="Your name" className={INPUT} />
      <input name="email" type="email" required placeholder="Your email" className={INPUT} />
      <input name="subject" placeholder="Subject (optional)" className={`${INPUT} sm:col-span-2`} />
      <textarea
        name="message"
        required
        minLength={10}
        rows={5}
        placeholder="What's on your mind?"
        className={`${INPUT} sm:col-span-2 resize-y`}
      />

      {/* Honeypot: invisible to people, irresistible to bots. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending...' : 'Send message'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  )
}
