
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeesPage from "./pages/admin/EmployeesPage";
import NotificationsPage from "./pages/admin/NotificationsPage"; // New
import EmailPage from "./pages/admin/EmailPage"; // New
import SettingsPage from "./pages/admin/SettingsPage"; // New

// Team Leader pages
import TeamLeaderDashboard from "./pages/team-leader/TeamLeaderDashboard";
import TeamLeaderTasksPage from "./pages/team-leader/TasksPage";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTasksPage from "./pages/employee/TasksPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<MainLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="email" element={<EmailPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Team Leader Routes */}
              <Route path="/team-leader" element={<MainLayout />}>
                <Route index element={<TeamLeaderDashboard />} />
                <Route path="tasks" element={<TeamLeaderTasksPage />} />
                {/* Add other team leader routes as needed */}
              </Route>
              
              {/* Employee Routes */}
              <Route path="/employee" element={<MainLayout />}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="tasks" element={<EmployeeTasksPage />} />
                {/* Add other employee routes as needed */}
              </Route>
              
              <Route path="/" element={<LoginPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
