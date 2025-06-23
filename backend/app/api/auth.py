from fastapi import APIRouter, Depends, HTTPException
from app.models import User
from app.db import get_db
from sqlalchemy.orm import Session
from app.core.security import get_current_user, requires_scope

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
def get_current_user(user: User = Depends(get_current_user)):
  return {"user": user}

@router.get("/private-scoped")
def private_scoped(payload=Depends(requires_scope("read:documents"))):
  return {"message": "Hello from a private endpoint! You need to be authenticated and have a scope of read:documents to see this."}