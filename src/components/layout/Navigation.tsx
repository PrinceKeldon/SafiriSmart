
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  User,
  Inbox,
  LogOut,
  Menu,
  X,
  Bell,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { MigrationSidebarCard } from '@/components/migration/MigrationSidebarCard';

const Navigation = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard',         href: '/dashboard',           icon: LayoutDashboard },
    { name: 'AI Planner',        href: '/plan',                icon: Sparkles        },
    { name: 'Migration Tracker', href: '/migration',           icon: Activity        },
    { name: 'Lead Inbox',        href: '/dashboard/notice-board', icon: Inbox        },
    { name: 'Notifications',     href: '/notifications',       icon: Bell            },
    { name: 'Kenya Packages',    href: '/dashboard/packages',  icon: Package         },
    { name: 'Profile',           href: '/dashboard/profile',   icon: User            },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Mobile menu button
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 bg-white shadow-md"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile menu overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
        )}

        {/* Mobile menu */}
        <nav className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b mt-12 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">SafiriSmart</h2>
                <p className="text-sm text-gray-600">Operator Dashboard</p>
              </div>
              <NotificationBell />
            </div>

            <div className="flex-1 px-4 py-4">
              <div className="mb-4">
                <MigrationSidebarCard />
              </div>
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={closeMenu}
                        className={cn(
                          'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
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
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // Desktop navigation
  return (
    <nav className="bg-white shadow-sm border-r fixed left-0 top-0 h-full w-48 lg:w-64 z-30 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-4 sm:p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">SafiriSmart</h2>
            <p className="text-xs sm:text-sm text-gray-600">Operator Dashboard</p>
          </div>
          <NotificationBell />
        </div>

        <div className="flex-1 px-2 sm:px-4 py-4">
          <div className="mb-4 px-1 sm:px-0">
            <MigrationSidebarCard />
          </div>
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
                        ? 'bg-emerald-100 text-emerald-700'
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
