import React, { useState } from 'react';
import { useOperatorProfile } from '@/hooks/useOperatorProfile';
import { Loader2 } from 'lucide-react';
import { ProfileOverview } from './ProfileOverview';
import { EditableProfileSections } from './EditableProfileSections';
import { PendingTasksList } from './PendingTasksList';
import { Tables } from '@/integrations/supabase/types';

type OperatorRow = Tables<'operators'>;

export const ProfileDashboard: React.FC = () => {
  const { data: profile, isLoading } = useOperatorProfile();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company details and compliance documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile sections */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileOverview profile={profile} />
          <EditableProfileSections
            profile={profile}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
          />
        </div>

        {/* Pending tasks sidebar */}
        <div className="lg:col-span-1">
          <PendingTasksList profile={profile} />
        </div>
      </div>
    </div>
  );
};