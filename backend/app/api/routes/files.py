from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.services.s3 import upload_file, generate_presigned_url, delete_file, S3_BUCKET_NAME
from app.models.models import Document, User
from app.db import get_db
from app.core.permissions import require_role
import os
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

# Get all documents - requires authentication
@router.get("/{patient_id}")
def get_patient_documents(patient_id: str, current_user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = db.query(User).filter(User.auth0_user_id == current_user.get("user_id")).first()
  if not doctor:
    raise HTTPException(status_code=404, detail="Doctor not found")
  
  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to access this patient's documents")
  
  patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
  if not patient:
    raise HTTPException(status_code=404, detail="Patient not found")
  
  documents = db.query(Document).filter(Document.patient_id == patient_id).all()
  return {"documents": documents}

# Upload a document
@router.post("/upload")
async def upload_document(patient_id: str, files: list[UploadFile] = File(...), description: str = None, user = Depends(require_role("doctor")), db: Session = Depends(get_db)):

  doctor = db.query(User).filter(User.auth0_user_id == user.get("user_id")).first()
  if not doctor:
    raise HTTPException(status_code=404, detail="Doctor not found")
  
  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to upload documents for this patient")
  
  patient = db.query(User).filter(User.auth0_user_id == patient_id).first()
  if not patient:
    raise HTTPException(status_code=404, detail="Patient not found")

  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to upload documents for this patient")

  results = []
  for upload_file_obj in files:
    if not upload_file_obj.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
          
    # Generate unique filename and S3 key
    base, ext = os.path.splitext(upload_file_obj.filename)
    unique_name = f"{uuid.uuid4()}{ext}"
    s3_key = f"documents/{patient_id}/{unique_name}"

    try:
      # Upload file object directly to S3 
      presigned_url = upload_file(upload_file_obj.file, S3_BUCKET_NAME, s3_key)
    except Exception as e:
      raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")
    
    # Create document record in database
    document = Document(
      filename=upload_file_obj.filename,
      file_path=s3_key,
      patient_id=patient_id,
      uploaded_by_id=doctor.auth0_user_id,
      description=description
    )
  
    db.add(document)
    db.commit()
    db.refresh(document)

    results.append({
      "id": document.id,
      "filename": document.filename,
      "description": document.description,
      "url": presigned_url,
      "uploaded_at": document.created_at
    })

  return {
    "message": f"Successfully uploaded {len(results)} document(s)",
    "documents": results
  }

# Download a document
@router.get("/{patient_id}/{document_id}/download")
def download_document(patient_id: str, document_id: str, current_user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = db.query(User).filter(User.auth0_user_id == current_user.get("user_id")).first()
  if not doctor:
    raise HTTPException(status_code=404, detail="Doctor not found")
  
  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to access this patient's documents")
  
  document = db.query(Document).filter(Document.id == document_id, Document.patient_id == patient_id).first()
  if not document:
    raise HTTPException(status_code=404, detail="Document not found")
  
  try:
    signed_url = generate_presigned_url(S3_BUCKET_NAME, document.file_path, expiration=3600)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error generating presigned URL: {e}")
  
  return {
    "url": signed_url,
    "document": document
  }
  
# Preview a document - requires authentication  
@router.get("/{patient_id}/{document_id}/preview")
def preview_document(patient_id: str, document_id: str, current_user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = db.query(User).filter(User.auth0_user_id == current_user.get("user_id")).first()
  if not doctor:
    raise HTTPException(status_code=404, detail="Doctor not found")
  
  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to access this patient's documents")
  
  document = db.query(Document).filter(Document.id == document_id, Document.patient_id == patient_id).first()
  if not document:
    raise HTTPException(status_code=404, detail="Document not found")
  
  try:
    signed_url = generate_presigned_url(S3_BUCKET_NAME, document.file_path, expiration=3600)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Error generating presigned URL: {e}")
  
  return {
    "url": signed_url,  
    "document": document
  }

# Delete a document
@router.delete("/{patient_id}/{document_id}")
def delete_document(patient_id: str, document_id: str, current_user = Depends(require_role("doctor")), db: Session = Depends(get_db)):
  doctor = db.query(User).filter(User.auth0_user_id == current_user.get("user_id")).first()
  if not doctor:
    raise HTTPException(status_code=404, detail="Doctor not found")
  
  if not doctor.can_upload_for_patient(patient_id):
    raise HTTPException(status_code=403, detail="You are not authorized to delete documents for this patient")
  
  document = db.query(Document).filter(Document.id == document_id, Document.patient_id == patient_id).first()
  if not document:
    raise HTTPException(status_code=404, detail="Document not found")
  
  # delete from S3
  try:
    delete_file(S3_BUCKET_NAME, document.file_path)
  except Exception as e:
    print(f"Warning: Failed to delete file from S3: {e}")
  
  # Delete from database
  db.delete(document)
  db.commit()
  
  return {
    "message": "Document deleted successfully"
  }
  




    



