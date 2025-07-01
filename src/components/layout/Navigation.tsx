
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  UserCircle, 
  MapPin
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
    }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-orange-200/60 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-3 text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors"
            >
              <div className="relative">
                <MapPin className="h-6 w-6 text-orange-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  TourMaster AI
                </span>
                <div className="text-xs text-gray-500 font-normal">by SafiriSmart</div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100'
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
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
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
