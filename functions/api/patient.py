from firebase_functions import https_fn, storage_fn
from firebase_admin import firestore, storage
from ..shared.admin import db
import uuid
from datetime import datetime

@https_fn.on_request(cors=https_fn.CorsOptions(
    cors_origins="*",  # In production, specify your frontend domain
    cors_methods=["post", "options"],
))
def create_triage_request(req: https_fn.Request) -> https_fn.Response:
    """
    Endpoint for patients
    Steps:
    1. Receives video file URL (after frontend uploads to Firebase Storage)
    2. Creates a Firestore document with status="PENDING"
    3. Returns immediately (video analysis happens via Firestore trigger)
    
    Expected JSON payload:
    {
        "patient_id": "user123",
        "video_storage_path": "videos/user123_timestamp.mp4",
        "symptoms": ["fever", "cough"],
        "additional_info": "Started 3 days ago"
    }
    """
    try:
        # Verify authentication
        auth_header = req.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return https_fn.Response(
                {"error": "Unauthorized - Missing or invalid token"},
                status=401
            )
        
        # TODO: Verify Firebase Auth token
        # from firebase_admin import auth
        # token = auth_header.split('Bearer ')[1]
        # decoded_token = auth.verify_id_token(token)
        # patient_id = decoded_token['uid']
        
        data = req.get_json()
        patient_id = data.get("patient_id")
        video_storage_path = data.get("video_storage_path")  # e.g., "videos/abc123.mp4"
        video_url = data.get("video_url")  # Firebase Storage download URL
        symptoms = data.get("symptoms", [])
        additional_info = data.get("additional_info", "")
        
        if not all([patient_id, video_storage_path, video_url]):
            return https_fn.Response(
                {"error": "Missing required fields: patient_id, video_storage_path, video_url"},
                status=400
            )
        
        # Generate unique request ID
        request_id = f"triage_{uuid.uuid4().hex[:12]}"
        
        # Create triage request document
        request_data = {
            "request_id": request_id,
            "patient_id": patient_id,
            "video_storage_path": video_storage_path,
            "symptoms": symptoms,
            "additional_info": additional_info,
            "status": "PENDING",  # PENDING -> PROCESSING -> COMPLETED/ERROR
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "priority": "normal",  # Will be updated after analysis
            "analysis_result": None
        }
        
        # Save to Firestore (this will trigger the video analysis function)
        doc_ref = db.collection("triage_requests").document(request_id)
        doc_ref.set(request_data)
        
        return https_fn.Response(
            {
                "success": True,
                "message": "Triage request created successfully. Analysis in progress.",
                "request_id": request_id,
                "status": "PENDING"
            },
            status=201
        )
        
    except Exception as e:
        print(f"Error creating triage request: {e}")
        return https_fn.Response(
            {"error": "Internal server error", "details": str(e)},
            status=500
        )


@https_fn.on_request(cors=https_fn.CorsOptions(
    cors_origins="*",
    cors_methods=["get", "options"],
))
def get_triage_status(req: https_fn.Request) -> https_fn.Response:
    """
    Check the status of a triage request.
    Query params: ?request_id=triage_abc123
    """
    try:
        request_id = req.args.get("request_id")
        
        if not request_id:
            return https_fn.Response(
                {"error": "Missing request_id parameter"},
                status=400
            )
        
        doc_ref = db.collection("triage_requests").document(request_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return https_fn.Response(
                {"error": "Triage request not found"},
                status=404
            )
        
        data = doc.to_dict()
        
        # Return sanitized response
        response = {
            "request_id": request_id,
            "status": data.get("status"),
            "created_at": data.get("created_at"),
            "priority": data.get("priority"),
            "analysis_result": data.get("analysis_result")
        }
        
        return https_fn.Response(response, status=200)
        
    except Exception as e:
        print(f"Error fetching triage status: {e}")
        return https_fn.Response(
            {"error": "Internal server error"},
            status=500
        )


@https_fn.on_request(cors=https_fn.CorsOptions(
    cors_origins="*",
    cors_methods=["get", "options"],
))
def get_patient_history(req: https_fn.Request) -> https_fn.Response:
    """
    Get all triage requests for a specific patient.
    Query params: ?patient_id=user123&limit=10
    """
    try:
        # Verify authentication
        auth_header = req.headers.get('Authorization')
        if not auth_header:
            return https_fn.Response({"error": "Unauthorized"}, status=401)
        
        patient_id = req.args.get("patient_id")
        limit = int(req.args.get("limit", 20))
        
        if not patient_id:
            return https_fn.Response(
                {"error": "Missing patient_id parameter"},
                status=400
            )
        
        # Query patient's triage requests
        query = (db.collection("triage_requests")
                .where("patient_id", "==", patient_id)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit))
        
        results = query.stream()
        requests = []
        
        for doc in results:
            data = doc.to_dict()
            requests.append({
                "request_id": doc.id,
                "status": data.get("status"),
                "created_at": data.get("created_at"),
                "priority": data.get("priority"),
                "symptoms": data.get("symptoms"),
                "recommendation": data.get("analysis_result", {}).get("advice_report", {}).get("report_text")
            })
        
        return https_fn.Response(
            {"requests": requests, "count": len(requests)},
            status=200
        )
        
    except Exception as e:
        print(f"Error fetching patient history: {e}")
        return https_fn.Response(
            {"error": "Internal server error"},
            status=500
        )