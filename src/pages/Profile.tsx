
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { OperatorProfileForm } from '@/components/profile/OperatorProfileForm';

const Profile = () => {
  return (
    <DashboardLayout>
      <OperatorProfileForm />
    </DashboardLayout>
  );
};

export default Profile;
