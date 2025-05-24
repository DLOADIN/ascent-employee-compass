import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Progress } from "@/components/ui/progress";
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FileText, BookOpen, BriefcaseBusiness, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const API_URL = 'http://localhost:5000/api';

interface DashboardData {
  department: string;
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    todo: number;
    overall_progress: number;
    upcoming: Array<{
      id: string;
      title: string;
      description: string;
      deadline: string;
      status: string;
      progress: number;
      assigned_by_name: string;
    }>;
  };
  courses: {
    total: number;
    enrolled: number;
    completed: number;
    list: Array<{
      id: string;
      title: string;
      description: string;
      user_progress: number;
      is_completed: boolean;
    }>;
  };
  department_stats: {
    total_tasks: number;
    completed_tasks: number;
    total_courses: number;
    enrolled_courses: number;
    progress: {
      tasks: number;
      courses: number;
    };
  };
}

export default function EmployeeDashboard() {
  const { currentUser } = useAppContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/employee/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (!currentUser || !currentUser.department || isLoading || !dashboardData) return null;

  const taskStatusData = [
    { name: "Completed", value: dashboardData.tasks.completed },
    { name: "In Progress", value: dashboardData.tasks.in_progress },
    { name: "Todo", value: dashboardData.tasks.todo },
  ];

  const departmentProgressData = [
    { name: "Tasks", value: dashboardData.department_stats.progress.tasks },
    { name: "Courses", value: dashboardData.department_stats.progress.courses },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {currentUser.name}! Here's your progress and tasks overview for the {dashboardData.department} department.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.tasks.total}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {dashboardData.tasks.completed} completed
              </span>
              <span className="text-xs font-medium">
                {dashboardData.tasks.overall_progress}%
              </span>
            </div>
            <Progress value={dashboardData.tasks.overall_progress} className="mt-1 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.courses.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.courses.enrolled} enrolled, {dashboardData.courses.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.department_stats.progress.tasks}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.department_stats.completed_tasks} of {dashboardData.department_stats.total_tasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.department}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of your current tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                />
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Overall department performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <BarChart
                width={400}
                height={300}
                data={departmentProgressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Progress" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.tasks.upcoming.map(task => {
                const daysRemaining = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysRemaining < 0;
                
                return (
                  <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs">
                            Assigned by: {task.assigned_by_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          isOverdue 
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" 
                            : daysRemaining <= 3
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        }`}
                      >
                        {isOverdue ? "Overdue" : `${daysRemaining} days left`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {dashboardData.tasks.upcoming.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                  <p className="mt-4 text-muted-foreground">
                    All caught up! You have no pending tasks.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
