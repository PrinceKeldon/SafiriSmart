
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  UserCircle, 
  Shield,
  Compass
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
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Compass className="h-6 w-6 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TourMaster AI
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Demo Mode
              </span>
            </div>
            <Link
              to="/safari-guide"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              SafariGuide AI →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
