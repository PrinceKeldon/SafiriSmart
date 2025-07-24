
import React from 'react';
import Navigation from './Navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className={`min-h-screen transition-all duration-300 ${
        isMobile ? 'ml-0' : 'ml-48 lg:ml-64'
      }`}>
        <div className="p-3 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
