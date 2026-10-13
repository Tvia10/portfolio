import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { gradientFor } from '../lib/gradient'
import type { Project } from '../types'

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api
      .get<Project>(`/api/projects/${slug}`)
      .then(setProject)
      .catch(() => setNotFound(true))
  }, [slug])

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-muted">This project doesn't exist.</p>
        <Link to="/" className="mt-4 inline-block text-ink underline hover:opacity-70">
          ← Back home
        </Link>
      </div>
    )
  }

  if (!project) {
    return <div className="px-5 py-24 text-center text-muted">Loading…</div>
  }

  return (
    <article>
      <div
        className="flex aspect-[3/1] w-full items-end"
        style={{ background: gradientFor(project.slug) }}
      >
        <div className="mx-auto w-full max-w-3xl px-5 pb-8">
          <Link to="/#projects" className="text-sm text-white/70 hover:text-white">
            ← Projects
          </Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-lg text-muted">{project.summary}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-4 text-sm">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-accent px-5 py-2.5 font-semibold text-paper hover:opacity-85"
            >
              View live ↗
            </a>
          )}
          {project.repo_url && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-line px-5 py-2.5 font-semibold text-ink hover:border-accent hover:text-accent"
            >
              Code ↗
            </a>
          )}
        </div>

        {project.description && (
          <div className="mt-10 whitespace-pre-line leading-relaxed text-ink">
            {project.description}
          </div>
        )}
      </div>
    </article>
  )
}
