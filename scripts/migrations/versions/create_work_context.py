"""create work context tables

Revision ID: work_context_001
Revises: career_pathways_001
Create Date: 2024-01-20 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'work_context_001'
down_revision = 'career_pathways_001'
branch_labels = None
depends_on = None

def upgrade():
    # Create work_environments table
    op.create_table(
        'work_environments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('indoor_percentage', sa.Integer()),
        sa.Column('outdoor_percentage', sa.Integer()),
        sa.Column('temperature_controlled', sa.Boolean()),
        sa.Column('noise_level', sa.Integer()),
        sa.Column('lighting_conditions', sa.String(length=50)),
        sa.Column('workspace_type', sa.String(length=50)),
        sa.Column('required_equipment', sa.JSON()),
        sa.Column('technology_tools', sa.JSON()),
        sa.Column('protective_equipment', sa.JSON()),
        sa.Column('workspace_requirements', sa.JSON()),
        sa.Column('standing_percentage', sa.Integer()),
        sa.Column('sitting_percentage', sa.Integer()),
        sa.Column('walking_percentage', sa.Integer()),
        sa.Column('lifting_requirements', sa.JSON()),
        sa.Column('physical_activities', sa.JSON()),
        sa.Column('hazard_exposure', sa.JSON()),
        sa.Column('environmental_risks', sa.JSON()),
        sa.Column('weather_exposure', sa.Boolean()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_work_environments_occupation',
        'work_environments',
        ['occupation_id']
    )

    # Create activity_metrics table
    op.create_table(
        'activity_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('daily_tasks', sa.JSON()),
        sa.Column('time_allocation', sa.JSON()),
        sa.Column('work_schedule', sa.JSON()),
        sa.Column('breaks_pattern', sa.JSON()),
        sa.Column('team_interaction', sa.Integer()),
        sa.Column('client_interaction', sa.Integer()),
        sa.Column('public_interaction', sa.Integer()),
        sa.Column('remote_collaboration', sa.Integer()),
        sa.Column('task_variety', sa.Integer()),
        sa.Column('task_complexity', sa.Integer()),
        sa.Column('decision_making_freq', sa.Integer()),
        sa.Column('problem_solving_req', sa.Integer()),
        sa.Column('deadline_frequency', sa.Integer()),
        sa.Column('multitasking_req', sa.Integer()),
        sa.Column('autonomy_level', sa.Integer()),
        sa.Column('teamwork_req', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_activity_metrics_occupation',
        'activity_metrics',
        ['occupation_id']
    )

    # Create safety_requirements table
    op.create_table(
        'safety_requirements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('required_certifications', sa.JSON()),
        sa.Column('training_frequency', sa.JSON()),
        sa.Column('safety_protocols', sa.JSON()),
        sa.Column('emergency_procedures', sa.JSON()),
        sa.Column('ppe_requirements', sa.JSON()),
        sa.Column('safety_equipment', sa.JSON()),
        sa.Column('equipment_maintenance', sa.JSON()),
        sa.Column('regulatory_standards', sa.JSON()),
        sa.Column('inspection_requirements', sa.JSON()),
        sa.Column('reporting_requirements', sa.JSON()),
        sa.Column('hazard_levels', sa.JSON()),
        sa.Column('risk_mitigation', sa.JSON()),
        sa.Column('incident_history', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_safety_requirements_occupation',
        'safety_requirements',
        ['occupation_id']
    )

    # Create remote_work_metrics table
    op.create_table(
        'remote_work_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('remote_feasibility', sa.Integer()),
        sa.Column('hybrid_feasibility', sa.Integer()),
        sa.Column('location_flexibility', sa.Integer()),
        sa.Column('required_technology', sa.JSON()),
        sa.Column('connectivity_needs', sa.JSON()),
        sa.Column('software_requirements', sa.JSON()),
        sa.Column('common_arrangements', sa.JSON()),
        sa.Column('collaboration_tools', sa.JSON()),
        sa.Column('communication_methods', sa.JSON()),
        sa.Column('productivity_metrics', sa.JSON()),
        sa.Column('success_factors', sa.JSON()),
        sa.Column('challenges', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_remote_work_metrics_occupation',
        'remote_work_metrics',
        ['occupation_id']
    )

def downgrade():
    op.drop_table('remote_work_metrics')
    op.drop_table('safety_requirements')
    op.drop_table('activity_metrics')
    op.drop_table('work_environments')
