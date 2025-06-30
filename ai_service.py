
import httpx
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

AI_CORE_SERVICE_URL = os.getenv("AI_CORE_SERVICE_URL", "http://localhost:8000")
AI_CORE_SERVICE_API_KEY = os.getenv("AI_CORE_SERVICE_API_KEY", "your-ai-service-key")

class AIService:
    def __init__(self):
        self.base_url = AI_CORE_SERVICE_URL
        self.api_key = AI_CORE_SERVICE_API_KEY
    
    async def generate_itinerary(self, preferences: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Call the AI Core Service to generate an itinerary"""
        try:
            # Transform preferences to match AI Core Service format
            ai_preferences = {
                "duration": preferences.get("duration", 7),
                "budgetRange": preferences.get("budgetRange", "mid-range"),
                "interests": preferences.get("interests", ["wildlife-safari"]),
                "groupSize": preferences.get("groupSize", 2),
                "travelPace": preferences.get("travelPace", "moderate")
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/generate_itinerary",
                    json=ai_preferences,
                    headers={
                        "Content-Type": "application/json",
                        # Add API key header if needed for service-to-service auth
                        # "Authorization": f"Bearer {self.api_key}"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"AI Service error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error calling AI Core Service: {str(e)}")
            return None

# Global AI service instance
ai_service = AIService()
