
import React, { useState } from 'react';
import { useOperatorProfile } from '@/hooks/useOperatorProfile';
import { ProfileOverview } from './ProfileOverview';
import { EditableProfileSections } from './EditableProfileSections';
import { PendingTasksList } from './PendingTasksList';
import ChangePasswordForm from './ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const ProfileDashboard = () => {
  const { data: profile, isLoading, error } = useOperatorProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load profile data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertDescription>
          No profile data found. Please contact support if this issue persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Edit Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfileOverview profile={profile} />
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <EditableProfileSections 
            profile={profile} 
            editingSection={editingSection}
            setEditingSection={setEditingSection}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <PendingTasksList profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
