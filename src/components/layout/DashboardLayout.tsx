
import React from 'react';
import Navigation from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="ml-48 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
