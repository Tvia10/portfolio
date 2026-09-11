from app.models import Certification, Education, Experience, Skill
from app.routers._crud import build_crud_router
from app.schemas import (
    CertificationCreate,
    CertificationOut,
    EducationCreate,
    EducationOut,
    ExperienceCreate,
    ExperienceOut,
    SkillCreate,
    SkillOut,
)

experience_router = build_crud_router(
    prefix="/api/experience",
    tag="experience",
    model=Experience,
    create_schema=ExperienceCreate,
    out_schema=ExperienceOut,
    # end_date NULL = trabajo actual, va primero.
    order_by=lambda: [Experience.position, Experience.end_date.desc().nullsfirst()],
    not_found="Experience not found",
)

education_router = build_crud_router(
    prefix="/api/education",
    tag="education",
    model=Education,
    create_schema=EducationCreate,
    out_schema=EducationOut,
    order_by=lambda: [Education.position, Education.end_date.desc().nullsfirst()],
    not_found="Education entry not found",
)

skills_router = build_crud_router(
    prefix="/api/skills",
    tag="skills",
    model=Skill,
    create_schema=SkillCreate,
    out_schema=SkillOut,
    order_by=lambda: [Skill.category, Skill.position, Skill.name],
    not_found="Skill not found",
)

certifications_router = build_crud_router(
    prefix="/api/certifications",
    tag="certifications",
    model=Certification,
    create_schema=CertificationCreate,
    out_schema=CertificationOut,
    order_by=lambda: [Certification.position, Certification.issued_date.desc()],
    not_found="Certification not found",
)
