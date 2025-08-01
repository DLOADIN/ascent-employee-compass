import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { User, Users, FileText, BookOpen } from "lucide-react";
import axios from "axios";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalCourses: number;
  activeSessions: number;
  departmentStats: { name: string; value: number }[];
  taskStats: { name: string; value: number }[];
  roleStats: { name: string; value: number }[];
  recentSessions?: { id: string; userName: string; loginTime: string; isActive: boolean }[];
  totalCourseEnrollments: number;
}

// Add custom colors for the charts
const COLORS = {
  taskStatus: {
    Completed: "#22c55e", // green-500
    "In Progress": "#eab308", // yellow-500
    Todo: "#3b82f6", // blue-500
  },
  userRoles: {
    Admins: "#ef4444", // red-500
    "Team Leaders": "#8b5cf6", // purple-500
    Employees: "#0ea5e9", // sky-500
  }
};

// Custom tooltip component for pie charts
const CustomTooltip = ({ active, payload, type }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = type === 'task' ? COLORS.taskStatus[data.name] : COLORS.userRoles[data.name];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
        <p className="font-medium" style={{ color }}>{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} {type === 'task' ? 'tasks' : 'users'} ({((data.value / payload[0].payload.total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAppContext();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get<DashboardStats>('https://manzi897098.pythonanywhere.com/api/admin/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Overview of the Employee Capability Management System</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Users currently logged in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.completedTasks} completed tasks
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Course Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalCourseEnrollments}</div>
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All course demonstrations submitted by employees
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={stats.roleStats.map(item => ({
                    ...item,
                    total: stats.totalUsers
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.roleStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.userRoles[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip type="role" />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </div>
          </CardContent>
        </Card> */}

<Card>
          <CardHeader>
            <CardTitle>Recent Login Sessions</CardTitle>
            <CardDescription>Latest user activities</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {stats.recentSessions?.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                    <p className="font-medium">{session.userName}</p>
                        <p className="text-sm text-muted-foreground">
                      {new Date(session.loginTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            session.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {session.isActive ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users by Department</CardTitle>
            <CardDescription>Distribution of users across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <BarChart
                width={400}
                height={300}
                data={stats.departmentStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Overview of tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <PieChart width={550} height={250}>
                <Pie
                  data={stats.taskStats.map(item => ({
                    ...item,
                    total: stats.totalTasks
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {stats.taskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.taskStatus[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip type="task" />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
