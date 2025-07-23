
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  User, 
  Mail, 
  Bell, 
  UserPlus, 
  Package,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Leads', href: '/leads', icon: Mail },
    { name: 'Notice Board', href: '/notice-board', icon: Bell },
    { name: 'New Lead', href: '/new-lead', icon: UserPlus },
    { name: 'Packages', href: '/packages', icon: Package },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Settings },
    { name: 'System Config', href: '/admin/system-config', icon: Settings },
    { name: 'Env Config', href: '/admin/env-config', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-4">
          <SidebarTrigger className="h-6 w-6" />
          {!collapsed && (
            <Link to="/dashboard" className="text-lg font-bold text-foreground">
              Safari Connect
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                          isActive(item.href)
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/50 text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground font-medium"
                              : "hover:bg-accent/50 text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {!collapsed && <span>{item.name}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-2">
          {!collapsed && (
            <div className="text-sm text-muted-foreground mb-2 px-2 truncate">
              {user?.name || user?.email}
            </div>
          )}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
