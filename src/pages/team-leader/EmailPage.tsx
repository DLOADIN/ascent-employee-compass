
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailData {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
}

export default function EmailPage() {
  const { currentUser, users } = useAppContext();
  const { toast } = useToast();
  
  // Mock data for emails
  const [sentEmails, setSentEmails] = useState<EmailData[]>([
    {
      id: "1",
      from: currentUser?.id || "",
      to: users.find(u => u.role === "Employee")?.id || "",
      subject: "Task Updates Required",
      content: "Please provide updates on your current tasks by the end of the week.",
      date: new Date(2025, 4, 12),
      read: true,
    },
    {
      id: "2",
      from: currentUser?.id || "",
      to: users.find(u => u.role === "Admin")?.id || "",
      subject: "Department Report",
      content: "Attached is the monthly department performance report.",
      date: new Date(2025, 4, 8),
      read: true,
    },
  ]);
  
  const [receivedEmails, setReceivedEmails] = useState<EmailData[]>([
    {
      id: "3",
      from: users.find(u => u.role === "Employee")?.id || "",
      to: currentUser?.id || "",
      subject: "Weekly Report",
      content: "Here's the report you asked for. Let me know if you need anything else!",
      date: new Date(2025, 4, 10),
      read: false,
    },
    {
      id: "4",
      from: users.find(u => u.role === "Admin")?.id || "",
      to: currentUser?.id || "",
      subject: "Team Performance Review",
      content: "Let's schedule a meeting to discuss the team's performance this quarter.",
      date: new Date(2025, 4, 13),
      read: false,
    },
  ]);
  
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
  });
  
  const handleSendEmail = () => {
    // Validation
    if (!newEmail.to || !newEmail.subject || !newEmail.content) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Create new email
    const email: EmailData = {
      id: Date.now().toString(),
      from: currentUser?.id || "",
      to: newEmail.to,
      subject: newEmail.subject,
      content: newEmail.content,
      date: new Date(),
      read: false,
    };
    
    // Add to sent emails
    setSentEmails([email, ...sentEmails]);
    
    // Reset form
    setNewEmail({
      to: "",
      subject: "",
      content: "",
    });
    
    // Show success message
    toast({
      title: "Email sent",
      description: "Your email has been sent successfully.",
    });
  };
  
  const handleDeleteEmail = (id: string, type: 'sent' | 'received') => {
    if (type === 'sent') {
      setSentEmails(sentEmails.filter(email => email.id !== id));
    } else {
      setReceivedEmails(receivedEmails.filter(email => email.id !== id));
    }
    
    toast({
      title: "Email deleted",
      description: "The email has been deleted.",
    });
  };
  
  const handleMarkAsRead = (id: string) => {
    setReceivedEmails(receivedEmails.map(email => 
      email.id === id ? { ...email, read: true } : email
    ));
  };
  
  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };
  
  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role);
  };
  
  const unreadCount = receivedEmails.filter(email => !email.read).length;
  
  // Get team members (employees that report to this team leader)
  const teamMembers = getUsersByRole("Employee");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email</h1>
          <p className="text-muted-foreground mt-1">
            Send and receive emails within the organization
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar/Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <select 
                  id="recipient"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select recipient</option>
                  <optgroup label="Team Members">
                    {teamMembers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} (Employee)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Management">
                    {users.filter(user => user.role === "Admin" || (user.role === "TeamLeader" && user.id !== currentUser?.id)).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  placeholder="Email subject"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content"
                  value={newEmail.content}
                  onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
                  placeholder="Write your email here..."
                  rows={8}
                />
              </div>
              
              <Button 
                onClick={handleSendEmail} 
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" /> Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Email List/Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <Tabs defaultValue="inbox">
                <TabsList>
                  <TabsTrigger value="inbox" className="relative">
                    Inbox
                    {unreadCount > 0 && (
                      <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="inbox" className="mt-0">
                {receivedEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No emails</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any emails in your inbox.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {receivedEmails.map((email) => (
                      <div 
                        key={email.id} 
                        className={`py-3 ${!email.read ? 'bg-accent/10' : ''}`}
                        onClick={() => handleMarkAsRead(email.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {getUserNameById(email.from)}
                            </p>
                            <p className={`text-sm ${!email.read ? 'font-semibold' : 'text-muted-foreground'}`}>
                              {email.subject}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {email.date.toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmail(email.id, 'received');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{email.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="sent" className="mt-0">
                {sentEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Send className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No sent emails</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't sent any emails yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {sentEmails.map((email) => (
                      <div key={email.id} className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              To: {getUserNameById(email.to)}
                            </p>
                            <p className="text-sm text-muted-foreground">{email.subject}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {email.date.toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteEmail(email.id, 'sent')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{email.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
