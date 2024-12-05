from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class WorkEnvironment(Base):
    __tablename__ = 'work_environments'

    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    physical_demands = Column(JSON)  # e.g., standing, lifting, etc.
    environmental_conditions = Column(JSON)  # e.g., temperature, noise, etc.
    stress_factors = Column(JSON)  # e.g., time pressure, conflict situations
    safety_requirements = Column(JSON)  # e.g., protective equipment, safety protocols
    flexibility_metrics = Column(JSON)  # e.g., remote work, flexible hours
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    role = relationship("Role", back_populates="work_environment")
    assessments = relationship("WorkEnvironmentAssessment", back_populates="environment")

class WorkEnvironmentAssessment(Base):
    __tablename__ = 'work_environment_assessments'

    id = Column(Integer, primary_key=True)
    environment_id = Column(Integer, ForeignKey('work_environments.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    physical_score = Column(Float)
    environmental_score = Column(Float)
    stress_score = Column(Float)
    safety_score = Column(Float)
    flexibility_score = Column(Float)
    overall_compatibility = Column(Float)
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String)

    # Relationships
    environment = relationship("WorkEnvironment", back_populates="assessments")
    user = relationship("User", back_populates="work_environment_assessments")

class WorkEnvironmentMetrics(Base):
    __tablename__ = 'work_environment_metrics'

    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    physical_adaptation_rate = Column(Float)  # Success rate of physical adaptations
    environmental_satisfaction = Column(Float)  # User satisfaction with environment
    stress_management_score = Column(Float)  # Effectiveness of stress management
    safety_compliance_rate = Column(Float)  # Rate of safety protocol compliance
    flexibility_utilization = Column(Float)  # Usage of flexible work options
    collection_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    role = relationship("Role", back_populates="work_environment_metrics")
