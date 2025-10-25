from firebase_functions import auth_fn
from shared.models import User
from shared.admin import db

@auth_fn.on_user_created
def on_user_create(event: auth_fn.AuthBlockingEvent) -> None:
    """
    Triggered when a new Firebase Auth user is created.
    This function creates a corresponding user profile in Firestore
    with a DEFAULT role of "patient".
    """
    user = event.data
    uid = user.uid
    email = user.email

    if not email:
        print(f"User {uid} has no email, skipping profile creation.")
        return

    # Creates a new User object with the default "patient" role
    # The frontend will be responsible for asking them if they
    # want to change their role to "provider".
    new_user = User(
        email=email,
        userType="patient"  # Default to patient
    )
    
    # Saves the new user to the 'users' collection
    try:
        db.collection("users").document(uid).set(new_user.model_dump())
        print(f"Successfully created default profile for: {email} (UID: {uid})")
    except Exception as e:
        print(f"Error creating profile for {uid}: {e}")