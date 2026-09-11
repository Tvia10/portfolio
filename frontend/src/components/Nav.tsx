import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact', label: 'Contact' },
]

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone,
          }).format(new Date()),
        )
      } catch {
        setTime('')
      }
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [timeZone])

  return time
}

export function Nav({ name, location }: { name: string; location?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const time = useLocalTime('America/Argentina/Mendoza')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the full-screen menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors ${
          scrolled ? 'border-b border-line bg-paper/85 backdrop-blur' : 'border-b border-transparent'
        }`}
      >
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <a href="#home" className="font-semibold tracking-tight text-ink">
            {name}
          </a>

          <div className="hidden items-center gap-2 text-sm text-muted sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Open to work
          </div>

          <div className="hidden items-center gap-2 text-sm text-muted md:flex">
            {location && <span>{location}</span>}
            {time && (
              <>
                <span className="opacity-40">·</span>
                <span>{time}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-ink"
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            Menu
            <span className="flex flex-col gap-[3px]">
              <span className="h-[1.5px] w-4 bg-ink" />
              <span className="h-[1.5px] w-4 bg-ink" />
            </span>
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
            <span className="font-semibold tracking-tight text-ink">{name}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-ink"
              aria-label="Close menu"
            >
              Close ✕
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-3 px-5">
            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
              className="text-5xl font-bold tracking-tight text-ink transition-opacity hover:opacity-60 sm:text-7xl"
            >
              Home
            </a>
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-5xl font-bold tracking-tight text-ink transition-opacity hover:opacity-60 sm:text-7xl"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
