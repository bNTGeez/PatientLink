from sqlalchemy.orm import Session
from app.models.models import User
from datetime import datetime, timezone
from fastapi import HTTPException

def check_user(user: dict, db: Session):
    auth0_user_id = user.get("user_id")
    email = user.get("email")
    roles = user.get("roles")
    
    if "doctor" in roles:
        role = "doctor"
    elif "patient" in roles:
        role = "patient"
    else:
        raise HTTPException(status_code=403, detail="User does not have a valid role")
    
    # Check if user is in database
    existing_user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
    
    if not existing_user:
        # Create new user
        new_user = User(
            auth0_user_id=auth0_user_id,
            email=email,
            first_name="",
            last_name="",
            role=role,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    return existing_user