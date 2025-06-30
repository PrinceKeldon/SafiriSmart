
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime
import random
from enum import Enum

app = FastAPI(
    title="SafariGuide AI - Core AI Service",
    description="Intelligent itinerary generation for Kenya safari experiences",
    version="1.0.0"
)

# Pydantic Models for Input (matching frontend TravelPreferences)
class TravelPreferences(BaseModel):
    duration: int = Field(..., ge=1, le=21, description="Trip duration in days")
    budgetRange: Literal['budget', 'mid-range', 'luxury'] = Field(..., description="Budget preference level")
    interests: List[str] = Field(..., description="List of traveler interests")
    groupSize: int = Field(..., ge=1, le=20, description="Number of travelers")
    travelPace: Literal['relaxed', 'moderate', 'active'] = Field(..., description="Preferred travel pace")

# Pydantic Models for Output (matching frontend TourOutput)
class ItineraryDay(BaseModel):
    day_number: int
    theme: str
    location: str
    activities: List[str]
    accommodation_suggestion: str

class TourOutput(BaseModel):
    tour_name: str
    summary: str
    itinerary_details: List[ItineraryDay]
    inclusions_suggestions: List[str]
    exclusions_suggestions: List[str]
    important_notes: List[str]

# Knowledge Base for Intelligent Itinerary Generation
class KenyaDestinations:
    SAFARI_LOCATIONS = {
        'masai_mara': {
            'name': 'Masai Mara National Reserve',
            'strengths': ['wildlife-safari', 'photography', 'cultural'],
            'activities': ['Game Drive', 'Hot Air Balloon Safari', 'Masai Village Visit', 'Wildlife Photography', 'Bush Breakfast'],
            'themes': ['Big Five Safari', 'Great Migration Experience', 'Cultural Immersion']
        },
        'amboseli': {
            'name': 'Amboseli National Park',
            'strengths': ['wildlife-safari', 'photography', 'adventure'],
            'activities': ['Elephant Watching', 'Kilimanjaro Views', 'Game Drive', 'Nature Walk', 'Bird Watching'],
            'themes': ['Elephant Paradise', 'Kilimanjaro Views', 'Wildlife Photography']
        },
        'tsavo': {
            'name': 'Tsavo National Parks',
            'strengths': ['wildlife-safari', 'adventure', 'conservation'],
            'activities': ['Red Elephant Spotting', 'Lugard Falls Visit', 'Rock Climbing', 'Game Drive'],
            'themes': ['Red Elephants Adventure', 'Wilderness Exploration', 'Conservation Experience']
        },
        'samburu': {
            'name': 'Samburu National Reserve',
            'strengths': ['wildlife-safari', 'cultural', 'conservation'],
            'activities': ['Special Five Game Drive', 'Samburu Cultural Visit', 'River Safari', 'Leopard Tracking'],
            'themes': ['Special Five Safari', 'Northern Kenya Culture', 'Leopard Territory']
        },
        'lake_nakuru': {
            'name': 'Lake Nakuru National Park',
            'strengths': ['bird-watching', 'wildlife-safari', 'photography'],
            'activities': ['Flamingo Viewing', 'Rhino Tracking', 'Game Drive', 'Bird Photography'],
            'themes': ['Pink Flamingo Spectacle', 'Rhino Sanctuary', 'Bird Paradise']
        }
    }
    
    COASTAL_LOCATIONS = {
        'diani': {
            'name': 'Diani Beach',
            'strengths': ['beach', 'luxury-travel', 'adventure'],
            'activities': ['Beach Relaxation', 'Dhow Sailing', 'Snorkeling', 'Kite Surfing', 'Colobus Monkey Sanctuary'],
            'themes': ['Tropical Paradise', 'Water Sports', 'Marine Life']
        },
        'watamu': {
            'name': 'Watamu Marine Park',
            'strengths': ['beach', 'conservation', 'bird-watching'],
            'activities': ['Turtle Watching', 'Snorkeling', 'Deep Sea Fishing', 'Mangrove Tour'],
            'themes': ['Marine Conservation', 'Coral Gardens', 'Turtle Sanctuary']
        }
    }
    
    CULTURAL_LOCATIONS = {
        'nairobi': {
            'name': 'Nairobi',
            'strengths': ['cultural', 'conservation', 'photography'],
            'activities': ['David Sheldrick Elephant Orphanage', 'Giraffe Centre', 'Karen Blixen Museum', 'Nairobi National Park'],
            'themes': ['Urban Safari', 'Conservation Centers', 'Colonial History']
        },
        'lamu': {
            'name': 'Lamu Island',
            'strengths': ['cultural', 'beach', 'luxury-travel'],
            'activities': ['Swahili Architecture Tour', 'Dhow Building', 'Traditional Donkey Rides', 'Sunset Dhow Cruise'],
            'themes': ['Swahili Heritage', 'Island Culture', 'Historical Journey']
        }
    }

class AccommodationManager:
    BUDGET_ACCOMMODATIONS = {
        'safari': 'Comfortable Safari Camp with Shared Facilities',
        'beach': 'Beach Guesthouse with Ocean Views',
        'city': 'Budget Hotel in City Center',
        'cultural': 'Traditional Guesthouse'
    }
    
    MID_RANGE_ACCOMMODATIONS = {
        'safari': 'Safari Lodge with Ensuite Facilities and Game Viewing Deck',
        'beach': 'Beachfront Resort with Pool and Restaurant',
        'city': 'Boutique Hotel with Modern Amenities',
        'cultural': 'Heritage Hotel with Cultural Experiences'
    }
    
    LUXURY_ACCOMMODATIONS = {
        'safari': 'Luxury Safari Lodge with Private Balcony and Butler Service',
        'beach': 'Exclusive Beach Resort with Private Villa and Spa',
        'city': 'Five-Star Hotel with Concierge Services',
        'cultural': 'Luxury Cultural Lodge with Personalized Experiences'
    }

class ItineraryGenerator:
    def __init__(self):
        self.destinations = KenyaDestinations()
        self.accommodation_manager = AccommodationManager()
    
    def analyze_interests(self, interests: List[str]) -> Dict[str, float]:
        """Analyze user interests and return weighted preferences"""
        interest_weights = {
            'safari': 0.0,
            'beach': 0.0,
            'cultural': 0.0,
            'adventure': 0.0,
            'conservation': 0.0,
            'photography': 0.0
        }
        
        for interest in interests:
            if 'wildlife' in interest.lower() or 'safari' in interest.lower():
                interest_weights['safari'] += 1.0
            if 'beach' in interest.lower() or 'coast' in interest.lower():
                interest_weights['beach'] += 1.0
            if 'cultural' in interest.lower():
                interest_weights['cultural'] += 1.0
            if 'adventure' in interest.lower():
                interest_weights['adventure'] += 0.8
            if 'conservation' in interest.lower():
                interest_weights['conservation'] += 0.8
            if 'photography' in interest.lower():
                interest_weights['photography'] += 0.6
        
        return interest_weights
    
    def select_destinations(self, interests: List[str], duration: int, pace: str) -> List[Dict]:
        """Intelligently select destinations based on interests and duration"""
        interest_weights = self.analyze_interests(interests)
        selected_destinations = []
        
        # Always start with Nairobi for arrival
        selected_destinations.append({
            'location': 'nairobi',
            'data': self.destinations.CULTURAL_LOCATIONS['nairobi'],
            'days': 1
        })
        
        remaining_days = duration - 2  # Reserve 1 day for arrival, 1 for departure
        
        # Prioritize destinations based on interests
        if interest_weights['safari'] > 0:
            # Add primary safari destination
            if duration >= 5:
                selected_destinations.append({
                    'location': 'masai_mara',
                    'data': self.destinations.SAFARI_LOCATIONS['masai_mara'],
                    'days': min(3, remaining_days // 2)
                })
                remaining_days -= min(3, remaining_days // 2)
            
            # Add secondary safari destination for longer trips
            if duration >= 10 and remaining_days >= 2:
                selected_destinations.append({
                    'location': 'amboseli',
                    'data': self.destinations.SAFARI_LOCATIONS['amboseli'],
                    'days': min(2, remaining_days // 2)
                })
                remaining_days -= min(2, remaining_days // 2)
        
        # Add beach destination if interested
        if interest_weights['beach'] > 0 and remaining_days >= 2:
            beach_days = min(3, remaining_days)
            selected_destinations.append({
                'location': 'diani',
                'data': self.destinations.COASTAL_LOCATIONS['diani'],
                'days': beach_days
            })
            remaining_days -= beach_days
        
        # Add cultural destinations
        if interest_weights['cultural'] > 0.5 and remaining_days >= 2:
            cultural_days = min(2, remaining_days)
            selected_destinations.append({
                'location': 'lamu',
                'data': self.destinations.CULTURAL_LOCATIONS['lamu'],
                'days': cultural_days
            })
            remaining_days -= cultural_days
        
        # Add conservation-focused destination
        if interest_weights['conservation'] > 0.5 and remaining_days >= 2:
            selected_destinations.append({
                'location': 'samburu',
                'data': self.destinations.SAFARI_LOCATIONS['samburu'],
                'days': min(2, remaining_days)
            })
        
        # Add departure day in Nairobi
        selected_destinations.append({
            'location': 'nairobi_departure',
            'data': self.destinations.CULTURAL_LOCATIONS['nairobi'],
            'days': 1
        })
        
        return selected_destinations
    
    def generate_activities(self, location_data: Dict, pace: str, group_size: int, interests: List[str]) -> List[str]:
        """Generate activities based on pace, group size, and interests"""
        available_activities = location_data['activities']
        
        # Adjust number of activities based on pace
        if pace == 'relaxed':
            activity_count = min(2, len(available_activities))
        elif pace == 'moderate':
            activity_count = min(3, len(available_activities))
        else:  # active
            activity_count = min(4, len(available_activities))
        
        # Prioritize activities based on interests
        prioritized_activities = []
        for interest in interests:
            for activity in available_activities:
                if any(keyword in activity.lower() for keyword in interest.lower().split()) and activity not in prioritized_activities:
                    prioritized_activities.append(activity)
        
        # Add remaining activities
        for activity in available_activities:
            if activity not in prioritized_activities:
                prioritized_activities.append(activity)
        
        # Adjust for group size
        if group_size > 6:
            # Add group-friendly activities
            group_activities = ['Group Game Drive', 'Community Visit', 'Group Bush Breakfast']
            for activity in group_activities:
                if activity not in prioritized_activities:
                    prioritized_activities.insert(0, activity)
        
        return prioritized_activities[:activity_count]
    
    def get_accommodation(self, budget_level: str, location_type: str) -> str:
        """Get appropriate accommodation based on budget and location"""
        if budget_level == 'budget':
            return self.accommodation_manager.BUDGET_ACCOMMODATIONS.get(location_type, 'Comfortable Lodge')
        elif budget_level == 'mid-range':
            return self.accommodation_manager.MID_RANGE_ACCOMMODATIONS.get(location_type, 'Quality Safari Lodge')
        else:  # luxury
            return self.accommodation_manager.LUXURY_ACCOMMODATIONS.get(location_type, 'Luxury Safari Lodge')
    
    def generate_itinerary(self, preferences: TravelPreferences) -> TourOutput:
        """Generate complete itinerary based on preferences"""
        destinations = self.select_destinations(preferences.interests, preferences.duration, preferences.travelPace)
        
        itinerary_days = []
        current_day = 1
        
        for dest in destinations:
            location_data = dest['data']
            days_at_location = dest['days']
            
            for day_at_location in range(days_at_location):
                # Determine location type for accommodation
                if 'safari' in location_data['strengths'] or 'wildlife' in location_data['strengths']:
                    location_type = 'safari'
                elif 'beach' in location_data['strengths']:
                    location_type = 'beach'
                elif 'cultural' in location_data['strengths']:
                    location_type = 'cultural'
                else:
                    location_type = 'safari'
                
                # Generate theme based on day and location
                if current_day == 1:
                    theme = f"Arrival & {location_data['name']} Introduction"
                elif current_day == preferences.duration:
                    theme = "Departure & Safari Memories"
                elif day_at_location == 0:
                    theme = f"{location_data['themes'][0]} - Arrival"
                else:
                    theme_index = min(day_at_location, len(location_data['themes']) - 1)
                    theme = location_data['themes'][theme_index]
                
                # Generate activities
                activities = self.generate_activities(
                    location_data, 
                    preferences.travelPace, 
                    preferences.groupSize, 
                    preferences.interests
                )
                
                # Get accommodation
                accommodation = self.get_accommodation(preferences.budgetRange, location_type)
                
                itinerary_days.append(ItineraryDay(
                    day_number=current_day,
                    theme=theme,
                    location=location_data['name'],
                    activities=activities,
                    accommodation_suggestion=accommodation
                ))
                
                current_day += 1
        
        # Generate tour name
        tour_name = self.generate_tour_name(preferences)
        
        # Generate summary
        summary = self.generate_summary(preferences, destinations)
        
        # Generate inclusions and exclusions
        inclusions = self.generate_inclusions(preferences)
        exclusions = self.generate_exclusions()
        
        # Generate important notes
        important_notes = self.generate_important_notes(preferences, destinations)
        
        return TourOutput(
            tour_name=tour_name,
            summary=summary,
            itinerary_details=itinerary_days,
            inclusions_suggestions=inclusions,
            exclusions_suggestions=exclusions,
            important_notes=important_notes
        )
    
    def generate_tour_name(self, preferences: TravelPreferences) -> str:
        """Generate dynamic tour name based on preferences"""
        duration_text = f"{preferences.duration}-Day"
        
        if 'wildlife-safari' in preferences.interests or 'photography' in preferences.interests:
            if preferences.budgetRange == 'luxury':
                return f"{duration_text} Ultimate Luxury Kenya Safari"
            elif preferences.budgetRange == 'budget':
                return f"{duration_text} Essential Kenya Safari Adventure"
            else:
                return f"{duration_text} Classic Kenya Safari Experience"
        elif 'beach' in preferences.interests:
            return f"{duration_text} Kenya Safari & Beach Paradise"
        elif 'cultural' in preferences.interests:
            return f"{duration_text} Cultural Kenya Safari Journey"
        else:
            return f"{duration_text} Kenya Discovery Adventure"
    
    def generate_summary(self, preferences: TravelPreferences, destinations: List[Dict]) -> str:
        """Generate dynamic summary based on itinerary"""
        pace_text = {
            'relaxed': 'leisurely',
            'moderate': 'well-balanced',
            'active': 'action-packed'
        }
        
        budget_text = {
            'budget': 'comfortable',
            'mid-range': 'quality',
            'luxury': 'luxury'
        }
        
        location_names = [dest['data']['name'] for dest in destinations[1:-1]]  # Exclude arrival/departure
        locations_text = ', '.join(location_names)
        
        return f"Experience the best of Kenya with this carefully crafted {preferences.duration}-day safari visiting {locations_text}. Perfect for {preferences.groupSize} travelers seeking a {pace_text[preferences.travelPace]} adventure with {budget_text[preferences.budgetRange]} accommodations and personalized experiences."
    
    def generate_inclusions(self, preferences: TravelPreferences) -> List[str]:
        """Generate inclusions based on preferences"""
        base_inclusions = [
            "All park entrance fees and conservancy fees",
            "Professional safari guide throughout the trip",
            "Game drives as per itinerary",
            "Accommodation as specified in itinerary",
            "All meals during safari (breakfast, lunch, dinner)",
            "Transportation in 4WD safari vehicle with pop-up roof"
        ]
        
        if preferences.budgetRange == 'luxury':
            base_inclusions.extend([
                "Private safari vehicle and guide",
                "Premium accommodation with full board",
                "Sundowner drinks in the bush",
                "Airport transfers in luxury vehicle"
            ])
        elif preferences.budgetRange == 'mid-range':
            base_inclusions.extend([
                "Semi-private safari vehicle (max 6 guests)",
                "Quality accommodation with ensuite facilities",
                "Airport transfers included"
            ])
        
        if preferences.groupSize > 6:
            base_inclusions.append("Group coordination and logistics support")
        
        return base_inclusions
    
    def generate_exclusions(self) -> List[str]:
        """Generate standard exclusions"""
        return [
            "International flights to/from Kenya",
            "Visa fees and travel documents",
            "Personal expenses and souvenirs",
            "Alcoholic beverages (unless specified)",
            "Travel insurance (strongly recommended)",
            "Tips and gratuities for guides and staff",
            "Optional activities not mentioned in itinerary",
            "Laundry services"
        ]
    
    def generate_important_notes(self, preferences: TravelPreferences, destinations: List[Dict]) -> List[str]:
        """Generate important notes based on itinerary"""
        notes = [
            "Best time to visit Kenya is during dry seasons (June-October, December-March)",
            "Comfortable walking shoes and neutral-colored clothing recommended for game drives",
            "Binoculars and camera equipment with extra batteries advised",
            "Yellow fever vaccination required if arriving from endemic areas"
        ]
        
        # Add destination-specific notes
        for dest in destinations:
            if dest['location'] == 'masai_mara':
                notes.append("Great Migration typically occurs July-October in Masai Mara")
            elif dest['location'] == 'diani':
                notes.append("Beach activities depend on weather and tide conditions")
            elif dest['location'] == 'amboseli':
                notes.append("Clear Kilimanjaro views are best in early morning and late afternoon")
        
        if preferences.groupSize > 8:
            notes.append("Large groups may require multiple safari vehicles for optimal game viewing")
        
        if preferences.travelPace == 'active':
            notes.append("Active itinerary includes early morning starts (5:30-6:00 AM)")
        
        return notes

# Initialize the itinerary generator
itinerary_generator = ItineraryGenerator()

@app.post("/generate_itinerary", response_model=TourOutput)
async def generate_itinerary(preferences: TravelPreferences):
    """
    Generate intelligent Kenya safari itinerary based on travel preferences
    """
    try:
        # Validate preferences
        if preferences.duration < 1 or preferences.duration > 21:
            raise HTTPException(status_code=400, detail="Duration must be between 1 and 21 days")
        
        if preferences.groupSize < 1 or preferences.groupSize > 20:
            raise HTTPException(status_code=400, detail="Group size must be between 1 and 20 people")
        
        if not preferences.interests:
            raise HTTPException(status_code=400, detail="At least one interest must be specified")
        
        # Generate the itinerary
        tour_output = itinerary_generator.generate_itinerary(preferences)
        
        return tour_output
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating itinerary: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "SafariGuide AI - Core AI Service",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Core AI Service",
        "endpoints": {
            "generate_itinerary": "POST /generate_itinerary",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
