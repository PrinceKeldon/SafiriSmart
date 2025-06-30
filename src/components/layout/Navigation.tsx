
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  UserCircle, 
  Settings,
  Shield
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard'
    },
    {
      href: '/new-lead',
      label: 'New Lead',
      icon: Users,
      active: location.pathname === '/new-lead'
    },
    {
      href: '/packages',
      label: 'Packages',
      icon: Package,
      active: location.pathname === '/packages'
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: UserCircle,
      active: location.pathname === '/profile'
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Shield,
      active: location.pathname === '/admin'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              TourMaster AI
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Demo Mode (No Auth Required)
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
