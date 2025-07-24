import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FileText, BookOpen, Send, Award } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_URL = 'http://localhost:5000/api';

interface DashboardData {
  department: string;
  teamMembers: {
    total: number;
    list: any[];
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    list: any[];
  };
  courses: {
    total_demonstrations: number;
  };
  performance: {
    metrics: any[];
    bestPerformer: any;
    worstPerformer: any;
    notStartedMembers: any[];
  };
}

export default function TeamLeaderDashboard() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/team-leader/dashboard`, {
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
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, toast]);

  if (!currentUser || !dashboardData) return null;

  const taskData = [
    { name: "Completed", value: dashboardData.tasks.completed },
    { name: "In Progress", value: dashboardData.tasks.inProgress },
    { name: "Todo", value: dashboardData.tasks.todo },
  ];

  console.log('Total demonstrations:', dashboardData.courses.total_demonstrations);

  const totalDemonstrations = dashboardData.courses.total_demonstrations || 0;
  
  console.log('Total demonstrations:', totalDemonstrations);

  const performanceData = dashboardData.performance.metrics.map(metric => ({
    name: metric.name,
    completed: metric.taskStats.completed,
    total: metric.taskStats.total
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Leader Dashboard</h1>
      <p className="text-muted-foreground">
        {dashboardData.department} Department - Overview and Performance
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.teamMembers.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              In {dashboardData.department} Department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.tasks.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.tasks.completed} completed ({Math.round((dashboardData.tasks.completed / (dashboardData.tasks.total || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDemonstrations}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Available for {dashboardData.department}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDemonstrations} total demonstrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-rows space-x-2">
            <Button variant="outline" size="sm" className="flex-1 p-2">
              <Send className="mr-2 h-4 w-4" />
              Email Admin
            </Button>
            <Button variant="outline" size="sm" className="flex-1 p-2">
              <BookOpen className="mr-2 h-4 w-4" />
              Recommend
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of tasks in the department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <PieChart width={300} height={300} data={taskData}>
                <Pie
                  data={taskData}
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
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Task completion by team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <BarChart
                width={400}
                height={300}
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#8884d8" />
                <Bar dataKey="total" name="Total" fill="#82ca9d" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
            <CardDescription>Task completion and course enrollment statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Team Member</th>
                    <th className="text-center p-2">Task Completion</th>
                    <th className="text-center p-2">Course Enrollment</th>
                    {/* <th className="text-right p-2">Overall Rating</th> */}
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.performance.metrics.map(metric => (
                    <tr key={metric.id} className="border-b last:border-b-0">
                        <td className="p-2">
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">{metric.email}</div>
                        </td>
                        <td className="text-center p-2">
                          <div className="font-medium">
                          {metric.taskStats.completed}/{metric.taskStats.total}
                          </div>
                          <div className="text-sm text-muted-foreground">
                          {metric.taskStats.completionRate}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div className="font-medium">
                          {metric.courseStats.enrolled}
                          </div>
                          {/* <div className="text-sm text-muted-foreground">
                          {metric.courseStats.enrollmentRate}%
                          </div> */}
                        </td>
                        {/* <td className="text-right p-2">
                          <div className="flex items-center justify-end">
                            <span 
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              metric.overallRating >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                              metric.overallRating >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}
                            >
                            {metric.overallRating}%
                            </span>
                          </div>
                        </td> */}
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Best Performer</CardTitle>
                <CardDescription>Highest task completion rate</CardDescription>
              </div>
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.performance.bestPerformer ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{dashboardData.performance.bestPerformer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{dashboardData.performance.bestPerformer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.performance.bestPerformer.taskStats.completed} of {dashboardData.performance.bestPerformer.taskStats.total} tasks completed
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${dashboardData.performance.bestPerformer.taskStats.completionRate}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-right">{dashboardData.performance.bestPerformer.taskStats.completionRate}% completion rate</div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Needed Improvement</CardTitle>
            <CardDescription>No tasks started</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.performance.notStartedMembers && dashboardData.performance.notStartedMembers.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.performance.notStartedMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <span className="font-bold text-destructive">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Course Demonstrations: {member.courseStats.demonstrations} | Unique Courses: {member.courseStats.enrolled}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No team members without tasks</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
