from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user

def require_role(required_role: str):
  def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
    if required_role not in current_user.get('roles', []):
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"User does not have the required role: {required_role}"
      )
    return current_user
  return role_checker

def require_permission(required_permission: str):
  def permission_checker(current_user: dict = Depends(get_current_user)) -> dict:
    if required_permission not in current_user.get('permissions', []):
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"User does not have the required permission: {required_permission}"
      )
    return current_user
  return permission_checker
