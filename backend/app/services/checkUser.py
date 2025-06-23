from sqlalchemy.orm import Session
from app.models.models import User
from datetime import datetime, timezone
from fastapi import HTTPException

def check_user(user: dict, db: Session):
    auth0_user_id = user.get("user_id")
    email = user.get("email")
    name = user.get("name", "")
    given_name = user.get("given_name", "")
    family_name = user.get("family_name", "")
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
        if given_name and family_name:
            first_name = given_name
            last_name = family_name
        elif name:
            name_parts = name.split()
            first_name = name_parts[0] if len(name_parts) > 0 else "Unknown"
            last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else "User"
        else:
            first_name = "Unknown"
            last_name = "User"
            
        if not email:
            email = f"{auth0_user_id.replace('|', '_')}@patientlink.com"
        
        # Create new user
        new_user = User(
            auth0_user_id=auth0_user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    return existing_user