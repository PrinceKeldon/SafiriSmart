import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { EditableCompanySection } from './sections/EditableCompanySection';
import { EditableContactSection } from './sections/EditableContactSection';
import { EditableServicesSection } from './sections/EditableServicesSection';
import { EditableDocumentsSection } from './sections/EditableDocumentsSection';

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
      
      <EditableServicesSection
        profile={profile}
        isEditing={editingSection === 'services'}
        onEdit={() => setEditingSection('services')}
        onCancel={() => setEditingSection(null)}
      />
      
      <EditableDocumentsSection
        profile={profile}
        isEditing={editingSection === 'documents'}
        onEdit={() => setEditingSection('documents')}
        onCancel={() => setEditingSection(null)}
      />
    </div>
  );
};