
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  User, 
  Bell,
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
      name: 'Notice Board',
      href: '/dashboard/notice-board',
      icon: Bell,
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
    {
      name: 'Config',
      href: '/config',
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-r">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">TourMaster AI</h2>
          <p className="text-sm text-gray-600">B2B Dashboard</p>
        </div>
        
        <div className="flex-1 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
