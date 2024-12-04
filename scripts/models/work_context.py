from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class WorkEnvironment(Base):
    __tablename__ = 'work_environments'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    
    # Physical Environment
    indoor_percentage = Column(Integer)  # Percentage of time spent indoors
    outdoor_percentage = Column(Integer)  # Percentage of time spent outdoors
    temperature_controlled = Column(Boolean)
    noise_level = Column(Integer)  # Scale 1-10
    lighting_conditions = Column(String(50))
    workspace_type = Column(String(50))  # e.g., "office", "factory", "field"
    
    # Equipment and Resources
    required_equipment = Column(JSON)  # List of required equipment
    technology_tools = Column(JSON)  # Required technology/software
    protective_equipment = Column(JSON)  # Required PPE
    workspace_requirements = Column(JSON)  # Special workspace needs
    
    # Physical Demands
    standing_percentage = Column(Integer)
    sitting_percentage = Column(Integer)
    walking_percentage = Column(Integer)
    lifting_requirements = Column(JSON)  # Weight and frequency
    physical_activities = Column(JSON)  # List of common physical activities
    
    # Environmental Conditions
    hazard_exposure = Column(JSON)  # Types and levels of hazards
    environmental_risks = Column(JSON)  # Environmental risk factors
    weather_exposure = Column(Boolean)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="work_environment")

class ActivityMetrics(Base):
    __tablename__ = 'activity_metrics'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    
    # Time Allocation
    daily_tasks = Column(JSON)  # Breakdown of daily activities
    time_allocation = Column(JSON)  # Time spent on different activities
    work_schedule = Column(JSON)  # Typical schedule patterns
    breaks_pattern = Column(JSON)  # Common break patterns
    
    # Interaction Patterns
    team_interaction = Column(Integer)  # Scale 1-10
    client_interaction = Column(Integer)  # Scale 1-10
    public_interaction = Column(Integer)  # Scale 1-10
    remote_collaboration = Column(Integer)  # Scale 1-10
    
    # Task Characteristics
    task_variety = Column(Integer)  # Scale 1-10
    task_complexity = Column(Integer)  # Scale 1-10
    decision_making_freq = Column(Integer)  # Scale 1-10
    problem_solving_req = Column(Integer)  # Scale 1-10
    
    # Work Patterns
    deadline_frequency = Column(Integer)  # Scale 1-10
    multitasking_req = Column(Integer)  # Scale 1-10
    autonomy_level = Column(Integer)  # Scale 1-10
    teamwork_req = Column(Integer)  # Scale 1-10
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="activity_metrics")

class SafetyRequirements(Base):
    __tablename__ = 'safety_requirements'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    
    # Safety Training
    required_certifications = Column(JSON)  # Required safety certifications
    training_frequency = Column(JSON)  # Training renewal requirements
    safety_protocols = Column(JSON)  # Standard safety procedures
    emergency_procedures = Column(JSON)  # Emergency response protocols
    
    # Equipment Requirements
    ppe_requirements = Column(JSON)  # Required personal protective equipment
    safety_equipment = Column(JSON)  # Additional safety equipment
    equipment_maintenance = Column(JSON)  # Maintenance schedules
    
    # Compliance Requirements
    regulatory_standards = Column(JSON)  # Applicable regulations
    inspection_requirements = Column(JSON)  # Required safety inspections
    reporting_requirements = Column(JSON)  # Incident reporting procedures
    
    # Risk Assessment
    hazard_levels = Column(JSON)  # Identified hazard levels
    risk_mitigation = Column(JSON)  # Risk mitigation strategies
    incident_history = Column(JSON)  # Historical incident data
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="safety_requirements")

class RemoteWorkMetrics(Base):
    __tablename__ = 'remote_work_metrics'
    
    id = Column(Integer, primary_key=True)
    occupation_id = Column(String(10), ForeignKey('occupations.id'), nullable=False)
    
    # Remote Work Potential
    remote_feasibility = Column(Integer)  # Scale 1-10
    hybrid_feasibility = Column(Integer)  # Scale 1-10
    location_flexibility = Column(Integer)  # Scale 1-10
    
    # Technology Requirements
    required_technology = Column(JSON)  # Required tech for remote work
    connectivity_needs = Column(JSON)  # Internet/network requirements
    software_requirements = Column(JSON)  # Required software
    
    # Work Arrangements
    common_arrangements = Column(JSON)  # Typical remote arrangements
    collaboration_tools = Column(JSON)  # Required collaboration tools
    communication_methods = Column(JSON)  # Primary communication channels
    
    # Performance Metrics
    productivity_metrics = Column(JSON)  # Remote work performance metrics
    success_factors = Column(JSON)  # Key success factors
    challenges = Column(JSON)  # Common challenges
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    occupation = relationship("Occupation", back_populates="remote_work_metrics")

# Update Occupation model relationships
def update_occupation_model(Base):
    class Occupation(Base):
        __tablename__ = 'occupations'
        
        work_environment = relationship(
            "WorkEnvironment",
            back_populates="occupation",
            uselist=False
        )
        activity_metrics = relationship(
            "ActivityMetrics",
            back_populates="occupation",
            uselist=False
        )
        safety_requirements = relationship(
            "SafetyRequirements",
            back_populates="occupation",
            uselist=False
        )
        remote_work_metrics = relationship(
            "RemoteWorkMetrics",
            back_populates="occupation",
            uselist=False
        )
