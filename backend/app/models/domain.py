from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    date = Column(String) # ISO 8601
    version = Column(String)
    type = Column(String)
    content = Column(Text)
    source_url = Column(String)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, index=True)
    metric = Column(String)
    stated_value = Column(String) # Decimal string for exact INR
    unit = Column(String)
    as_of_date = Column(String) # ISO 8601
    definition = Column(Text, nullable=True)
    source_ids = Column(JSON)
    status = Column(String)
    
class Issue(Base):
    __tablename__ = "issues"
    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, ForeignKey("claims.id"))
    status = Column(String) # open, explained, resolved, reopened
    question = Column(Text)
    evidence_for = Column(JSON)
    evidence_against = Column(JSON)
    suggested_request = Column(Text, nullable=True)

    reviews = relationship("Review", back_populates="issue")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True, index=True)
    issue_id = Column(String, ForeignKey("issues.id"))
    decision = Column(String)
    explanation = Column(Text)
    reviewed_at = Column(String) # ISO 8601
    reviewer = Column(String)
    memory_status = Column(String) # pending, retained, failed

    issue = relationship("Issue", back_populates="reviews")
