import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationBell({ currentUser }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      const notifications = await base44.entities.Notification.filter(
        { user_email: currentUser.email },
        "-created_date",
        10
      );
      const unread = notifications.filter(n => !n.is_read);
      setUnreadCount(unread.length);
      setRecentNotifications(notifications.slice(0, 5));
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.Notification.update(notificationId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
      loadNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-600 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Link to={createPageUrl("Notifications")}>
              <Button variant="link" size="sm" className="p-0 h-auto">
                View All
              </Button>
            </Link>
          </div>
          {recentNotifications.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border text-sm ${!notification.is_read ? 'bg-orange-50 border-orange-200' : 'bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{notification.title}</p>
                      <p className="text-slate-600 text-xs mt-1">{notification.message}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(notification.created_date).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 px-2"
                      >
                        ✓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}