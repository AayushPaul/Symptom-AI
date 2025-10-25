from firebase_functions import https_fn
from firebase_admin import auth
from shared.admin import db
from shared.models import UserType

@https_fn.on_call()
def set_user_role(req: https_fn.CallableRequest) -> https_fn.Response:
    """
    An HTTP-callable function that allows a user to update their
    own role ONE time to "provider".
    """
    # 1. Gets the user's ID from the user's auth token
    uid = req.auth.uid
    if not uid:
        raise https_fn.FunctionsError(
            code=https_fn.FunctionsError.UNAUTHENTICATED,
            message="User is not authenticated."
        )

    # 2. Gets the role they want to set from the request
    # The frontend will send: {"role": "provider"}
    try:
        role_to_set: UserType = req.data["role"]
    except KeyError:
        raise https_fn.FunctionsError(
            code=https_fn.FunctionsError.INVALID_ARGUMENT,
            message="Request body must include a 'role' field."
        )

    # 3. Security Check: Only allow setting to "provider"
    if role_to_set != "provider":
        raise https_fn.FunctionsError(
            code=https_fn.FunctionsError.INVALID_ARGUMENT,
            message="Role can only be set to 'provider'."
        )

    # 4. Gets the user's current profile from Firestore
    user_ref = db.collection("users").document(uid)
    try:
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise https_fn.FunctionsError(
                code=https_fn.FunctionsError.NOT_FOUND,
                message="User profile not found."
            )
        
        # 5. Only allows the update if their current role is "patient".
        # This prevents a provider from changing back to a patient, etc.
        current_role = user_doc.to_dict().get("userType")
        if current_role != "patient":
            raise https_fn.FunctionsError(
                code=https_fn.FunctionsError.FAILED_PRECONDITION,
                message=f"User role is already '{current_role}' and cannot be changed."
            )

        # 6. All checks passed. Update the role.
        user_ref.update({"userType": "provider"})
        
        print(f"Successfully updated role for user {uid} to 'provider'.")
        return https_fn.Response({"status": "success", "newRole": "provider"})

    except Exception as e:
        print(f"Error setting user role for {uid}: {e}")
        raise https_fn.FunctionsError(
            code=https_fn.FunctionsError.INTERNAL,
            message="An internal error occurred."
        )