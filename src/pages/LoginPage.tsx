
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const DEFAULT_LOGINS = [
  { email: "admin@example.com", password: "admin", role: "Admin" },
  { email: "jane@example.com", password: "leader", role: "TeamLeader" },
  { email: "bob@example.com", password: "employee", role: "Employee" },
];

export default function LoginPage() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoggingIn(true);

    // Simulate a small delay for login
    setTimeout(() => {
      const success = login(data.email, data.password);

      if (success) {
        // Check the email to determine where to redirect
        const user = DEFAULT_LOGINS.find((u) => u.email === data.email);
        if (user) {
          switch (user.role) {
            case "Admin":
              navigate("/admin");
              break;
            case "TeamLeader":
              navigate("/team-leader");
              break;
            case "Employee":
              navigate("/employee");
              break;
            default:
              navigate("/");
          }
        } else {
          navigate("/");
        }
      }
      
      setIsLoggingIn(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            HR
          </div>
          <h1 className="text-2xl font-bold">Welcome to HR Compass</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>

        <div className="p-6 border border-border rounded-lg shadow-sm bg-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Demo Accounts:</p>
          <ul className="mt-2 space-y-1">
            <li>Admin: admin@example.com / admin</li>
            <li>Team Leader: jane@example.com / leader</li>
            <li>Employee: bob@example.com / employee</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
