
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfileDashboard />
        <div className="max-w-6xl mx-auto p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
