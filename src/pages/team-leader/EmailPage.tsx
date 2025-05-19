import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from 'emailjs-com';

// EmailJS Credentials from the previous setup
const EMAILJS_SERVICE_ID = 'service_igz6o0i';
const EMAILJS_TEMPLATE_ID = 'template_0yx40dq';
const EMAILJS_PUBLIC_KEY = '78ZWX-IRTvsxuxjtd';

export default function EmailPage() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const [newEmail, setNewEmail] = useState({
    to: "",
    fromEmail: "",
    subject: "",
    content: "",
  });

  // Add email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = async () => {
    // Validation
    if (!newEmail.to || !newEmail.fromEmail || !newEmail.subject || !newEmail.content) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields (To, From Email, Subject, Message).",
        variant: "destructive",
      });
      return;
    }

    // Validate email formats
    if (!isValidEmail(newEmail.to)) {
      toast({
        title: "Invalid recipient email",
        description: "Please enter a valid recipient email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(newEmail.fromEmail)) {
      toast({
        title: "Invalid sender email",
        description: "Please enter a valid sender email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    const templateParams = {
      title: newEmail.subject,
      name: currentUser?.name || "Sender",
      email: newEmail.to,
      message: newEmail.content,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      toast({
        title: "Email Sent",
        description: `Your email to ${newEmail.to} has been sent successfully.`,
      });

      // Reset form
      setNewEmail({
        to: "",
        fromEmail: "",
        subject: "",
        content: "",
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Email Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* To (Recipient Email) */}
              <div className="space-y-2">
                <Label htmlFor="to">To *</Label>
                <Input
                  id="to"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                  placeholder="Recipient's email"
                />
              </div>

              {/* From Email */}
              {/* <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email *</Label>
                <Input
                  id="fromEmail"
                  value={newEmail.fromEmail}
                  onChange={(e) => setNewEmail({ ...newEmail, fromEmail: e.target.value })}
                  placeholder="Your email address"
                />
              </div> */}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  value={newEmail.content}
                  onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                  placeholder="Write your message here..."
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
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Sending Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sent email status will appear here after attempting to send.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}