export interface Profile {
  id: number
  full_name: string
  headline: string
  bio: string
  email: string
  location: string
  github_url: string
  linkedin_url: string
  cv_url: string
  avatar_url: string
  updated_at: string
}

export interface Project {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  tech_stack: string[]
  repo_url: string
  live_url: string
  image_url: string
  featured: boolean
  position: number
  created_at: string
}

export interface Experience {
  id: number
  company: string
  role: string
  location: string
  start_date: string
  end_date: string | null
  description: string
  position: number
}

export interface Education {
  id: number
  institution: string
  degree: string
  start_date: string
  end_date: string | null
  description: string
  position: number
}

export interface Skill {
  id: number
  name: string
  category: string
  level: number
  position: number
}

export interface Certification {
  id: number
  name: string
  issuer: string
  issued_date: string
  credential_id: string
  credential_url: string
  description: string
  position: number
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}
