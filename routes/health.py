
from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TourMaster AI - B2B Backend",
        "status": "operational",
        "version": "1.0.0"
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "TourMaster AI B2B Backend",
        "endpoints": {
            "auth": {
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me"
            },
            "leads": {
                "create": "POST /api/leads",
                "list": "GET /api/leads",
                "detail": "GET /api/leads/{id}",
                "update_status": "PUT /api/leads/{id}/status",
                "add_note": "POST /api/leads/{id}/notes",
                "add_quote": "PUT /api/leads/{id}/quote"
            }
        }
    }
