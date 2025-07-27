
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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold break-words">Global Operator Profile</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your company details and compliance documents for Kenya safari operations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main profile sections */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          <ProfileOverview profile={profile} />
          <EditableProfileSections
            profile={profile}
            editingSection={editingSection}
            setEditingSection={setEditingSection}
          />
        </div>

        {/* Pending tasks sidebar */}
        <div className="xl:col-span-1 min-w-0">
          <PendingTasksList profile={profile} />
        </div>
      </div>
    </div>
  );
};
