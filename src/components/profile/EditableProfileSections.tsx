
import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { EditableCompanySection } from './sections/EditableCompanySection';
import { EditableContactSection } from './sections/EditableContactSection';
import { EnhancedServicesSection } from './sections/EnhancedServicesSection';
import { ProofOfTrustSection } from './sections/ProofOfTrustSection';
import { OperatorProfile } from '@/types/operator';

type OperatorRow = Tables<'operators'>;

interface EditableProfileSectionsProps {
  profile: OperatorRow | undefined;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
}

const convertJsonArrayToStringArray = (jsonArray: any): string[] => {
  if (!Array.isArray(jsonArray)) return [];
  return jsonArray.filter(item => typeof item === 'string');
};

const convertToOperatorProfile = (profile: OperatorRow): OperatorProfile => {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    company: profile.company,
    password_hash: profile.password_hash,
    role: profile.role,
    company_name: profile.company_name || undefined,
    registration_number: profile.registration_number || undefined,
    address: profile.address || undefined,
    city: profile.city || undefined,
    country: profile.country || undefined,
    contact_person_name: profile.contact_person_name || undefined,
    contact_person_phone: profile.contact_person_phone || undefined,
    website_url: profile.website_url || undefined,
    description: profile.description || undefined,
    certificate_of_incorporation_url: profile.certificate_of_incorporation_url || undefined,
    business_permit_url: profile.business_permit_url || undefined,
    kato_membership_url: profile.kato_membership_url || undefined,
    specializations: convertJsonArrayToStringArray(profile.specializations),
    services_offered: convertJsonArrayToStringArray(profile.services_offered),
    destinations_covered: convertJsonArrayToStringArray(profile.destinations_covered),
    is_active: profile.is_active || false,
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
    document_verification_status: (profile.document_verification_status as 'pending' | 'under_review' | 'approved' | 'rejected') || 'pending',
    document_verification_notes: profile.document_verification_notes || undefined,
    document_verified_at: profile.document_verified_at || undefined,
    document_verified_by: profile.document_verified_by || undefined,
  };
};

export const EditableProfileSections: React.FC<EditableProfileSectionsProps> = ({
  profile,
  editingSection,
  setEditingSection
}) => {
  if (!profile) return null;

  const operatorProfile = convertToOperatorProfile(profile);

  return (
    <div className="space-y-6">
      <EditableCompanySection
        profile={operatorProfile}
        isEditing={editingSection === 'company'}
        onEdit={() => setEditingSection('company')}
        onCancel={() => setEditingSection(null)}
      />
      
      <EditableContactSection
        profile={operatorProfile}
        isEditing={editingSection === 'contact'}
        onEdit={() => setEditingSection('contact')}
        onCancel={() => setEditingSection(null)}
      />
      
      <EnhancedServicesSection
        profile={operatorProfile}
        isEditing={editingSection === 'services'}
        onEdit={() => setEditingSection('services')}
        onCancel={() => setEditingSection(null)}
      />
      
      <ProofOfTrustSection profile={operatorProfile} />
    </div>
  );
};
