
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  User, 
  Inbox,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Lead Inbox',
      href: '/dashboard/notice-board',
      icon: Inbox,
    },
    {
      name: 'Packages',
      href: '/dashboard/packages',
      icon: Package,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-r fixed left-0 top-0 h-full w-48 lg:w-64 z-30 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">TourMaster AI</h2>
          <p className="text-xs sm:text-sm text-gray-600">B2B Dashboard</p>
        </div>
        
        <div className="flex-1 px-2 sm:px-4 py-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 sm:px-4 py-3 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-2 sm:p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm py-3"
          >
            <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
