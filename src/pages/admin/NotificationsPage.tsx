import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Calendar, Trash2, Filter } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Notification, Department } from "@/types";
import { format, isAfter, isBefore, startOfDay, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import axios from "axios";

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Job Opening: Senior Developer",
    message: "We have a new job opening for Senior Developer in the IT department.",
    userId: "all-it",
    isRead: false,
    createdAt: new Date(2024, 4, 1),
    type: "job",
    link: "/jobs/1",
  },
  {
    id: "2",
    title: "New Course Available: Financial Management",
    message: "New course on Financial Management is now available for the Finance department.",
    userId: "all-finance",
    isRead: true,
    createdAt: new Date(2024, 4, 2),
    type: "course",
    link: "/courses/2",
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [notificationType, setNotificationType] = useState<"task" | "course" | "job" | "general">("general");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  
  // Date filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Notification[]>('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications by date
  const filteredNotifications = notifications.filter(notification => {
    if (dateFilterType === "all") return true;
    
    const notificationDate = startOfDay(new Date(notification.createdAt));
    const today = startOfDay(new Date());
    
    switch (dateFilterType) {
      case "today":
        return notificationDate.getTime() === today.getTime();
      case "week":
        const weekAgo = subDays(today, 7);
        return isAfter(notificationDate, weekAgo) || notificationDate.getTime() === weekAgo.getTime();
      case "month":
        const monthAgo = subDays(today, 30);
        return isAfter(notificationDate, monthAgo) || notificationDate.getTime() === monthAgo.getTime();
      case "custom":
        if (startDate && endDate) {
          const start = startOfDay(startDate);
          const end = startOfDay(endDate);
          return (isAfter(notificationDate, start) || notificationDate.getTime() === start.getTime()) && 
                 (isBefore(notificationDate, end) || notificationDate.getTime() === end.getTime());
        }
        return true;
      default:
        return true;
    }
  });

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post<Notification>(
        'http://localhost:5000/api/notifications',
        {
          title,
          message,
          department: department === "all" ? null : department,
          type: notificationType,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update notifications list
      setNotifications([data, ...notifications]);
      
      // Reset form
      setTitle("");
      setMessage("");
      setDepartment("all");
      setNotificationType("general");

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedNotification(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedNotification) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/notifications/${selectedNotification}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotifications(notifications.filter(n => n.id !== selectedNotification));
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete notification",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilterType(value as "all" | "today" | "week" | "month" | "custom");
    if (value !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Notification</CardTitle>
            <CardDescription>
              Send notifications to employees about job opportunities and other updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input 
                  id="title"
                  placeholder="Notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="text-sm font-medium">
                    Department
                  </label>
                  <Select value={department} onValueChange={(value: any) => setDepartment(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Customer-Service">Customer Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select 
                    value={notificationType}
                    onValueChange={(value: any) => setNotificationType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="job">Job Opportunity</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <Button onClick={handleSendNotification} className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              View and manage recent notifications sent to employees
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Select value={dateFilterType} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              {dateFilterType === "custom" && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn(!startDate && "text-muted-foreground")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn(!endDate && "text-muted-foreground")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? isBefore(date, startDate) : false}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications match your filter criteria</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {notification.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notification.type === "job" ? "default" : 
                                        notification.type === "course" ? "secondary" :
                                        "outline"}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(notification.createdAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmDialog
        title="Delete Notification"
        description="Are you sure you want to delete this notification? This action cannot be undone."
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default NotificationsPage;
