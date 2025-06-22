import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from app.db import Base
from app.models.models import User, Document

load_dotenv()

@pytest.fixture(scope="session")
def pg_engine():
  url = os.getenv("DATABASE_URL")
  engine = create_engine(url)
  Base.metadata.create_all(engine)
  yield engine
  Base.metadata.drop_all(engine)

@pytest.fixture
def db_session(pg_engine):
  Session = sessionmaker(bind=pg_engine)
  session = Session()
  connection = pg_engine.connect()
  transaction = connection.begin()
  yield session
  session.close()
  transaction.rollback()
  connection.close()

class TestUserModel:
  def test_create_doctor(self, db_session):
    pass

  def test_create_patient(self, db_session):
    pass

  
class TestDocumentModel:
  def test_create_document(self, db_session):
    pass
  def test_update_document(self, db_session):
    pass
  def test_delete_document(self, db_session):
    pass
  def test_get_document(self, db_session):
    pass
  def test_get_documents(self, db_session):
    pass
