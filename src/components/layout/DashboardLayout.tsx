
import React from 'react';
import Navigation from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-x-hidden">
      <Navigation />
      <main className="flex-1 w-full lg:ml-48 xl:ml-64">
        <div className="p-4 sm:p-6 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
