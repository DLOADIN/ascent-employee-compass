import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Users, 
  FileText, 
  BookOpen, 
  Bell, 
  Settings,
  LogOut,
  Mail,
  BarChart,
  Briefcase,
  CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { currentUser, logout } = useAppContext();

  if (!currentUser) return null;

  const adminLinks = [
    { icon: Home, label: "Dashboard", to: "/admin" },
    { icon: Users, label: "Employees", to: "/admin/employees" },
    { icon: Users, label: "Team Leaders", to: "/admin/team-leaders" },
    { icon: BarChart, label: "Progress", to: "/admin/progress" },
    { icon: Briefcase, label: "Job Applications", to: "/admin/job-applications" },
    { icon: CalendarCheck, label: "Leave Requests", to: "/admin/leave-requests" },
    { icon: Bell, label: "Notifications", to: "/admin/notifications" },
    { icon: Mail, label: "Email", to: "/admin/email" }, 
    { icon: Settings, label: "Settings", to: "/admin/settings" }
  ];

  const teamLeaderLinks = [
    { icon: Home, label: "Dashboard", to: "/team-leader" },
    { icon: FileText, label: "Tasks", to: "/team-leader/tasks" },
    { icon: Users, label: "Employees", to: "/team-leader/employees" },
    // { icon: Mail, label: "Email", to: "/team-leader/email" },
    { icon: Settings, label: "Settings", to: "/team-leader/settings" },
    { icon: BookOpen, label: "Course Quizzes", to: "/team-leader/courses" }
  ];

  const employeeLinks = [
    { icon: Home, label: "Dashboard", to: "/employee" },
    { icon: FileText, label: "Tasks", to: "/employee/tasks" },
    { icon: BookOpen, label: "Courses", to: "/employee/courses" },
    { icon: Briefcase, label: "Apply for Job", to: "/employee/job-apply" },
    { icon: CalendarCheck, label: "Request Leave", to: "/employee/leave-request" },
    // { icon: Mail, label: "Email", to: "/employee/email" },
    { icon: Settings, label: "Settings", to: "/employee/settings" },
    { icon: FileText, label: "My Quizzes", to: "/employee/quizzes" }
  ];

  let links;
  switch (currentUser.role) {
    case "Admin":
      links = adminLinks;
      break;
    case "TeamLeader":
      links = teamLeaderLinks;
      break;
    case "Employee":
      links = employeeLinks;
      break;
    default:
      links = [];
  }

  return (
    <aside
      className={cn(
        "h-full bg-background border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-start")}>
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            HR
          </div>
          {!collapsed && <span className="ml-2 text-xl font-semibold">HR Compass</span>}
        </div>
        
        <Separator />
        
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center"
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                {!collapsed && <span className="ml-3">{link.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center text-muted-foreground hover:text-foreground",
              collapsed ? "justify-center px-2" : "justify-start px-3"
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
