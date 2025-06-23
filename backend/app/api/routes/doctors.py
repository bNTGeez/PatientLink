from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from app.core.permissions import require_role
from app.services.checkUser import check_user
from app.db import get_db
from app.models.models import User, Document
from typing import Optional

router = APIRouter(prefix="/doctors", tags=["doctors"])

# get doctor profile 
@router.get("/profile")
def get_doctor_profile(user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = check_user(user, db)

  return {
    "doctor_id": doctor.auth0_user_id,
    "email": doctor.email,
    "first_name": doctor.first_name,
    "last_name": doctor.last_name,
    "phone": doctor.phone,
    "created_at": doctor.created_at,
    "updated_at": doctor.updated_at
  }

# update doctor profile
@router.put("/profile")
def update_doctor_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    user = Depends(require_role("doctor")), 
    db: Session = Depends(get_db)
):
    doctor = check_user(user, db)
    
    if first_name is not None and first_name.strip():
        doctor.first_name = first_name.strip()
    if last_name is not None and last_name.strip():
        doctor.last_name = last_name.strip()
    if phone is not None:
        doctor.phone = phone.strip() if phone.strip() else None
    
    db.commit()
    db.refresh(doctor)
    return {
        "doctor_id": doctor.auth0_user_id,
        "email": doctor.email,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "phone": doctor.phone,
        "date_of_birth": doctor.date_of_birth,
        "created_at": doctor.created_at,
        "updated_at": doctor.updated_at
    }

# get doctor's patients
@router.get("/patients")
def get_doctor_patients(user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = check_user(user, db)

  patients = doctor.patients  
  return [
    {
      "patient_id": patient.auth0_user_id,
      "email": patient.email,
      "first_name": patient.first_name,
      "last_name": patient.last_name,
      "date_of_birth": patient.date_of_birth,
      "phone": patient.phone,
      "created_at": patient.created_at
    }
    for patient in patients
  ]

# get doctor's patient by id
@router.get("/patients/{patient_id}")
def get_doctor_patient(patient_id: str,  user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    
    if not doctor.can_upload_for_patient(patient_id):
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    patient = db.query(User).filter(
        User.auth0_user_id == patient_id,
        User.role == "patient",
        User.doctor_id == doctor.auth0_user_id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "patient_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "created_at": patient.created_at,
        "documents_count": len(patient.owned_documents)
    }

# update patient information
@router.put("/patients/{patient_id}")
def update_patient(
    patient_id: str,
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    user = Depends(require_role("doctor")), 
    db: Session = Depends(get_db)
):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot update this patient")
    
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
        "created_at": patient.created_at,
        "updated_at": patient.updated_at
    }

# unassign patient from doctor
@router.delete("/patients/{patient_id}")
def unassign_patient(patient_id: str, user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot unassign this patient")
    
    patient.doctor_id = None  # Unassign from doctor
    db.commit()
    return {"message": "Patient unassigned successfully", "patient_id": patient_id}

# add patient to doctor's list
@router.post("/add-patient")
def add_patient_to_doctor(patient_auth0_id: str = Form(...), user=Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    
    patient = db.query(User).filter(User.auth0_user_id == patient_auth0_id, User.role == "patient").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id:
        raise HTTPException(
            status_code=400, 
            detail="Patient is already assigned to a doctor"
        )
    
    patient.doctor_id = doctor.auth0_user_id
    db.commit()
    db.refresh(patient)
    
    return {
        "auth0_user_id": patient.auth0_user_id,
        "email": patient.email,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "phone": patient.phone,
        "date_of_birth": patient.date_of_birth,
        "role": patient.role,
        "doctor_id": patient.doctor_id,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
    }

# get all documents for a patient
@router.get("/patients/{patient_id}/documents")
def get_patient_documents(patient_id: str, user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    documents = patient.owned_documents
    return [
        {
            "document_id": document.id,
            "filename": document.filename,
            "description": document.description,
            "created_at": document.created_at
        }
        for document in documents
    ]

# add new document for a patient
@router.post("/patients/{patient_id}/documents")
def add_patient_document(
    patient_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    user = Depends(require_role("doctor")), 
    db: Session = Depends(get_db)
):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    if not doctor.can_upload_for_patient(patient_id):
        raise HTTPException(status_code=403, detail="You cannot upload documents for this patient")
    
    # STILL NEED TO ADD S3 UPLOAD LATER AND UPDATE FILE PATH
    file_path = f"/uploads/{patient_id}/{file.filename}"
    
    document = Document(
        filename=file.filename,
        file_path=file_path,
        description=description.strip() if description and description.strip() else None,
        patient_id=patient_id,
        uploaded_by_id=doctor.auth0_user_id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return {
        "document_id": document.id,
        "filename": document.filename,
        "file_path": document.file_path,
        "description": document.description,
        "created_at": document.created_at
    }

# get document by id for a patient
@router.get("/patients/{patient_id}/documents/{document_id}")
def get_patient_document(patient_id: str, document_id: int, user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    document = db.query(Document).filter(Document.id == document_id).filter(Document.patient_id == patient_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "document_id": document.id,
        "filename": document.filename,
        "description": document.description,
        "created_at": document.created_at
    }

# update document for a patient  
@router.put("/patients/{patient_id}/documents/{document_id}")
def update_patient_document(
    patient_id: str, 
    document_id: int,
    file: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    user = Depends(require_role("doctor")), 
    db: Session = Depends(get_db)
):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.patient_id == patient_id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if file:
        # STILL NEED TO ADD S3 UPLOAD LATER AND UPDATE FILE PATH
        document.filename = file.filename
        document.file_path = f"/uploads/{patient_id}/{file.filename}"
    
    # Update description if provided (even if empty to allow clearing)
    if description is not None:
        document.description = description.strip() if description.strip() else None
    
    db.commit()
    db.refresh(document)
    return {
        "document_id": document.id,
        "filename": document.filename,
        "description": document.description,
        "created_at": document.created_at
    }

# delete document for a patient
@router.delete("/patients/{patient_id}/documents/{document_id}")
def delete_patient_document(patient_id: str, document_id: int, user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
    doctor = check_user(user, db)
    patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if patient.doctor_id != doctor.auth0_user_id:
        raise HTTPException(status_code=403, detail="You cannot access this patient")
    
    document = db.query(Document).filter(Document.id == document_id).filter(Document.patient_id == patient_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully", "document_id": document_id}

