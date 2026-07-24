"""
Declarative base shared by all ORM models.
Importing this module (and all model modules) is what lets
`Base.metadata.create_all(engine)` discover every table.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
