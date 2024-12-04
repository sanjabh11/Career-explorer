"""create enhanced requirements tables

Revision ID: enhanced_requirements_001
Revises: previous_revision
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'enhanced_requirements_001'
down_revision = 'previous_revision'  # Update this to your last migration
branch_labels = None
depends_on = None

def upgrade():
    # Create education_requirement_details table
    op.create_table(
        'education_requirement_details',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('degree_level', sa.String(length=100), nullable=False),
        sa.Column('field_of_study', sa.String(length=200)),
        sa.Column('required', sa.Boolean(), default=False),
        sa.Column('preferred', sa.Boolean(), default=False),
        sa.Column('importance_score', sa.Float()),
        sa.Column('typical_time_to_complete', sa.Integer()),
        sa.Column('alternative_paths', sa.JSON()),
        sa.Column('recommended_institutions', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_education_requirements_occupation',
        'education_requirement_details',
        ['occupation_id']
    )

    # Create skill_framework table
    op.create_table(
        'skill_framework',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('skill_category', sa.String(length=100)),
        sa.Column('skill_name', sa.String(length=200)),
        sa.Column('description', sa.String(length=500)),
        sa.Column('proficiency_level_required', sa.Integer()),
        sa.Column('importance_score', sa.Float()),
        sa.Column('time_to_acquire', sa.Integer()),
        sa.Column('prerequisites', sa.JSON()),
        sa.Column('learning_resources', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_skill_framework_occupation',
        'skill_framework',
        ['occupation_id']
    )
    op.create_index(
        'idx_skill_framework_category',
        'skill_framework',
        ['skill_category']
    )

    # Create certification_requirements table
    op.create_table(
        'certification_requirements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('certification_name', sa.String(length=200)),
        sa.Column('provider', sa.String(length=200)),
        sa.Column('level', sa.String(length=50)),
        sa.Column('required', sa.Boolean(), default=False),
        sa.Column('preferred', sa.Boolean(), default=False),
        sa.Column('validity_period', sa.Integer()),
        sa.Column('estimated_cost', sa.Float()),
        sa.Column('prerequisites', sa.JSON()),
        sa.Column('renewal_requirements', sa.JSON()),
        sa.Column('exam_details', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_certification_requirements_occupation',
        'certification_requirements',
        ['occupation_id']
    )

    # Create training_recommendations table
    op.create_table(
        'training_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('skill_id', sa.Integer()),
        sa.Column('training_type', sa.String(length=100)),
        sa.Column('provider', sa.String(length=200)),
        sa.Column('course_name', sa.String(length=300)),
        sa.Column('description', sa.String(length=500)),
        sa.Column('duration', sa.Integer()),
        sa.Column('cost', sa.Float()),
        sa.Column('difficulty_level', sa.String(length=50)),
        sa.Column('prerequisites', sa.JSON()),
        sa.Column('learning_outcomes', sa.JSON()),
        sa.Column('rating', sa.Float()),
        sa.Column('review_count', sa.Integer()),
        sa.Column('url', sa.String(length=500)),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.ForeignKeyConstraint(['skill_id'], ['skill_framework.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_training_recommendations_occupation',
        'training_recommendations',
        ['occupation_id']
    )
    op.create_index(
        'idx_training_recommendations_skill',
        'training_recommendations',
        ['skill_id']
    )

def downgrade():
    op.drop_table('training_recommendations')
    op.drop_table('certification_requirements')
    op.drop_table('skill_framework')
    op.drop_table('education_requirement_details')
