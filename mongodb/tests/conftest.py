import pytest
from app.utils.db import get_db

@pytest.fixture(scope='module')
def db():
    db_instance = get_db()
    yield db_instance
    db_instance.client.drop_database(db_instance.name)