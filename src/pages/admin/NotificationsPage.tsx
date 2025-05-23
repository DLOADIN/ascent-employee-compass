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
import { Bell, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Notification, Department } from "@/types";
import axios from "axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [department, setDepartment] = useState<Department | "all">("all");
  const [notificationType, setNotificationType] = useState<"task" | "course" | "job" | "general">("general");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Notification[]>('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort notifications by date, most recent first
      const sortedNotifications = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(sortedNotifications);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        type: notificationType,
        department: department === "all" ? null : department
      };

      await axios.post(
        'http://localhost:5000/api/notifications',
        notificationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh notifications list
      await fetchNotifications();
      
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
      console.error('Error sending notification:', error);
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

        // Remove the deleted notification and fetch latest list
        await fetchNotifications();
        
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      } catch (error: any) {
        console.error('Error deleting notification:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete notification",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
        setSelectedNotification(null);
      }
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications found</p>
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
                    {notifications.map((notification) => (
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
                          {notification.createdAt ? 
                            new Date(notification.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'Unknown date'}
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
