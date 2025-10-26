from firebase_functions import https_fn
from ..shared.admin import db
import json

@https_fn.on_request()
def get_patient_queue(req: https_fn.Request) -> https_fn.Response:
    """
    Returns all triage requests for doctors to view.
    Optionally, filter by status (PROCESSING, COMPLETE, etc.).
    """
    try:
        params = req.query
        status_filter = params.get("status")  

        query = db.collection("triage_requests")
        if status_filter:
            query = query.where("status", "==", status_filter)
            
        results = query.stream()
        triage_requests = []
        for doc in results:
            data = doc.to_dict()
            data["request_id"] = doc.id
            triage_requests.append(data)

        return https_fn.Response(
            json.dumps({"triage_requests": triage_requests}),
            status=200,
            content_type="application/json"
        )

    except Exception as e:
        print(f"Error fetching patient queue: {e}")
        return https_fn.Response("Internal Server Error.", status=500)


@https_fn.on_request()
def get_nearby_clinics(req: https_fn.Request) -> https_fn.Response:
    """
    Example endpoint: returns a ist of clinics for simplicity.
    """
    try:
        clinics = [
            {"name": "West Chester General Hospital", "address": "123 Main St, Santa Barbara, CA"},
            {"name": "Christ Church Hospital", "address": "456 Oak Ave, Santa Barbara, CA"},
        ]
        return https_fn.Response(
            json.dumps({"clinics": clinics}),
            status=200,
            content_type="application/json"
        )
    except Exception as e:
        print(f"Error fetching clinics: {e}")
        return https_fn.Response("Internal Server Error.", status=500)
