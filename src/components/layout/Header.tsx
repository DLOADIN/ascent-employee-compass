import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppContext } from "@/context/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentUser, notifications, markNotificationAsRead, logout, fetchNotifications, notificationsLoading } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!currentUser) return null;

  const unreadNotifications = notifications.filter(
    (notification) => notification.userId === currentUser.id && !notification.isRead
  );

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch notifications when popover is opened
  const handleNotificationsOpenChange = (open: boolean) => {
    setIsNotificationsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Employee Capability Management System</h1>
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />

        <Popover open={isNotificationsOpen} onOpenChange={handleNotificationsOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadNotifications.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {unreadNotifications.length} unread
                </Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-3 text-center text-muted-foreground">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications
                  .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0))
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-border last:border-b-0 cursor-pointer",
                        !notification.isRead && "bg-muted/50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {notification.createdAt ? notification.createdAt.toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.profileImage} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <span className="text-sm font-medium hidden sm:inline-block">
                  {currentUser.name}
                </span>
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {/* <DropdownMenuItem className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <a href={`/settings/${currentUser.id}`}>Profile</a>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
