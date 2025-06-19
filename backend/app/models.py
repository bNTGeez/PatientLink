from typing import List
from sqlalchemy import ForeignKey
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy import func
from app.db import Base

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    users: Mapped[List["User"]] = relationship(back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name={self.name!r})>"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    auth0_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # relationship to Role
    role: Mapped["Role"] = relationship(back_populates="users")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email!r}, role={self.role.name!r})>"
    
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # relationships
    # the user who uploaded it
    uploader: Mapped["User"] = relationship(
        back_populates="uploaded_docs",
        foreign_keys=[uploaded_by]
    )
    
    # the user who owns it 
    owner: Mapped["User"] = relationship(
        back_populates="owned_documents",
        foreign_keys=[owner_id]
    )

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, filename={self.filename!r}, uploaded_by={self.uploaded_by}, owner_id={self.owner_id})>"

# all documents this user uploaded 
User.uploaded_docs = relationship(
    "Document",
    back_populates="uploader",
    foreign_keys=[Document.uploaded_by],
    cascade="all, delete-orphan",
)

User.owned_documents = relationship(
    "Document",
    back_populates="owner",
    foreign_keys=[Document.owner_id],
    cascade="all, delete-orphan",
)
