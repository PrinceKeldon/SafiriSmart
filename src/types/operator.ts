
export interface OperatorProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  company_name?: string;
  registration_number?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  website_url?: string;
  description?: string;
  certificate_of_incorporation_url?: string;
  business_permit_url?: string;
  kato_membership_url?: string;
  specializations?: string[];
  services_offered?: string[];
  destinations_covered?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OperatorProfileUpdate {
  company_name?: string;
  registration_number?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  website_url?: string;
  description?: string;
  certificate_of_incorporation_url?: string;
  business_permit_url?: string;
  kato_membership_url?: string;
  services_offered?: string[];
  destinations_covered?: string[];
}

export interface OperatorPackage {
  id: string;
  operator_id: string;
  package_name: string;
  description?: string;
  min_duration: number;
  max_duration: number;
  min_group_size: number;
  max_group_size: number;
  budget_tier: string;
  estimated_cost_per_person_per_day: number;
  included_locations: string[];
  included_activities: string[];
  created_at: string;
  updated_at: string;
}

export interface OperatorPackageCreate {
  package_name: string;
  description?: string;
  min_duration: number;
  max_duration: number;
  min_group_size: number;
  max_group_size: number;
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  estimated_cost_per_person_per_day: number;
  included_locations: string[];
  included_activities: string[];
}

export interface OperatorPackageUpdate {
  package_name?: string;
  description?: string;
  min_duration?: number;
  max_duration?: number;
  min_group_size?: number;
  max_group_size?: number;
  budget_tier?: 'budget' | 'mid-range' | 'luxury';
  estimated_cost_per_person_per_day?: number;
  included_locations?: string[];
  included_activities?: string[];
}
