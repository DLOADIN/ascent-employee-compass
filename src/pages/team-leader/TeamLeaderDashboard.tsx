
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FileText, BookOpen, Send, Award } from "lucide-react";

export default function TeamLeaderDashboard() {
  const { currentUser, users, tasks, courses } = useAppContext();

  if (!currentUser || !currentUser.department) return null;

  const teamMembers = users.filter(
    user => user.department === currentUser.department && user.role === "Employee"
  );

  const departmentTasks = tasks.filter(
    task => {
      const assignedUser = users.find(user => user.id === task.assignedTo);
      return assignedUser?.department === currentUser.department;
    }
  );

  const completedTasks = departmentTasks.filter(task => task.status === "Completed").length;
  const inProgressTasks = departmentTasks.filter(task => task.status === "In Progress").length;
  const todoTasks = departmentTasks.filter(task => task.status === "Todo").length;

  const departmentCourses = courses.filter(
    course => course.department === currentUser.department
  );

  const taskPerformance = teamMembers.map(member => {
    const memberTasks = departmentTasks.filter(task => task.assignedTo === member.id);
    const completedCount = memberTasks.filter(task => task.status === "Completed").length;
    const percentage = memberTasks.length > 0 
      ? Math.round((completedCount / memberTasks.length) * 100) 
      : 0;
    
    return {
      name: member.name,
      completedTasks: completedCount,
      totalTasks: memberTasks.length,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const courseEnrollments = teamMembers.map(member => {
    const enrolledCourses = departmentCourses.filter(
      course => course.enrolledUsers.includes(member.id)
    ).length;
    
    return {
      name: member.name,
      enrolledCourses,
      totalCourses: departmentCourses.length,
      percentage: departmentCourses.length > 0 
        ? Math.round((enrolledCourses / departmentCourses.length) * 100)
        : 0
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const taskData = [
    { name: "Completed", value: completedTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Todo", value: todoTasks },
  ];

  const bestPerformer = taskPerformance.length > 0 ? taskPerformance[0] : null;
  const worstPerformer = taskPerformance.length > 0 ? taskPerformance[taskPerformance.length - 1] : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Leader Dashboard</h1>
      <p className="text-muted-foreground">
        {currentUser.department} Department - Overview and Performance
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              In {currentUser.department} Department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} completed ({Math.round((completedTasks / (departmentTasks.length || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Available for {currentUser.department}
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
                data={taskPerformance.map(data => ({
                  name: data.name,
                  completed: data.completedTasks,
                  total: data.totalTasks
                }))}
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
                    <th className="text-right p-2">Overall Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => {
                    const taskStats = taskPerformance.find(t => t.name === member.name) || {
                      completedTasks: 0,
                      totalTasks: 0,
                      percentage: 0
                    };
                    
                    const courseStats = courseEnrollments.find(c => c.name === member.name) || {
                      enrolledCourses: 0,
                      totalCourses: 0,
                      percentage: 0
                    };
                    
                    const overallRating = (taskStats.percentage + courseStats.percentage) / 2;
                    
                    return (
                      <tr key={member.id} className="border-b last:border-b-0">
                        <td className="p-2">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </td>
                        <td className="text-center p-2">
                          <div className="font-medium">
                            {taskStats.completedTasks}/{taskStats.totalTasks}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {taskStats.percentage}%
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div className="font-medium">
                            {courseStats.enrolledCourses}/{courseStats.totalCourses}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {courseStats.percentage}%
                          </div>
                        </td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end">
                            <span 
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                overallRating >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                overallRating >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}
                            >
                              {Math.round(overallRating)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
            {bestPerformer ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{bestPerformer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{bestPerformer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {bestPerformer.completedTasks} of {bestPerformer.totalTasks} tasks completed
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${bestPerformer.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-right">{bestPerformer.percentage}% completion rate</div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Needed Improvement</CardTitle>
            <CardDescription>Lowest task completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            {worstPerformer && worstPerformer.totalTasks > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="font-bold text-destructive">{worstPerformer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{worstPerformer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {worstPerformer.completedTasks} of {worstPerformer.totalTasks} tasks completed
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-destructive h-2.5 rounded-full" 
                    style={{ width: `${worstPerformer.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-right">{worstPerformer.percentage}% completion rate</div>
                <Button size="sm" className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Course Recommendations
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
