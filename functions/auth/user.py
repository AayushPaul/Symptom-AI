# Import the 'auth' module itself
import firebase_admin.auth

# Import the event type
from firebase_admin.auth import UserCreatedEvent

from shared.models import User
from shared.admin import db

# Use the full module path for the decorator
@firebase_admin.auth.on_user_created()
def on_user_create(event: UserCreatedEvent) -> None:
    """
    Triggered when a new Firebase Auth user is created.
    This function creates a corresponding user profile in Firestore
    with a DEFAULT role of "patient".
    """
    user = event.data  # In v2, the UserRecord is in the 'data' field
    uid = user.uid
    email = user.email

    if not email:
        print(f"User {uid} has no email, skipping profile creation.")
        return

    # Create a new User object with the default "patient" role
    new_user = User(
        email=email,
        userType="patient"  # Default to patient
    )
    
    # Save the new user to the 'users' collection
    try:
        db.collection("users").document(uid).set(new_user.model_dump())
        print(f"Successfully created default profile for: {email} (UID: {uid})")
    except Exception as e:
        print(f"Error creating profile for {uid}: {e}")