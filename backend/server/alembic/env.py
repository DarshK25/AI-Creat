from alembic import context
from sqlalchemy import pool
from sqlalchemy import engine_from_config
from logging.config import fileConfig

import sys
import os

from app.db.base import Base
from app.models.user import User
from app.models.admin import Platform, TextStyleSet, AssetFormat, AppSetting
from app.models.blacklisted_token import BlacklistedToken
from app.models.project import Project
from app.models.generation import GenerationJob
from app.models.asset import Asset, GeneratedAsset
from app.core.config import settings

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
target_metadata = Base.metadata

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
