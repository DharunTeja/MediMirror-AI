"""
MediMirror AI - Authentication Router
Handles user registration, login, and profile management.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.models.schemas import (
    SignUpRequest,
    SignInRequest,
    AuthResponse,
    UserProfile,
    UserProfileUpdate,
)
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """Register a new user."""
    try:
        # Sign up with Supabase Auth
        result = supabase_service.sign_up(
            email=request.email,
            password=request.password,
            metadata={"full_name": request.full_name, "role": request.role.value},
        )

        user = result.user
        session = result.session

        # Create profile in profiles table
        try:
            supabase_service.create_profile(
                {
                    "id": user.id,
                    "email": request.email,
                    "full_name": request.full_name,
                    "role": request.role.value,
                }
            )
        except Exception:
            pass  # Profile might be auto-created by DB trigger

        return AuthResponse(
            access_token=session.access_token if session else "",
            refresh_token=session.refresh_token if session else None,
            user={"id": user.id, "email": user.email, "role": request.role.value},
            message="Registration successful",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """Sign in an existing user."""
    try:
        result = supabase_service.sign_in(
            email=request.email, password=request.password
        )

        user = result.user
        session = result.session

        # Get profile data
        profile = supabase_service.get_profile(user.id)

        return AuthResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user={
                "id": user.id,
                "email": user.email,
                "role": profile.get("role", "patient") if profile else "patient",
                "full_name": profile.get("full_name", "") if profile else "",
            },
            message="Login successful",
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/profile", response_model=UserProfile)
async def get_profile(authorization: str = Header(...)):
    """Get the current user's profile."""
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase_service.get_user(token)
        user = user_response.user

        profile = supabase_service.get_profile(user.id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return UserProfile(**profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    update_data: UserProfileUpdate, authorization: str = Header(...)
):
    """Update the current user's profile."""
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase_service.get_user(token)
        user = user_response.user

        # Filter out None values
        data = {k: v for k, v in update_data.model_dump().items() if v is not None}

        updated = supabase_service.update_profile(user.id, data)
        return UserProfile(**updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_profile_by_id(user_id: str):
    """Get a user profile by ID (for doctor access via QR)."""
    try:
        profile = supabase_service.get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return UserProfile(**profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
