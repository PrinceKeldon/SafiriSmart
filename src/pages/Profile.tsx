
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

const Profile = () => {
  return (
    <DashboardLayout>
      <ProfileDashboard />
    </DashboardLayout>
  );
};

export default Profile;
