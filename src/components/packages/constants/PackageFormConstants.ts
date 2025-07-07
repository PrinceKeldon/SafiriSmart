
export const POPULAR_LOCATIONS = [
  'Masai Mara', 'Serengeti', 'Amboseli', 'Tsavo East', 'Tsavo West',
  'Lake Nakuru', 'Samburu', 'Diani Beach', 'Watamu', 'Malindi',
  'Mount Kenya', 'Hell\'s Gate', 'Naivasha', 'Ngorongoro Crater',
  'Nairobi National Park'
];

export const POPULAR_ACTIVITIES = [
  'Game Drives', 'Cultural Visits', 'Walking Safaris', 'Bird Watching',
  'Photography', 'Hot Air Balloon', 'Boat Rides', 'Hiking',
  'Beach Activities', 'Snorkeling', 'Deep Sea Fishing', 'City Tours'
];

export const DEFAULT_FORM_VALUES = {
  package_name: '',
  description: '',
  min_duration: 1,
  max_duration: 7,
  min_group_size: 1,
  max_group_size: 10,
  budget_tier: 'mid-range' as const,
  estimated_cost_per_person_per_day: 0,
  included_locations: [],
  included_activities: [],
};
