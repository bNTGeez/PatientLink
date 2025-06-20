from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
import requests
import os
import dotenv
from app.db import get_db
from sqlalchemy.orm import Session

bearer = HTTPBearer()

JWKS = requests.get(
    f"https://{os.getenv('AUTH0_DOMAIN')}/.well-known/jwks.json"
).json()

def get_token_auth_header(
    creds: HTTPAuthorizationCredentials = Depends(bearer)
) -> str:

    return creds.credentials

def verify_jwt(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    key = next(
        (k for k in JWKS["keys"] if k["kid"] == header["kid"]),
        None
    )
    if not key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token header")
    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=os.getenv("API_AUDIENCE"),
            issuer=f"https://{os.getenv('AUTH0_DOMAIN')}/"
        )
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e))
    return payload

def get_current_user(token: str = Depends(get_token_auth_header), db: Session = Depends(get_db)) -> dict:
    payload = verify_jwt(token)
    auth0_user_id = payload.get('sub')  # Auth0 user ID
    email = payload.get('email')

    namespace = os.getenv('AUTH0_NAMESPACE')
    roles = payload.get(f'{namespace}roles', [])
    permissions = payload.get(f'{namespace}permissions', [])

    
    return {
        'user_id': auth0_user_id,
        'email': email,
        'payload': payload,
        'permissions': permissions,
        'roles': roles
    }

def requires_scope(required_scope: str, payload=Depends(get_current_user)) -> bool:
    scopes = payload.get("scope", "").split()
    if required_scope not in scopes:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient scope")
    return True