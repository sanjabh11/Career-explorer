"""
Database migration script for creating enhanced data model tables
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean
from datetime import datetime

# revision identifiers, used by Alembic
revision = 'enhanced_data_models_v1'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create new tables
    op.create_table(
        'education_requirements',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('required_level', Integer),
        Column('preferred_level', Integer),
        Column('field_of_study', String),
        Column('certifications', JSON),
        Column('licenses', JSON),
        Column('continuing_education', JSON),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'training_programs',
        Column('id', Integer, primary_key=True),
        Column('education_requirement_id', Integer, ForeignKey('education_requirements.id')),
        Column('name', String),
        Column('provider', String),
        Column('duration', String),
        Column('format', String),
        Column('cost_range', String),
        Column('success_rate', Float),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'career_progressions',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('next_role', String),
        Column('typical_timeframe', String),
        Column('required_experience', Float),
        Column('required_skills', JSON),
        Column('salary_increase', Float),
        Column('difficulty_level', Integer),
        Column('success_rate', Float),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'industry_connections',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('industry_sector', String),
        Column('relevance_score', Float),
        Column('growth_rate', Float),
        Column('transition_difficulty', Float),
        Column('required_reskilling', JSON),
        Column('market_demand', Integer),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'work_environments',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('physical_demands', JSON),
        Column('environmental_conditions', JSON),
        Column('safety_requirements', JSON),
        Column('schedule_flexibility', Integer),
        Column('remote_work_potential', Float),
        Column('collaboration_level', Integer),
        Column('stress_level', Integer),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'work_activity_details',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('activity_type', String),
        Column('cognitive_load', Integer),
        Column('interpersonal_intensity', Integer),
        Column('technical_complexity', Integer),
        Column('autonomy_level', Integer),
        Column('decision_making_frequency', Integer),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'automation_risks',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('overall_risk_score', Float),
        Column('task_automation_potential', JSON),
        Column('technology_impact_timeline', JSON),
        Column('required_adaptations', JSON),
        Column('market_stability', Integer),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    op.create_table(
        'skill_transitions',
        Column('id', Integer, primary_key=True),
        Column('occupation_id', Integer, ForeignKey('occupations.id')),
        Column('current_skills', JSON),
        Column('target_skills', JSON),
        Column('gap_analysis', JSON),
        Column('transition_difficulty', Float),
        Column('estimated_timeframe', String),
        Column('recommended_resources', JSON),
        Column('last_updated', DateTime, default=datetime.utcnow)
    )

    # Create indexes for better query performance
    op.create_index('idx_education_occupation', 'education_requirements', ['occupation_id'])
    op.create_index('idx_training_education', 'training_programs', ['education_requirement_id'])
    op.create_index('idx_progression_occupation', 'career_progressions', ['occupation_id'])
    op.create_index('idx_industry_occupation', 'industry_connections', ['occupation_id'])
    op.create_index('idx_environment_occupation', 'work_environments', ['occupation_id'])
    op.create_index('idx_activity_occupation', 'work_activity_details', ['occupation_id'])
    op.create_index('idx_automation_occupation', 'automation_risks', ['occupation_id'])
    op.create_index('idx_transition_occupation', 'skill_transitions', ['occupation_id'])

def downgrade():
    # Remove tables in reverse order of creation
    op.drop_table('skill_transitions')
    op.drop_table('automation_risks')
    op.drop_table('work_activity_details')
    op.drop_table('work_environments')
    op.drop_table('industry_connections')
    op.drop_table('career_progressions')
    op.drop_table('training_programs')
    op.drop_table('education_requirements')
