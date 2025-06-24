from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.routes.doctors import router as doctors_router
from app.api.routes.patients import router as patients_router

router = APIRouter()

router.include_router(auth_router, tags=["auth"])
router.include_router(doctors_router, tags=["doctors"])
router.include_router(patients_router, tags=["patients"])
