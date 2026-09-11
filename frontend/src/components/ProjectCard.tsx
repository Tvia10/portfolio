import { Link } from 'react-router-dom'
import type { Project } from '../types'

/** Deterministic string hash → a pair of hues, so a project always gets the
 *  same gradient across renders and reloads (no image asset needed). */
function gradientFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const h1 = Math.abs(hash) % 360
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1} 30% 16%), hsl(${h2} 35% 8%))`
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
    >
      <div
        className="absolute inset-0 scale-100 transition-transform duration-500 group-hover:scale-105"
        style={{ background: gradientFor(project.slug) }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {project.featured && (
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink">
          Featured
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-2xl font-bold tracking-tight text-white">{project.title}</h3>
        {project.tech_stack[0] && (
          <p className="mt-1 text-sm text-white/70">{project.tech_stack[0]}</p>
        )}
      </div>
    </Link>
  )
}
