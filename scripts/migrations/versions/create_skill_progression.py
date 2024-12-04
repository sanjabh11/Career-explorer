"""create skill progression tables

Revision ID: 4a2f8e9d1234
Revises: create_work_context
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '4a2f8e9d1234'
down_revision = 'create_work_context'
branch_labels = None
depends_on = None

def upgrade():
    # Create skills table
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('category', sa.String(length=100)),
        sa.Column('description', sa.String(length=500)),
        sa.Column('proficiency_levels', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('learning_duration', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('assessment_criteria', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('industry_relevance', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('future_outlook', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_category'), 'skills', ['category'], unique=False)
    op.create_index(op.f('ix_skills_name'), 'skills', ['name'], unique=False)

    # Create skill_dependencies table
    op.create_table(
        'skill_dependencies',
        sa.Column('prerequisite_skill_id', sa.Integer(), nullable=False),
        sa.Column('dependent_skill_id', sa.Integer(), nullable=False),
        sa.Column('dependency_type', sa.String(length=50)),
        sa.Column('strength', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['dependent_skill_id'], ['skills.id'], ),
        sa.ForeignKeyConstraint(['prerequisite_skill_id'], ['skills.id'], ),
        sa.PrimaryKeyConstraint('prerequisite_skill_id', 'dependent_skill_id')
    )

    # Create learning_paths table
    op.create_table(
        'learning_paths',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=500)),
        sa.Column('difficulty_level', sa.Integer()),
        sa.Column('estimated_duration', sa.Integer()),
        sa.Column('target_role', sa.String(length=200)),
        sa.Column('prerequisites', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('learning_objectives', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('industry_alignment', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('career_impact', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_paths_name'), 'learning_paths', ['name'], unique=False)
    op.create_index(op.f('ix_learning_paths_target_role'), 'learning_paths', ['target_role'], unique=False)

    # Create learning_resources table
    op.create_table(
        'learning_resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('type', sa.String(length=50)),
        sa.Column('provider', sa.String(length=200)),
        sa.Column('format', sa.String(length=50)),
        sa.Column('duration', sa.Integer()),
        sa.Column('difficulty_level', sa.Integer()),
        sa.Column('cost', sa.Float()),
        sa.Column('url', sa.String(length=500)),
        sa.Column('rating', sa.Float()),
        sa.Column('review_count', sa.Integer()),
        sa.Column('completion_rate', sa.Float()),
        sa.Column('effectiveness_score', sa.Float()),
        sa.Column('prerequisites', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('learning_objectives', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('content_outline', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_resources_skill_id'), 'learning_resources', ['skill_id'], unique=False)
    op.create_index(op.f('ix_learning_resources_type'), 'learning_resources', ['type'], unique=False)

    # Create progress_tracking table
    op.create_table(
        'progress_tracking',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('current_level', sa.Integer()),
        sa.Column('target_level', sa.Integer()),
        sa.Column('progress_percentage', sa.Float()),
        sa.Column('time_spent', sa.Integer()),
        sa.Column('completed_resources', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('assessment_results', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('milestones_achieved', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('next_steps', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('learning_pace', sa.Float()),
        sa.Column('strengths', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('areas_for_improvement', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_progress_tracking_skill_id'), 'progress_tracking', ['skill_id'], unique=False)
    op.create_index(op.f('ix_progress_tracking_user_id'), 'progress_tracking', ['user_id'], unique=False)

    # Create skill_assessments table
    op.create_table(
        'skill_assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=500)),
        sa.Column('assessment_type', sa.String(length=50)),
        sa.Column('difficulty_level', sa.Integer()),
        sa.Column('duration', sa.Integer()),
        sa.Column('passing_score', sa.Float()),
        sa.Column('questions', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('rubric', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('prerequisites', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('certification', postgresql.JSON(astext_type=sa.Text())),
        sa.Column('validity_period', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_assessments_skill_id'), 'skill_assessments', ['skill_id'], unique=False)
    op.create_index(op.f('ix_skill_assessments_assessment_type'), 'skill_assessments', ['assessment_type'], unique=False)

def downgrade():
    op.drop_table('skill_assessments')
    op.drop_table('progress_tracking')
    op.drop_table('learning_resources')
    op.drop_table('learning_paths')
    op.drop_table('skill_dependencies')
    op.drop_table('skills')
