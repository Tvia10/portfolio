from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Auth -------------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(ORMModel):
    id: int
    email: EmailStr


# --- Profile ----------------------------------------------------------------
class ProfileBase(BaseModel):
    full_name: str = Field(max_length=120)
    headline: str = Field(max_length=200)
    bio: str = ""
    email: str = ""
    location: str = ""
    github_url: str = ""
    linkedin_url: str = ""
    cv_url: str = ""
    avatar_url: str = ""


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ORMModel, ProfileBase):
    id: int
    updated_at: datetime


# --- Project ----------------------------------------------------------------
class ProjectBase(BaseModel):
    slug: str = Field(max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(max_length=160)
    summary: str = ""
    description: str = ""
    tech_stack: list[str] = []
    repo_url: str = ""
    live_url: str = ""
    image_url: str = ""
    featured: bool = False
    position: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectOut(ORMModel, ProjectBase):
    id: int
    created_at: datetime


# --- Experience -------------------------------------------------------------
class ExperienceBase(BaseModel):
    company: str = Field(max_length=160)
    role: str = Field(max_length=160)
    location: str = ""
    start_date: date
    end_date: date | None = None
    description: str = ""
    position: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceOut(ORMModel, ExperienceBase):
    id: int


# --- Education --------------------------------------------------------------
class EducationBase(BaseModel):
    institution: str = Field(max_length=200)
    degree: str = Field(max_length=200)
    start_date: date
    end_date: date | None = None
    description: str = ""
    position: int = 0


class EducationCreate(EducationBase):
    pass


class EducationOut(ORMModel, EducationBase):
    id: int


# --- Skill ------------------------------------------------------------------
class SkillBase(BaseModel):
    name: str = Field(max_length=80)
    category: str = "otros"
    level: int = Field(default=3, ge=1, le=5)
    position: int = 0


class SkillCreate(SkillBase):
    pass


class SkillOut(ORMModel, SkillBase):
    id: int


# --- Certification ------------------------------------------------------------
class CertificationBase(BaseModel):
    name: str = Field(max_length=160)
    issuer: str = Field(max_length=160)
    issued_date: date
    credential_id: str = ""
    credential_url: str = ""
    description: str = ""
    position: int = 0


class CertificationCreate(CertificationBase):
    pass


class CertificationOut(ORMModel, CertificationBase):
    id: int


# --- Contacto ---------------------------------------------------------------
class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    # Honeypot: los bots la completan, las personas no. Debe llegar vacia.
    website: str = ""


class ContactOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    subject: str
    message: str
    is_read: bool
    created_at: datetime
