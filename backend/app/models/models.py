from typing import List, Optional
from sqlalchemy import ForeignKey, Enum, String, Text, DateTime, func, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db import Base


class User(Base):
    __tablename__ = "users"
    
    auth0_user_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum('doctor', 'patient', name='user_role'),
        nullable=False
    )
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    # Foreign key for the patient->doctor relationship. Will be NULL for doctors.
    doctor_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.auth0_user_id"), 
        nullable=True,
        index=True  
    )
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now()
    )
    
    # Database constraints, making sure that these are set for consistency
    __table_args__ = (
        CheckConstraint(
            "(role = 'doctor' AND doctor_id IS NULL) OR role = 'patient'",
            name="check_doctor_patient_constraint"
        ),
    )
    
    patients: Mapped[List["User"]] = relationship(
        "User",  
        back_populates="doctor",
        foreign_keys=[doctor_id] 
    )

    doctor: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="patients",
        foreign_keys=[doctor_id],
        remote_side=[auth0_user_id]  
    )
    
    # For a patient: a list of documents they own.
    owned_documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="patient",
        foreign_keys="Document.patient_id"
    )
    
    # doctor: a list of documents they have uploaded.
    uploaded_documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="uploader",
        foreign_keys="Document.uploaded_by_id"
    )
    
    # validation
    def is_doctor(self) -> bool:
        return self.role == 'doctor'
    
    def is_patient(self) -> bool:
        return self.role == 'patient'
    
    def can_access_document(self, document: "Document") -> bool:
        if self.is_patient():
            return document.patient_id == self.auth0_user_id
        elif self.is_doctor():
            patient_ids = [p.auth0_user_id for p in self.patients]
            return document.patient_id in patient_ids
        return False
    
    def can_upload_for_patient(self, patient_id: str) -> bool:
        if not self.is_doctor():
            return False
        patient_ids = [p.auth0_user_id for p in self.patients]
        return patient_id in patient_ids
    
    def get_full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f"<User(auth0_user_id={self.auth0_user_id}, role={self.role}, name={self.get_full_name()})>"


class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    content_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # The patient who "owns" this document
    patient_id: Mapped[str] = mapped_column(
        ForeignKey("users.auth0_user_id"), 
        nullable=False,
        index=True  
    )
    
    # The user (doctor) who uploaded this document
    uploaded_by_id: Mapped[str] = mapped_column(
        ForeignKey("users.auth0_user_id"), 
        nullable=False,
        index=True  
    )
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # --- Relationships ---
    patient: Mapped["User"] = relationship(
        "User",
        back_populates="owned_documents", 
        foreign_keys=[patient_id]
    )
    
    uploader: Mapped["User"] = relationship(
        "User",
        back_populates="uploaded_documents",
        foreign_keys=[uploaded_by_id]
    )
    
    # --- Validation Methods ---
    def is_owned_by(self, user: User) -> bool:
        return self.patient_id == user.auth0_user_id
    
    def was_uploaded_by(self, user: User) -> bool:
        return self.uploaded_by_id == user.auth0_user_id
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename={self.filename!r}, patient_id={self.patient_id}, uploaded_by_id={self.uploaded_by_id})>"