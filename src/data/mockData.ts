
import { Lead, Operator, TripItinerary } from '@/types/api';

export const mockOperator: Operator = {
  id: "op-001",
  name: "Sarah Johnson",
  email: "sarah@safariexperts.com",
  company: "Safari Experts Ltd",
  specializations: ["Kenya Safari", "Tanzania Safari", "Luxury Travel"],
  isActive: true
};

export const mockItinerary: TripItinerary = {
  id: "itin-001",
  title: "Ultimate Kenya Safari Adventure",
  overview: "Experience the best of Kenya's wildlife and culture with this 7-day safari adventure covering Masai Mara, Amboseli, and Lake Nakuru.",
  totalDuration: 7,
  estimatedCost: {
    amount: 3500,
    currency: "USD",
    breakdown: {
      accommodation: 1400,
      transport: 800,
      activities: 900,
      meals: 300,
      other: 100
    }
  },
  days: [
    {
      day: 1,
      location: "Nairobi to Masai Mara",
      accommodation: {
        name: "Mara Serena Safari Lodge",
        type: "Safari Lodge",
        rating: 4.5
      },
      activities: [
        {
          name: "Arrival and Evening Game Drive",
          duration: "3 hours",
          description: "Welcome to Kenya! Transfer to Masai Mara and enjoy your first game drive.",
          cost: 150,
          type: "safari"
        }
      ],
      meals: ["Lunch", "Dinner"],
      transport: "Private Safari Vehicle",
      notes: "Welcome briefing at the lodge upon arrival"
    },
    {
      day: 2,
      location: "Masai Mara National Reserve",
      accommodation: {
        name: "Mara Serena Safari Lodge",
        type: "Safari Lodge",
        rating: 4.5
      },
      activities: [
        {
          name: "Full Day Game Drive",
          duration: "8 hours",
          description: "Explore the vast plains of Masai Mara, home to the Big Five and the Great Migration.",
          cost: 200,
          type: "safari"
        },
        {
          name: "Masai Village Visit",
          duration: "2 hours",
          description: "Cultural experience with the local Masai community.",
          cost: 50,
          type: "cultural"
        }
      ],
      meals: ["Breakfast", "Picnic Lunch", "Dinner"],
      transport: "Private Safari Vehicle",
      notes: "Early morning departure recommended for best wildlife viewing"
    }
  ]
};

export const mockLeads: Lead[] = [
  {
    id: "lead-001",
    status: "new",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    assignedOperatorId: "op-001",
    traveler: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1-555-0123",
      country: "United States"
    },
    preferences: {
      destination: "Kenya",
      duration: 7,
      budget: {
        min: 3000,
        max: 5000,
        currency: "USD"
      },
      travelDates: {
        startDate: "2024-03-15",
        endDate: "2024-03-22",
        flexible: true
      },
      groupSize: 2,
      interests: ["Wildlife Safari", "Photography", "Cultural Experience"],
      accommodationType: "luxury"
    },
    itinerary: mockItinerary,
    notes: []
  },
  {
    id: "lead-002",
    status: "contacted",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    assignedOperatorId: "op-001",
    traveler: {
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+44-20-7946-0958",
      country: "United Kingdom"
    },
    preferences: {
      destination: "Tanzania",
      duration: 10,
      budget: {
        min: 4000,
        max: 7000,
        currency: "USD"
      },
      travelDates: {
        startDate: "2024-04-10",
        endDate: "2024-04-20",
        flexible: false
      },
      groupSize: 4,
      interests: ["Serengeti Safari", "Ngorongoro Crater", "Mountain Climbing"],
      accommodationType: "mid-range"
    },
    itinerary: {
      ...mockItinerary,
      id: "itin-002",
      title: "Tanzania Wildlife & Kilimanjaro Adventure",
      totalDuration: 10
    },
    notes: ["Initial contact made via phone", "Interested in combining safari with Kilimanjaro base camp"]
  },
  {
    id: "lead-003",
    status: "quoted",
    createdAt: "2024-01-12T09:15:00Z",
    updatedAt: "2024-01-13T11:30:00Z",
    assignedOperatorId: "op-001",
    traveler: {
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+65-9123-4567",
      country: "Singapore"
    },
    preferences: {
      destination: "Kenya & Tanzania",
      duration: 14,
      budget: {
        min: 6000,
        max: 10000,
        currency: "USD"
      },
      travelDates: {
        startDate: "2024-05-01",
        endDate: "2024-05-15",
        flexible: true
      },
      groupSize: 2,
      interests: ["Big Five Safari", "Great Migration", "Beach Extension"],
      accommodationType: "luxury"
    },
    itinerary: {
      ...mockItinerary,
      id: "itin-003",
      title: "Ultimate East Africa Safari & Beach",
      totalDuration: 14,
      estimatedCost: {
        ...mockItinerary.estimatedCost,
        amount: 8500
      }
    },
    notes: ["Sent detailed quote", "Follow-up scheduled for next week"],
    quotedPrice: 8500,
    quotedCurrency: "USD"
  }
];
