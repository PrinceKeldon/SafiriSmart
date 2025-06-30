
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
}
