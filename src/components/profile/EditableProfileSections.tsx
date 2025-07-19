
import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { EditableCompanySection } from './sections/EditableCompanySection';
import { EditableContactSection } from './sections/EditableContactSection';
import { EnhancedServicesSection } from './sections/EnhancedServicesSection';
import { ProofOfTrustSection } from './sections/ProofOfTrustSection';

type OperatorRow = Tables<'operators'>;

interface EditableProfileSectionsProps {
  profile: OperatorRow | undefined;
  editingSection: string | null;
  setEditingSection: (section: string | null) => void;
}

export const EditableProfileSections: React.FC<EditableProfileSectionsProps> = ({
  profile,
  editingSection,
  setEditingSection
}) => {
  return (
    <div className="space-y-6">
      <EditableCompanySection
        profile={profile}
        isEditing={editingSection === 'company'}
        onEdit={() => setEditingSection('company')}
        onCancel={() => setEditingSection(null)}
      />
      
      <EditableContactSection
        profile={profile}
        isEditing={editingSection === 'contact'}
        onEdit={() => setEditingSection('contact')}
        onCancel={() => setEditingSection(null)}
      />
      
      <EnhancedServicesSection
        profile={profile}
        isEditing={editingSection === 'services'}
        onEdit={() => setEditingSection('services')}
        onCancel={() => setEditingSection(null)}
      />
      
      <ProofOfTrustSection
        profile={profile}
        isEditing={editingSection === 'proof-of-trust'}
        onEdit={() => setEditingSection('proof-of-trust')}
        onCancel={() => setEditingSection(null)}
      />
    </div>
  );
};
