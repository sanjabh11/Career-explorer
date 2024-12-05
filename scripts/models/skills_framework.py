from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association tables
skill_role = Table(
    'skill_role',
    Base.metadata,
    Column('skill_id', Integer, ForeignKey('skills.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

skill_prerequisite = Table(
    'skill_prerequisite',
    Base.metadata,
    Column('skill_id', Integer, ForeignKey('skills.id')),
    Column('prerequisite_id', Integer, ForeignKey('skills.id'))
)

class Skill(Base):
    __tablename__ = 'skills'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    category = Column(String(100))  # Technical, Soft, Domain, etc.
    description = Column(String(1000))
    proficiency_levels = Column(JSON)  # Different levels of mastery
    learning_resources = Column(JSON)  # Links to courses, materials, etc.
    assessment_criteria = Column(JSON)  # Criteria for each proficiency level
    industry_demand = Column(Float)  # 0-1 scale
    future_relevance = Column(Float)  # 0-1 scale
    automation_resistance = Column(Float)  # 0-1 scale
    
    roles = relationship('Role', secondary=skill_role, back_populates='required_skills')
    prerequisites = relationship(
        'Skill',
        secondary=skill_prerequisite,
        primaryjoin=id==skill_prerequisite.c.skill_id,
        secondaryjoin=id==skill_prerequisite.c.prerequisite_id,
        backref='dependent_skills'
    )

class SkillAssessment(Base):
    __tablename__ = 'skill_assessments'
    
    id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    current_level = Column(Integer)  # 1-5 scale
    target_level = Column(Integer)
    assessment_date = Column(Integer)  # Unix timestamp
    verification_status = Column(Boolean, default=False)
    endorsements = Column(Integer, default=0)
    
    # Progress tracking
    completed_resources = Column(JSON)
    practice_hours = Column(Integer, default=0)
    project_applications = Column(Integer, default=0)

class SkillGap(Base):
    __tablename__ = 'skill_gaps'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    target_role_id = Column(Integer, ForeignKey('roles.id'))
    gap_analysis = Column(JSON)  # Detailed gap analysis
    priority_skills = Column(JSON)  # Skills to focus on first
    estimated_completion_time = Column(Integer)  # In hours
    recommended_path = Column(JSON)  # Learning path recommendation
    
    # Progress metrics
    completion_percentage = Column(Float, default=0.0)
    time_invested = Column(Integer, default=0)  # Hours spent
    milestone_achievements = Column(JSON)

class SkillMetrics(Base):
    __tablename__ = 'skill_metrics'
    
    id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.id'))
    timestamp = Column(Integer)
    
    # Engagement metrics
    learning_resource_usage = Column(Float)  # Percentage of resources used
    assessment_completion_rate = Column(Float)
    average_proficiency_gain = Column(Float)
    
    # Market metrics
    job_posting_frequency = Column(Integer)  # Number of postings requiring this skill
    salary_impact = Column(Float)  # Average salary increase with this skill
    industry_growth_rate = Column(Float)  # YoY growth in demand
    
    # Learning metrics
    average_time_to_proficiency = Column(Integer)  # In hours
    success_rate = Column(Float)  # Percentage achieving target level
    retention_rate = Column(Float)  # Skill retention after 6 months
