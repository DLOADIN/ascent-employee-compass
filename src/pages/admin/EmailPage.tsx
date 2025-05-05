
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Mail, Send } from "lucide-react";

// Mock users
const mockUsers: Pick<User, "id" | "name" | "email" | "department">[] = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", department: "IT" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", department: "Finance" },
  { id: "3", name: "Robert Johnson", email: "robert.j@example.com", department: "Sales" },
  { id: "4", name: "Emily Wilson", email: "emily.w@example.com", department: "Customer-Service" },
];

const emailCategories = [
  { id: "credentials", label: "Account Credentials" },
  { id: "job-opportunity", label: "Job Opportunity" },
  { id: "course-recommendation", label: "Course Recommendation" },
  { id: "performance-feedback", label: "Performance Feedback" },
  { id: "announcement", label: "General Announcement" },
  { id: "other", label: "Other" },
];

// Form schema
const formSchema = z.object({
  recipient: z.string({ required_error: "Please select a recipient" }),
  category: z.string({ required_error: "Please select an email category" }),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type EmailFormValues = z.infer<typeof formSchema>;

const EmailPage = () => {
  const { toast } = useToast();
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [recipientType, setRecipientType] = useState<"individual" | "department" | "all">("individual");

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      category: "",
      subject: "",
      message: "",
    },
  });

  const handleSendEmail = (values: EmailFormValues) => {
    // In a real application, this would send an email via an API
    // For now, we'll just simulate it
    
    const recipientInfo = recipientType === "individual" 
      ? mockUsers.find(u => u.id === values.recipient)
      : recipientType === "department" 
        ? { name: values.recipient, email: `all-${values.recipient}@company.com` }
        : { name: "All Employees", email: "all-employees@company.com" };
        
    const newEmail = {
      id: `email-${Date.now()}`,
      recipient: recipientInfo?.name || "Unknown",
      recipientEmail: recipientInfo?.email || "unknown@example.com",
      category: emailCategories.find(c => c.id === values.category)?.label || values.category,
      subject: values.subject,
      message: values.message,
      sentAt: new Date(),
    };
    
    setRecentEmails([newEmail, ...recentEmails].slice(0, 5));
    
    form.reset({
      recipient: "",
      category: "",
      subject: "",
      message: "",
    });
    
    toast({
      title: "Email Sent",
      description: `Your email to ${recipientInfo?.name || "the recipient"} has been sent successfully.`,
    });
  };

  const generateSubjectTemplate = (category: string) => {
    switch (category) {
      case "credentials":
        return "Your Account Credentials for HR Compass";
      case "job-opportunity":
        return "New Job Opportunity: [Position Title]";
      case "course-recommendation":
        return "Course Recommendation: [Course Title]";
      case "performance-feedback":
        return "Feedback on Your Recent Performance";
      case "announcement":
        return "Important Announcement: [Topic]";
      default:
        return "";
    }
  };

  const generateMessageTemplate = (category: string) => {
    switch (category) {
      case "credentials":
        return `Dear [Employee Name],

We are pleased to provide you with your login credentials for the HR Compass system:

Username: [Email Address]
Temporary Password: [Password]

Please log in and change your password immediately. If you have any questions or issues, please contact the HR department.

Best regards,
HR Team`;
      case "job-opportunity":
        return `Dear [Employee Name],

We're excited to inform you about a new job opportunity within our organization that matches your skills and experience.

Position: [Position Title]
Department: [Department]
Location: [Location]

To apply for this position, please visit the internal job board on HR Compass or reply to this email with your updated CV.

Best regards,
HR Team`;
      default:
        return "";
    }
  };

  const onCategoryChange = (value: string) => {
    form.setValue("category", value);
    
    const subjectTemplate = generateSubjectTemplate(value);
    const messageTemplate = generateMessageTemplate(value);
    
    if (subjectTemplate) {
      form.setValue("subject", subjectTemplate);
    }
    
    if (messageTemplate) {
      form.setValue("message", messageTemplate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Email System</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send Email</CardTitle>
            <CardDescription>
              Send emails to employees or departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Recipient Type</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        type="button"
                        variant={recipientType === "individual" ? "default" : "outline"}
                        onClick={() => setRecipientType("individual")}
                        size="sm"
                      >
                        Individual
                      </Button>
                      <Button 
                        type="button"
                        variant={recipientType === "department" ? "default" : "outline"}
                        onClick={() => setRecipientType("department")}
                        size="sm"
                      >
                        Department
                      </Button>
                      <Button 
                        type="button"
                        variant={recipientType === "all" ? "default" : "outline"}
                        onClick={() => setRecipientType("all")}
                        size="sm"
                      >
                        All Employees
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          {recipientType === "individual" ? (
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an employee" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockUsers.map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : recipientType === "department" ? (
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Customer-Service">Customer Service</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input value="All Employees" disabled />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Category</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={(value) => onCategoryChange(value)} 
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select email category" />
                            </SelectTrigger>
                            <SelectContent>
                              {emailCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your email message..." 
                            rows={10}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Recent Emails
            </CardTitle>
            <CardDescription>
              Your recently sent emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmails.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No emails sent yet</p>
              ) : (
                <div className="space-y-4">
                  {recentEmails.map((email) => (
                    <div key={email.id} className="border rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(email.sentAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        To: {email.recipient}
                      </div>
                      <div className="text-xs bg-muted p-2 rounded-md line-clamp-3 whitespace-pre-wrap">
                        {email.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailPage;
