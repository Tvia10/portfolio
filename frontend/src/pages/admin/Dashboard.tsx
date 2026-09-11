import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../../lib/api'
import { CertificationsAdmin } from './CertificationsAdmin'
import { Messages } from './Messages'
import { ProfileAdmin } from './ProfileAdmin'
import { ProjectsAdmin } from './ProjectsAdmin'

const TABS = [
  { id: 'messages', label: 'Messages' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'profile', label: 'Profile' },
] as const

type TabId = (typeof TABS)[number]['id']

export function Dashboard() {
  const [tab, setTab] = useState<TabId>('messages')
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <div className="flex gap-5 text-sm">
          <Link to="/" className="text-muted hover:text-ink">
            View site ↗
          </Link>
          <button onClick={logout} className="text-muted hover:text-red-600">
            Log out
          </button>
        </div>
      </div>

      <nav className="mt-8 flex gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              tab === item.id
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === 'messages' && <Messages />}
        {tab === 'projects' && <ProjectsAdmin />}
        {tab === 'certifications' && <CertificationsAdmin />}
        {tab === 'profile' && <ProfileAdmin />}
      </div>
    </div>
  )
}
