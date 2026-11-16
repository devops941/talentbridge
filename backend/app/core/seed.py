from app.core.database import SessionLocal, engine
from app.models.entities import Base, Role, User, Skill, SkillAlias
from app.core.security import get_password_hash

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

        # Seed Default Users
        users_to_seed = [
            ("System Admin", "admin@talentbridge.com", "Admin@12345", "ADMIN"),
            ("Priya Recruiter", "recruiter@talentbridge.com", "Recruiter@12345", "HR_RECRUITER"),
            ("Rajesh Manager", "manager@talentbridge.com", "Manager@12345", "HR_MANAGER"),
        ]

        for name, email, raw_pwd, r_name in users_to_seed:
            user = db.query(User).filter_by(email=email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    password_hash=get_password_hash(raw_pwd),
                    role_id=role_objs[r_name].id,
                    status="ACTIVE"
                )
                db.add(user)
                db.commit()
                print(f"Created user: {email} / {raw_pwd} ({r_name})")

        # Seed Extensive Initial Technical & Domain Skills with Aliases
        initial_skills = [
            ("Python", ["py", "python3", "python 3"]),
            ("FastAPI", ["fast api", "fastapi framework"]),
            ("PostgreSQL", ["postgres", "psql", "postgresql db", "postgres db"]),
            ("React", ["reactjs", "react.js", "react 18"]),
            ("TypeScript", ["ts", "typescript lang"]),
            ("JavaScript", ["js", "es6", "vanilla js"]),
            ("Docker", ["docker-ce", "containerization", "docker containers"]),
            ("SQL", ["relational database", "structured query language", "rdbms"]),
            ("Git", ["github", "gitlab", "version control", "git flow"]),
            ("Machine Learning", ["ml", "scikit-learn", "sklearn", "supervised learning"]),
            ("Natural Language Processing", ["nlp", "spacy", "nltk", "text processing"]),
            ("REST API", ["restful", "restful api", "web api"]),
            ("Node.js", ["nodejs", "node js"]),
            ("MongoDB", ["mongo", "mongodb atlas"]),
            ("Linux", ["ubuntu", "bash scripting", "unix"]),
            ("HTML5", ["html", "semantic html"]),
            ("CSS3", ["css", "bootstrap", "tailwind"]),
            ("Django", ["django framework", "django rest framework", "drf"]),
            ("Flask", ["flask framework"]),
            ("AWS", ["amazon web services", "ec2", "s3"])
        ]

        for canonical, aliases in initial_skills:
            skill = db.query(Skill).filter_by(canonical_name=canonical).first()
            if not skill:
                skill = Skill(canonical_name=canonical, category="Technical", active=True)
                db.add(skill)
                db.commit()
                db.refresh(skill)

            for alias_name in aliases:
                alias = db.query(SkillAlias).filter_by(alias=alias_name).first()
                if not alias:
                    db.add(SkillAlias(skill_id=skill.id, alias=alias_name))
        db.commit()
        print("Initial skill taxonomy seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
