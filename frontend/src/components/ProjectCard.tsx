import { Link } from 'react-router-dom'
import { gradientFor } from '../lib/gradient'
import type { Project } from '../types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-line"
    >
      <div
        className="absolute inset-0 scale-100 transition-transform duration-500 group-hover:scale-105"
        style={{ background: gradientFor(project.slug) }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {project.featured && (
        <span className="absolute right-4 top-4 rounded-full border border-accent/50 bg-black/40 px-2.5 py-1 text-xs font-medium text-accent backdrop-blur">
          Featured
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-2xl font-bold tracking-tight text-white">{project.title}</h3>
        {project.tech_stack[0] && (
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">{project.tech_stack[0]}</p>
        )}
      </div>
    </Link>
  )
}
