"""create career pathways tables

Revision ID: career_pathways_001
Revises: enhanced_requirements_001
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'career_pathways_001'
down_revision = 'enhanced_requirements_001'
branch_labels = None
depends_on = None

def upgrade():
    # Create occupation_connections table
    op.create_table(
        'occupation_connections',
        sa.Column('source_occupation_id', sa.String(length=10), nullable=False),
        sa.Column('target_occupation_id', sa.String(length=10), nullable=False),
        sa.Column('connection_type', sa.String(length=50)),
        sa.Column('similarity_score', sa.Float()),
        sa.Column('skill_overlap', sa.JSON()),
        sa.Column('transition_difficulty', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.ForeignKeyConstraint(['source_occupation_id'], ['occupations.id'], ),
        sa.ForeignKeyConstraint(['target_occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('source_occupation_id', 'target_occupation_id')
    )
    op.create_index(
        'idx_occupation_connections_source',
        'occupation_connections',
        ['source_occupation_id']
    )
    op.create_index(
        'idx_occupation_connections_target',
        'occupation_connections',
        ['target_occupation_id']
    )

    # Create career_paths table
    op.create_table(
        'career_paths',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('path_name', sa.String(length=200)),
        sa.Column('description', sa.String(length=500)),
        sa.Column('typical_duration', sa.Integer()),
        sa.Column('advancement_steps', sa.JSON()),
        sa.Column('required_certifications', sa.JSON()),
        sa.Column('skill_milestones', sa.JSON()),
        sa.Column('salary_progression', sa.JSON()),
        sa.Column('success_factors', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_career_paths_occupation',
        'career_paths',
        ['occupation_id']
    )

    # Create industry_sectors table
    op.create_table(
        'industry_sectors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200)),
        sa.Column('description', sa.String(length=500)),
        sa.Column('market_size', sa.Float()),
        sa.Column('growth_rate', sa.Float()),
        sa.Column('employment_count', sa.Integer()),
        sa.Column('top_companies', sa.JSON()),
        sa.Column('key_technologies', sa.JSON()),
        sa.Column('market_trends', sa.JSON()),
        sa.Column('geographical_hotspots', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_industry_sectors_growth',
        'industry_sectors',
        ['growth_rate']
    )

    # Create occupation_sectors table
    op.create_table(
        'occupation_sectors',
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('sector_id', sa.Integer(), nullable=False),
        sa.Column('demand_level', sa.Integer()),
        sa.Column('growth_potential', sa.Float()),
        sa.Column('average_salary', sa.Float()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.ForeignKeyConstraint(['sector_id'], ['industry_sectors.id'], ),
        sa.PrimaryKeyConstraint('occupation_id', 'sector_id')
    )
    op.create_index(
        'idx_occupation_sectors_occupation',
        'occupation_sectors',
        ['occupation_id']
    )
    op.create_index(
        'idx_occupation_sectors_sector',
        'occupation_sectors',
        ['sector_id']
    )

    # Create experience_milestones table
    op.create_table(
        'experience_milestones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.String(length=10), nullable=False),
        sa.Column('title', sa.String(length=200)),
        sa.Column('years_experience', sa.Integer()),
        sa.Column('level', sa.String(length=50)),
        sa.Column('key_responsibilities', sa.JSON()),
        sa.Column('required_skills', sa.JSON()),
        sa.Column('typical_projects', sa.JSON()),
        sa.Column('leadership_scope', sa.JSON()),
        sa.Column('salary_range', sa.JSON()),
        sa.Column('next_steps', sa.JSON()),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        'idx_experience_milestones_occupation',
        'experience_milestones',
        ['occupation_id']
    )
    op.create_index(
        'idx_experience_milestones_level',
        'experience_milestones',
        ['level']
    )

def downgrade():
    op.drop_table('experience_milestones')
    op.drop_table('occupation_sectors')
    op.drop_table('industry_sectors')
    op.drop_table('career_paths')
    op.drop_table('occupation_connections')
