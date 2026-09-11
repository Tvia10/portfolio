import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import type { ContactMessage } from '../../types'

export function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  useEffect(() => {
    api.get<ContactMessage[]>('/api/contact/messages').then(setMessages)
  }, [])

  async function markRead(id: number) {
    const updated = await api.patch<ContactMessage>(`/api/contact/messages/${id}/read`)
    setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
  }

  async function remove(id: number) {
    await api.del(`/api/contact/messages/${id}`)
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  if (messages.length === 0) {
    return <p className="text-sm text-muted">No messages yet.</p>
  }

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li
          key={message.id}
          className={`rounded-2xl border p-5 ${
            message.is_read ? 'border-line bg-surface' : 'border-ink/30 bg-surface-2'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-ink">
                {message.name}{' '}
                <a href={`mailto:${message.email}`} className="text-sm font-normal text-muted hover:text-ink">
                  &lt;{message.email}&gt;
                </a>
              </p>
              {message.subject && <p className="text-sm text-muted">{message.subject}</p>}
            </div>
            <span className="text-xs text-muted">{formatDateTime(message.created_at)}</span>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">
            {message.message}
          </p>

          <div className="mt-4 flex gap-4 text-xs">
            {!message.is_read && (
              <button onClick={() => markRead(message.id)} className="text-ink underline hover:opacity-70">
                Mark as read
              </button>
            )}
            <button onClick={() => remove(message.id)} className="text-muted hover:text-red-600">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
