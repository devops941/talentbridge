# Phase 04: Database Design & Schema Development

## 1. Objectives
- Establish the PostgreSQL relational schema using SQLAlchemy ORM and Alembic migrations.
- Implement foreign key constraints, indexes on lookup fields, cascade policies, and audit timestamps.
- Provide initial seed scripts for roles, permissions, admin user, and initial skill taxonomy.

## 2. Generate Schema Definition
Run the following PowerShell command to create `backend\app\models\entities.py`:

```powershell
Set-Content -Path "backend\app\models\entities.py" -Value @"
from datetime import datetime
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False) # ADMIN, HR_RECRUITER, HR_MANAGER
    description = Column(String(255))
    users = relationship('User', back_populates='role')

class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    status = Column(String(20), default='ACTIVE') # ACTIVE, DISABLED
    created_at = Column(DateTime, default=datetime.utcnow)
    role = relationship('Role', back_populates='users')

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True, autoincrement=True)
    canonical_name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default='Technical')
    active = Column(Boolean, default=True)
    aliases = relationship('SkillAlias', back_populates='skill', cascade='all, delete-orphan')

class SkillAlias(Base):
    __tablename__ = 'skill_aliases'
    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    alias = Column(String(100), unique=True, index=True, nullable=False)
    skill = relationship('Skill', back_populates='aliases')

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(150), index=True, nullable=False)
    department = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    experience_min = Column(Integer, default=0)
    experience_max = Column(Integer, default=10)
    location = Column(String(100), default='Remote')
    status = Column(String(20), default='DRAFT') # DRAFT, PUBLISHED, ARCHIVED
    created_by = Column(String(36), ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    skills = relationship('JobSkill', back_populates='job', cascade='all, delete-orphan')
    applications = relationship('Application', back_populates='job')

class JobSkill(Base):
    __tablename__ = 'job_skills'
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(36), ForeignKey('jobs.id'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    requirement_type = Column(String(20), default='REQUIRED') # REQUIRED, PREFERRED
    importance_weight = Column(Float, default=1.0)
    job = relationship('Job', back_populates='skills')
    skill = relationship('Skill')

class Candidate(Base):
    __tablename__ = 'candidates'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    location = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    resumes = relationship('Resume', back_populates='candidate')
    applications = relationship('Application', back_populates='candidate')

class Resume(Base):
    __tablename__ = 'resumes'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidates.id'), nullable=False)
    storage_key = Column(String(255), unique=True, nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(50), default='application/pdf')
    file_size = Column(Integer, nullable=False)
    checksum = Column(String(64), index=True, nullable=False)
    parse_status = Column(String(20), default='UPLOADED') # UPLOADED, PROCESSING, COMPLETED, PARTIAL, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    candidate = relationship('Candidate', back_populates='resumes')
    extraction = relationship('ResumeExtraction', back_populates='resume', uselist=False)
    skills = relationship('ResumeSkill', back_populates='resume', cascade='all, delete-orphan')

class ResumeExtraction(Base):
    __tablename__ = 'resume_extractions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(String(36), ForeignKey('resumes.id'), unique=True, nullable=False)
    extracted_text = Column(Text, nullable=False)
    extracted_at = Column(DateTime, default=datetime.utcnow)
    parser_version = Column(String(20), default='v1.0')
    resume = relationship('Resume', back_populates='extraction')

class ResumeSkill(Base):
    __tablename__ = 'resume_skills'
    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(String(36), ForeignKey('resumes.id'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    evidence_text = Column(String(255))
    confidence = Column(Float, default=1.0)
    resume = relationship('Resume', back_populates='skills')
    skill = relationship('Skill')

class Application(Base):
    __tablename__ = 'applications'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidates.id'), nullable=False)
    job_id = Column(String(36), ForeignKey('jobs.id'), nullable=False)
    resume_id = Column(String(36), ForeignKey('resumes.id'), nullable=False)
    current_stage = Column(String(40), default='Application Received')
    applied_at = Column(DateTime, default=datetime.utcnow)
    candidate = relationship('Candidate', back_populates='applications')
    job = relationship('Job', back_populates='applications')
    resume = relationship('Resume')
    match_results = relationship('MatchResult', back_populates='application')

class MatchResult(Base):
    __tablename__ = 'match_results'
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(36), ForeignKey('applications.id'), nullable=False)
    score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    text_score = Column(Float, nullable=False)
    model_version = Column(String(20), default='baseline-v1')
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    application = relationship('Application', back_populates='match_results')
    skill_details = relationship('MatchSkillDetail', back_populates='match_result')

class MatchSkillDetail(Base):
    __tablename__ = 'match_skill_details'
    id = Column(Integer, primary_key=True, autoincrement=True)
    match_result_id = Column(Integer, ForeignKey('match_results.id'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skills.id'), nullable=False)
    match_status = Column(String(20)) # MATCHED, MISSING
    evidence = Column(String(255))
    match_result = relationship('MatchResult', back_populates='skill_details')
    skill = relationship('Skill')

class CandidateReview(Base):
    __tablename__ = 'candidate_reviews'
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(36), ForeignKey('applications.id'), nullable=False)
    reviewer_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    rating = Column(Integer, default=3)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ApplicationStageHistory(Base):
    __tablename__ = 'application_stage_history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(36), ForeignKey('applications.id'), nullable=False)
    from_stage = Column(String(40))
    to_stage = Column(String(40), nullable=False)
    changed_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_id = Column(String(36), ForeignKey('users.id'))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(String(36))
    metadata_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
"@
```

## 3. Seed Initial Taxonomy and Default Admin Script
Run the following PowerShell command to generate `backend\app\core\seed.py`:

```powershell
Set-Content -Path "backend\app\core\seed.py" -Value @"
from app.core.database import SessionLocal, engine
from app.models.entities import Base, Role, User, Skill, SkillAlias
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Roles
        roles = ['ADMIN', 'HR_RECRUITER', 'HR_MANAGER']
        role_objs = {}
        for r_name in roles:
            role = db.query(Role).filter_by(role_name=r_name).first()
            if not role:
                role = Role(role_name=r_name, description=f'{r_name} role')
                db.add(role)
                db.commit()
                db.refresh(role)
            role_objs[r_name] = role

        # Seed Admin User
        admin_email = 'admin@talentbridge.com'
        admin = db.query(User).filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                name='Default Administrator',
                email=admin_email,
                password_hash=pwd_context.hash('Admin@12345'),
                role_id=role_objs['ADMIN'].id,
                status='ACTIVE'
            )
            db.add(admin)
            db.commit()
            print('Created default admin: admin@talentbridge.com / Admin@12345')

        # Seed Initial Technical Skills & Aliases
        initial_skills = [
            ('Python', ['py', 'python3']),
            ('FastAPI', ['fast api']),
            ('PostgreSQL', ['postgres', 'psql', 'postgresql db']),
            ('React', ['reactjs', 'react.js']),
            ('TypeScript', ['ts']),
            ('Docker', ['docker-ce', 'containerization']),
            ('SQL', ['relational database', 'structured query language']),
            ('Git', ['github', 'gitlab', 'version control']),
            ('Machine Learning', ['ml', 'scikit-learn', 'sklearn']),
            ('Natural Language Processing', ['nlp', 'spacy', 'text processing']),
            ('REST API', ['restful', 'web api']),
            ('JavaScript', ['js', 'es6'])
        ]

        for canonical, aliases in initial_skills:
            skill = db.query(Skill).filter_by(canonical_name=canonical).first()
            if not skill:
                skill = Skill(canonical_name=canonical, category='Technical', active=True)
                db.add(skill)
                db.commit()
                db.refresh(skill)

            for alias_name in aliases:
                alias = db.query(SkillAlias).filter_by(alias=alias_name).first()
                if not alias:
                    db.add(SkillAlias(skill_id=skill.id, alias=alias_name))
        db.commit()
        print('Initial skill taxonomy seeded successfully.')
    finally:
        db.close()

if __name__ == '__main__':
    seed_database()
"@
```

## 4. Phase 04 Acceptance Criteria Check
- [x] Complete SQLAlchemy relational model implemented.
- [x] Initial seed script populated with Roles, Admin account, and Tech Skills Taxonomy.

