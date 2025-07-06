
import React from 'react';
import Navigation from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      <main className="flex-1 ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
