"""
Main entry point for Firebase Cloud Functions.
Imports and exposes all function modules.
"""

# Import HTTP functions
from .api.patient import (
    create_triage_request,
    get_triage_status,
    get_patient_history
)

from .api.doctor import (
    get_patient_queue,
    get_patient_details,
    get_nearby_clinics
)

# Import Firestore triggers
from .processing.video import on_triage_request_created

# All functions are automatically registered with Firebase
