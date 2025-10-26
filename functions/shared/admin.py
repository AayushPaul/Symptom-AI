"""
Firebase Admin SDK initialization.
This module initializes the Firebase Admin SDK and provides
database and storage clients to other modules.
"""

import firebase_admin
from firebase_admin import credentials, firestore, storage

# Initialize Firebase Admin SDK
# In Cloud Functions, default credentials are used automatically
if not firebase_admin._apps:
    firebase_admin.initialize_app()

# Get Firestore client
db = firestore.client()

# Get Storage bucket
bucket = storage.bucket()