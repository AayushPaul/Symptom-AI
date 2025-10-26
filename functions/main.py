# 1. Initialize the Firebase Admin SDK
# This import runs the code in admin.py and initializes the app
from shared.admin import db 

# 2. Import all the functions you have created
# This "registers" them with the Firebase emulator
from auth.user import on_user_create
from api.userModeChange import set_user_role