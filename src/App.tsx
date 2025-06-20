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
import TeamLeadersPage from "./pages/admin/TeamLeadersPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import EmailPage from "./pages/admin/EmailPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProgressPage from "./pages/admin/ProgressPage";

// Team Leader pages
import TeamLeaderDashboard from "./pages/team-leader/TeamLeaderDashboard";
import TeamLeaderTasksPage from "./pages/team-leader/TasksPage";
import TeamLeaderEmployeePage from "./pages/team-leader/Employees";
import TeamLeaderSettingsPage from "./pages/team-leader/SettingsPage";

// Employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTasksPage from "./pages/employee/TasksPage";
import EmployeeCoursesPage from "./pages/employee/CoursesPage";
import EmployeeSettingsPage from "./pages/employee/SettingsPage";

// New routes for email pages
import TeamLeaderEmailPage from "./pages/team-leader/EmailPage";

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
                <Route path="team-leaders" element={<TeamLeadersPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="email" element={<EmailPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Team Leader Routes */}
              <Route path="/team-leader" element={<MainLayout />}>
                <Route index element={<TeamLeaderDashboard />} />
                <Route path="tasks" element={<TeamLeaderTasksPage />} />
                <Route path="employees" element={<TeamLeaderEmployeePage />} />
                <Route path="settings" element={<TeamLeaderSettingsPage />} />
                <Route path="email" element={<TeamLeaderEmailPage />} />
              </Route>
              
              {/* Employee Routes */}
              <Route path="/employee" element={<MainLayout />}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="tasks" element={<EmployeeTasksPage />} />
                <Route path="courses" element={<EmployeeCoursesPage />} />
                <Route path="settings" element={<EmployeeSettingsPage />} />
                <Route path="email" element={<EmailPage />} />
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
