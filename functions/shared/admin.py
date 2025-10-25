import importlib
try:
	firebase_admin = importlib.import_module("firebase_admin")
	from firebase_admin import firestore  # type: ignore
except ImportError as e:
	raise ImportError("Missing dependency 'firebase-admin'. Install with: pip install firebase-admin") from e

# initialize app if not already initialized
if not getattr(firebase_admin, "_apps", {}):
	firebase_admin.initialize_app()

# Creates a global database client
db = firestore.client()