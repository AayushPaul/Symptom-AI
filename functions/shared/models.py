from pydantic import BaseModel, Field, HttpUrl
from typing import List, Literal, Optional
from datetime import datetime

# Define the allowed string values for user types
UserType = Literal["patient", "provider"]

# Define the allowed string values for urgency levels
UrgencyLevel = Literal["mild", "medium", "high"]


class User(BaseModel):
    """
    Data model for a user profile in the 'users' collection.
    The document ID will be the user's Auth UID.
    """
    email: str
    userType: UserType


class TriageRequest(BaseModel):
    """
    Data model for the 'triageRequests' collection.
    This is the "job" created by a patient.
    """
    patientId: str
    status: Literal["pending", "complete"] = "pending"
    videoStoragePath: str
    createdAt: datetime = Field(default_factory=datetime.now)


class TriageResult(BaseModel):
    """
    Data model for the 'triageResults' collection.
    This is the AI analysis created by your backend function.
    """
    patientId: str
    urgency: UrgencyLevel
    aiSummary: str
    extractedSymptoms: List[str]
    recommendations: str
    citationUrl: Optional[str] = None # Use string, as HttpUrl can be strict
    timestamp: datetime = Field(default_factory=datetime.now)


# --- HTTP Function Payloads ---
# These models define the data for your HTTP-callable functions

class CreateRequestResponse(BaseModel):
    """
    The JSON response your backend sends after a patient
    hits the 'createTriageRequest' endpoint.
    """
    requestId: str
    uploadPath: str # The exact path the frontend should upload the video to


class NearbyClinicsPayload(BaseModel):
    """
    The JSON payload the frontend sends when
    asking for nearby clinics.
    """
    latitude: float
    longitude: float