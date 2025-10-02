"""Initial migration
RevisionID: a869db6955b7
Revises: 
Create Date: 2025-10-02 10:52:58.618173
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a869db6955b7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
