
export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

export const steps = [
  { number: 1, title: 'Interests', description: 'What interests you most?' },
  { number: 2, title: 'Duration', description: 'How long is your trip?' },
  { number: 3, title: 'Group Size', description: 'How many travelers?' },
  { number: 4, title: 'Budget', description: 'What\'s your budget range?' },
  { number: 5, title: 'Travel Pace', description: 'What\'s your preferred pace?' },
  { number: 6, title: 'Languages', description: 'Preferred languages?' },
  { number: 7, title: 'Schedule', description: 'When do you want to travel?' },
  { number: 8, title: 'Logistics', description: 'Travel arrangements?' },
  { number: 9, title: 'Dietary', description: 'Any dietary requirements?' },
  { number: 10, title: 'Contact Info', description: 'Your details for quotes' }
];
