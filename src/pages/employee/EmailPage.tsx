import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from 'emailjs-com';
import { User } from "@/types";

// !!! REPLACE WITH YOUR ACTUAL EMAILJS CREDENTIALS !!!
const EMAILJS_SERVICE_ID = 'service_igz6o0i'; // Replace with your actual Service ID
const EMAILJS_TEMPLATE_ID = 'template_0yx40dq'; // Replace with your actual Template ID (Assuming this is your Contact Us template)
const EMAILJS_USER_ID = '78ZWX-IRTvsxuxjtd'; // Replace with your actual User ID

// Removed EmailData interface as it's no longer used for mock data
// interface EmailData {
//   id: string;
//   from: string;
//   to: string;
//   subject: string;
//   content: string;
//   date: Date;
//   read: boolean;
// }

export default function EmailPage() {
  const { currentUser, token, users } = useAppContext(); // Get currentUser and token from context
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [selectableUsers, setSelectableUsers] = useState<User[]>([]); // State to store fetched users
  
  const [newEmail, setNewEmail] = useState({
    to: "",  // This will store the user's ID
    recipientEmail: "", // Add this to store the selected user's email
    subject: "",
    content: "",
  });
  
  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return; // Ensure token is available
      try {
        const response = await fetch('https://ascent-employee-compass.onrender.com/api/all-users-for-email', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          // Filter out the current user from the selectable list
          setSelectableUsers(data.filter(user => user.id !== currentUser?.id));
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch users.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };
    fetchUsers();
  }, [token, toast, currentUser]); // Refetch if token, toast, or currentUser changes

  const handleSendEmail = async () => {
    // Validation
    if (!newEmail.to || !newEmail.recipientEmail || !newEmail.subject || !newEmail.content) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    // Find the recipient user from fetched users
    const recipientUser = selectableUsers.find(user => user.id === newEmail.to);

    if (!recipientUser) {
        toast({
            title: "Error",
            description: "Invalid recipient selected.",
            variant: "destructive"
        });
        setIsSending(false);
        return;
    }
    
    const templateParams = {
        title: newEmail.subject,
        name: currentUser?.name || 'Employee',
        email: newEmail.recipientEmail, // Use the stored recipient email
        message: newEmail.content,
        time: new Date().toLocaleString(),
    };

    try {
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_USER_ID
        );
        
        toast({
            title: "Email Sent",
            description: `Your email to ${recipientUser.name} has been sent successfully.`,
        });
        
        // Reset form
        setNewEmail({
          to: "",
          recipientEmail: "", // Reset recipient email
          subject: "",
          content: "",
        });
        
    } catch (error) {
        console.error('Email sending failed:', error);
        toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to send email.",
            variant: "destructive"
        });
    } finally {
        setIsSending(false);
    }
  };

  // Handle recipient selection
  const handleRecipientChange = (userId: string) => {
    const selectedUser = selectableUsers.find(user => user.id === userId);
    setNewEmail(prev => ({
      ...prev,
      to: userId,
      recipientEmail: selectedUser?.email || "", // Store the selected user's email
    }));
  };

  // Function to get user name by ID (not strictly needed now, but can keep if used elsewhere)
  const getUserNameById = (userId: string) => {
    const user = selectableUsers.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email</h1>
          <p className="text-muted-foreground mt-1">
            Send emails within the organization
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:col-span-2 gap-6">
        {/* Compose Email Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recipient Selection (Dropdown) */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <select 
                  id="recipient"
                  value={newEmail.to}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select an employee or team leader</option>
                  {selectableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role} - {user.email})
                    </option>
                  ))}
                </select>
                {newEmail.recipientEmail && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected email: {newEmail.recipientEmail}
                  </p>
                )}
              </div>
              
              {/* Subject Input */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                  placeholder="Email subject"
                />
              </div>
              
              {/* Content Textarea */}
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
              
              {/* Send Button */}
              <Button 
                onClick={handleSendEmail} 
                className="w-full"
                disabled={isSending}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Email Sending Status Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Sending Status
              </CardTitle>
              <CardDescription>
                Check the console for EmailJS logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-muted-foreground">Sent email status will appear here after attempting to send.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
