from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.core.permissions import require_role
from app.services.checkUser import check_user
from app.db import get_db
from app.models.models import User, Document
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/patients", tags=["patients"])

class PatientDetailVerificationRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None

@router.post("/verify-details")
def verify_patient_details(request: PatientDetailVerificationRequest, user=Depends(require_role("doctor")), db: Session = Depends(get_db)):
    
    patient = db.query(User).filter(User.email == request.email.lower().strip(), User.role == "patient").first()
    
    if not patient:
        raise HTTPException(status_code=404, detail=f"No patient found with email address: {request.email}")
    
    field_mismatches = []
    
    if request.first_name and patient.first_name.lower() != request.first_name.lower().strip():
        field_mismatches.append(f"First name: expected '{patient.first_name}', got '{request.first_name}'")
    
    if request.last_name and patient.last_name.lower() != request.last_name.lower().strip():
        field_mismatches.append(f"Last name: expected '{patient.last_name}', got '{request.last_name}'")
    
    if request.date_of_birth and str(patient.date_of_birth.date()) != request.date_of_birth:
        field_mismatches.append(f"Date of birth: expected '{patient.date_of_birth.date()}', got '{request.date_of_birth}'")
    
    if request.phone and patient.phone:
        patient_phone_clean = ''.join(filter(str.isdigit, patient.phone))
        request_phone_clean = ''.join(filter(str.isdigit, request.phone))
        if patient_phone_clean != request_phone_clean:
            field_mismatches.append(f"Phone number: expected '{patient.phone}', got '{request.phone}'")

    if field_mismatches:
        error_message = "Patient details don't match:\n" + "\n".join(field_mismatches)
        raise HTTPException(status_code=400, detail=error_message)
    
    return {
        "auth0_user_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "phone": patient.phone,
        "date_of_birth": patient.date_of_birth,
        "role": patient.role,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "doctor_id": patient.doctor_id
    }

# get patient profile
@router.get("/profile")
def get_patient_profile(user = Depends(require_role("patient")), db: Session = Depends(get_db)):
    patient = check_user(user, db)
    
    return {
        "patient_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "doctor_id": patient.doctor_id,
        "created_at": patient.created_at
    }

# update patient profile 
@router.put("/profile")
def update_patient_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    user = Depends(require_role("patient")), 
    db: Session = Depends(get_db)
):
    patient = check_user(user, db)
    
    if first_name is not None and first_name.strip():
        patient.first_name = first_name.strip()
    if last_name is not None and last_name.strip():
        patient.last_name = last_name.strip()
    if phone is not None:
        patient.phone = phone.strip() if phone.strip() else None
    
    db.commit()
    db.refresh(patient)
    return {
        "patient_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "doctor_id": patient.doctor_id,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at
    }

# get doctor for a patient
@router.get("/doctor")
def get_patient_doctor(user = Depends(require_role("patient")), db: Session = Depends(get_db)):
    patient = check_user(user, db)
    
    if not patient.doctor_id:
        raise HTTPException(status_code=404, detail="No doctor assigned to this patient")
    
    doctor = db.query(User).filter(
        User.auth0_user_id == patient.doctor_id,
        User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return {
        "doctor_id": doctor.auth0_user_id,
        "email": doctor.email,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "phone": doctor.phone,
        "created_at": doctor.created_at
    }

# get all documents for a patient
@router.get("/documents")
def get_patient_documents(user = Depends(require_role("patient")), db: Session = Depends(get_db)):
    patient = check_user(user, db)
    
    documents = patient.owned_documents
    return [
        {
            "document_id": document.id,
            "filename": document.filename,
            "description": document.description,
            "uploaded_by_id": document.uploaded_by_id,
            "created_at": document.created_at
        }
        for document in documents
    ]

# get document by id for a patient
@router.get("/documents/{document_id}")
def get_patient_document(document_id: int, user = Depends(require_role("patient")), db: Session = Depends(get_db)):
    patient = check_user(user, db)
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.patient_id == patient.auth0_user_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": document.id,
        "filename": document.filename,
        "description": document.description,
        "uploaded_by_id": document.uploaded_by_id,
        "created_at": document.created_at
    }

@router.get("/{patient_id}")
def get_patient(patient_id: str, current_user=Depends(require_role("doctor")), db: Session = Depends(get_db)):
    
    patient = db.query(User).filter(User.auth0_user_id == patient_id, User.role == "patient").first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    doctor = db.query(User).filter(User.auth0_user_id == current_user.get("user_id")).first()
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You don't have access to this patient")
    
    return {
        "auth0_user_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "phone": patient.phone,
        "date_of_birth": patient.date_of_birth,
        "role": patient.role,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "doctor_id": patient.doctor_id
    }

