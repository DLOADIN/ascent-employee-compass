import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { Eye, EyeOff } from "lucide-react";

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
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      const response = await login(data.email, data.password);
      if (response.success) {
        // First, check for a specific redirect from the location state
        const from = location.state?.from;
        
        // Next, check for a lastVisitedPath in localStorage
        const lastVisitedPath = localStorage.getItem('lastVisitedPath');
        
        // Finally, fall back to the redirect from the login response or the role-based default
        const redirectPath = from || lastVisitedPath || response.redirect || "/";
        
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
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
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
          <div className="mt-2 space-y-4">
             Admin Section 
             <div>
              <h3 className="font-bold text-base mb-1">Administrator</h3>
              <ul className="space-y-1">
                <li>John Payton (admin@gmail.com / TestPassword123!)</li>
              </ul>
            </div> 

            Team Leaders Section 
            <div>
              <h3 className="font-bold text-base mb-1">Team Leaders</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">IT Department</h4>
                  <ul className="space-y-1">
                    <li>Jill Wagner Joe (jillwagner@gmail.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Finance Department</h4>
                  <ul className="space-y-1">
                    <li>Fina Nicer (teamlead.finance@hrms.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Sales Department</h4>
                  <ul className="space-y-1">
                    <li>Team Leader Sales (teamlead.sales@hrms.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Customer Service Department</h4>
                  <ul className="space-y-1">
                    <li>Team Leader Customer-Service (teamlead.customerservice@hrms.com / TestPassword123!)</li>
                  </ul>
                </div>
              </div>
            </div> 

             Employees Section 
            <div>
              <h3 className="font-bold text-base mb-1">Employees</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">IT Department</h4>
                  <ul className="space-y-1">
                    <li>Brian Joe (brian@gmal.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Finance Department</h4>
                  <ul className="space-y-1">
                    <li>Sarah Johnson (sarah.j@company.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Sales Department</h4>
                  <ul className="space-y-1">
                    <li>Sales Employee (employee.sales@hrms.com / TestPassword123!)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Customer Service Department</h4>
                  <ul className="space-y-1">
                    <li>Gary Jerry (employee.customerservice@hrms.com / TestPassword123!)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
