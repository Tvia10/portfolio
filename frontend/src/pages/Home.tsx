import { useEffect, useState } from 'react'
import { ContactForm } from '../components/ContactForm'
import { Nav } from '../components/Nav'
import { ProjectCard } from '../components/ProjectCard'
import { Section } from '../components/Section'
import { Timeline } from '../components/Timeline'
import { api } from '../lib/api'
import { formatMonth } from '../lib/format'
import type { Certification, Education, Experience, Profile, Project, Skill } from '../types'

interface Data {
  profile: Profile | null
  projects: Project[]
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  certifications: Certification[]
}

const EMPTY: Data = {
  profile: null,
  projects: [],
  experience: [],
  education: [],
  skills: [],
  certifications: [],
}

// A few headline specialties pulled straight from the real skill set, shown
// as small tags in the hero — not every skill, just the top-level pitch.
const SPECIALTIES = ['Backend Development', 'Frontend Development', 'AI Automation']

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

function earliestYear(...lists: { start_date: string }[][]): number | null {
  const years = lists.flat().map((item) => Number(item.start_date.slice(0, 4)))
  return years.length ? Math.min(...years) : null
}

export function Home() {
  const [data, setData] = useState<Data>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      // Profile may not exist yet (freshly created database): don't break the page.
      api.get<Profile>('/api/profile').catch(() => null),
      api.get<Project[]>('/api/projects').catch(() => []),
      api.get<Experience[]>('/api/experience').catch(() => []),
      api.get<Education[]>('/api/education').catch(() => []),
      api.get<Skill[]>('/api/skills').catch(() => []),
      api.get<Certification[]>('/api/certifications').catch(() => []),
    ])
      .then(([profile, projects, experience, education, skills, certifications]) =>
        setData({ profile, projects, experience, education, skills, certifications }),
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>
  }

  const { profile, projects, experience, education, skills, certifications } = data
  const categories = [...new Set(skills.map((s) => s.category))]
  // Career span (for the Projects header) counts only work experience — using
  // education here would misleadingly stretch it back to high school.
  const careerStartYear = earliestYear(experience)
  const yearsRange = careerStartYear ? `${careerStartYear}–${new Date().getFullYear()}` : undefined
  // "Years learning" is anchored to the degree currently in progress (no
  // end_date) rather than the earliest schooling on record — otherwise
  // finished, unrelated studies (e.g. high school) would inflate the count.
  const ongoingEducation = education.filter((e) => !e.end_date)
  const studyStartYear = earliestYear(ongoingEducation.length ? ongoingEducation : education)

  return (
    <>
      <Nav name={profile?.full_name ?? 'Portfolio'} location={profile?.location} />

      {/* Hero */}
      <section id="home" className="mx-auto w-full max-w-5xl px-5 pt-16 pb-20 sm:pt-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-7xl">
            {profile?.full_name ?? 'Your name'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted sm:text-xl">{profile?.headline}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-85"
            >
              Get in touch
            </a>
            {profile?.cv_url && (
              <a
                href={profile.cv_url}
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                Download CV
              </a>
            )}
            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-muted hover:text-ink"
              >
                GitHub ↗
              </a>
            )}
            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-muted hover:text-ink"
              >
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>

        <div className="mx-auto mt-16 aspect-square w-56 overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-sm sm:w-64">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-muted">
              {initials(profile?.full_name ?? '?')}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <ul className="flex flex-col gap-2">
            {SPECIALTIES.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-ink">
                <span className="flex items-end gap-[2px]" aria-hidden="true">
                  <span className="h-1.5 w-[3px] bg-ink" />
                  <span className="h-2.5 w-[3px] bg-ink" />
                  <span className="h-2 w-[3px] bg-ink" />
                </span>
                {s}
              </li>
            ))}
          </ul>

          {profile?.bio && (
            <p className="max-w-sm text-sm leading-relaxed text-muted sm:text-right">
              {profile.bio}
            </p>
          )}
        </div>
      </section>

      <Section id="projects" title="Selected Projects" eyebrow={yearsRange} subtitle="Things I've built and shipped to production.">
        <div className="grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Section>

      <Section id="skills" title="Skills">
        <div className="flex flex-wrap gap-3">
          {categories.flatMap((category) =>
            skills
              .filter((s) => s.category === category)
              .map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-ink"
                >
                  {skill.name}
                </span>
              )),
          )}
        </div>
      </Section>

      <Section id="experience" title="Experience & education">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Experience
            </h3>
            <Timeline
              items={experience.map((e) => ({
                id: e.id,
                title: e.role,
                place: e.company,
                start_date: e.start_date,
                end_date: e.end_date,
                description: e.description,
              }))}
            />
          </div>
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Education
            </h3>
            <Timeline
              items={education.map((e) => ({
                id: e.id,
                title: e.degree,
                place: e.institution,
                start_date: e.start_date,
                end_date: e.end_date,
                description: e.description,
              }))}
            />
          </div>
        </div>
      </Section>

      {certifications.length > 0 && (
        <Section id="certifications" title="Certifications">
          <div className="grid gap-5 sm:grid-cols-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-ink">{cert.name}</h3>
                    <p className="text-sm text-muted">{cert.issuer}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatMonth(cert.issued_date)}
                  </span>
                </div>

                {cert.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{cert.description}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                  {cert.credential_id && (
                    <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono">
                      {cert.credential_id}
                    </span>
                  )}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-ink underline hover:opacity-70"
                    >
                      Verify ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Stats strip: only real, honest numbers — no invented client/revenue metrics. */}
      <section className="mx-auto w-full max-w-5xl px-5">
        <div className="grid grid-cols-2 gap-8 border-y border-line py-10 sm:grid-cols-4">
          {[
            { value: projects.length, label: 'Projects shipped' },
            { value: experience.length, label: 'Internships' },
            { value: skills.length, label: 'Technologies' },
            studyStartYear
              ? { value: new Date().getFullYear() - studyStartYear, label: 'Years learning' }
              : null,
          ]
            .filter((s): s is { value: number; label: string } => s !== null)
            .map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold tracking-tight text-ink">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Contact — the one section that gets the oversized "Let's talk" treatment. */}
      <section id="contact" className="mx-auto w-full max-w-5xl px-5 py-24">
        <div className="flex items-center justify-between gap-6">
          <h2 className="text-5xl font-bold tracking-tight text-ink sm:text-7xl">Let's talk</h2>
          <span className="hidden text-5xl text-ink sm:block" aria-hidden="true">
            →
          </span>
        </div>
        <p className="mt-4 max-w-md text-muted">Got a role or a project in mind? Send me a message.</p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-14 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">{profile?.full_name}</p>
            <p className="mt-2 text-sm text-muted">
              Ready to bring your ideas to life?
              <br />
              Let's start the conversation.
            </p>
            {profile?.location && <p className="mt-4 text-sm text-muted">{profile.location}</p>}
          </div>

          <div>
            <p className="text-sm text-muted">Menu</p>
            <ul className="mt-3 space-y-1">
              {[
                { href: '#home', label: 'Home' },
                { href: '#projects', label: 'Projects' },
                { href: '#experience', label: 'Experience' },
                { href: '#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-lg font-semibold text-ink hover:opacity-70">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-muted">Contact</p>
            <ul className="mt-3 space-y-1">
              {profile?.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="text-sm text-ink hover:opacity-70">
                    {profile.email}
                  </a>
                </li>
              )}
              {profile?.linkedin_url && (
                <li>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-ink hover:opacity-70"
                  >
                    LinkedIn ↗
                  </a>
                </li>
              )}
              {profile?.github_url && (
                <li>
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-ink hover:opacity-70"
                  >
                    GitHub ↗
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs text-muted">
            <span>
              © {new Date().getFullYear()} {profile?.full_name}
            </span>
            <span>Built with FastAPI and React.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
