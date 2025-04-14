"""Add status fields

Revision ID: 1e08ed636ba2
Revises: 88bd300fdd17
Create Date: 2025-04-11 16:24:08.389160

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1e08ed636ba2'
down_revision = '88bd300fdd17'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    product_status_enum = sa.Enum('TO_PUBLISH', 'PUBLISHED', 'SOLD', name='productstatus')
    purchase_status_enum = sa.Enum('IN_PROGRESS', 'RECEIVED', 'COMPLETED', name='purchasestatus')
    sale_status_enum = sa.Enum('TO_PREPARE', 'SHIPPED', 'COMPLETED', name='salestatus')

    product_status_enum.create(op.get_bind(), checkfirst=True)
    purchase_status_enum.create(op.get_bind(), checkfirst=True)
    sale_status_enum.create(op.get_bind(), checkfirst=True)

    # Add status columns as nullable
    op.add_column('product', sa.Column('status', product_status_enum, nullable=True))
    op.add_column('purchase', sa.Column('status', purchase_status_enum, nullable=True))
    op.add_column('sale', sa.Column('status', sale_status_enum, nullable=True))

    # Populate default values
    op.execute("UPDATE product SET status = 'TO_PUBLISH'")
    op.execute("UPDATE purchase SET status = 'IN_PROGRESS'")
    op.execute("UPDATE sale SET status = 'TO_PREPARE'")

    # Alter columns to be non-nullable
    op.alter_column('product', 'status', nullable=False)
    op.alter_column('purchase', 'status', nullable=False)
    op.alter_column('sale', 'status', nullable=False)

def downgrade():
    # Drop status columns
    op.drop_column('sale', 'status')
    op.drop_column('purchase', 'status')
    op.drop_column('product', 'status')

    # Drop enum types
    sa.Enum(name='salestatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='purchasestatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='productstatus').drop(op.get_bind(), checkfirst=True)
