import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Users, FileText, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
  compact?: boolean;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_lead':
      return Users;
    case 'itinerary_ready':
      return FileText;
    case 'lead_update':
      return Bell;
    case 'system':
    default:
      return AlertCircle;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'new_lead':
      return 'text-green-600 bg-green-100';
    case 'itinerary_ready':
      return 'text-blue-600 bg-blue-100';
    case 'lead_update':
      return 'text-amber-600 bg-amber-100';
    case 'system':
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  compact = false,
}) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClasses = getNotificationColor(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
          notification.read ? 'bg-background' : 'bg-accent/50',
          'hover:bg-accent'
        )}
        onClick={handleClick}
      >
        <div className={cn('p-1.5 rounded-full', colorClasses)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm truncate',
            !notification.read && 'font-medium'
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {timeAgo}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
        notification.read ? 'bg-background border-border' : 'bg-accent/30 border-primary/20',
        onClick && 'cursor-pointer hover:bg-accent'
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <div className={cn('p-2 rounded-full', colorClasses)}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm',
            !notification.read && 'font-semibold'
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {notification.message}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
