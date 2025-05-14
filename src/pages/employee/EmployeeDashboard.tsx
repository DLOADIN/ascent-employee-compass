
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { Progress } from "@/components/ui/progress";
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FileText, BookOpen, BriefcaseBusiness, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

export default function EmployeeDashboard() {
  const { currentUser, users, tasks, courses, jobOpportunities } = useAppContext();
  const [selectedTime, setSelectedTime] = useState<"week" | "month" | "year">("week");

  if (!currentUser || !currentUser.department) return null;

  // Get tasks assigned to current user
  const userTasks = tasks.filter(task => task.assignedTo === currentUser.id);
  const completedTasks = userTasks.filter(task => task.status === "Completed");
  const inProgressTasks = userTasks.filter(task => task.status === "In Progress");
  const todoTasks = userTasks.filter(task => task.status === "Todo");

  // Filter courses by user's department
  const departmentCourses = courses.filter(
    course => course.department === currentUser.department
  );

  // Get courses the user is enrolled in
  const enrolledCourses = departmentCourses.filter(
    course => course.enrolledUsers.includes(currentUser.id)
  );

  // Calculate progress
  const taskCompletionRate = userTasks.length > 0 
    ? Math.round((completedTasks.length / userTasks.length) * 100) 
    : 0;
  
  const courseEnrollmentRate = departmentCourses.length > 0
    ? Math.round((enrolledCourses.length / departmentCourses.length) * 100)
    : 0;

  // Get job opportunities for user's department
  const relevantJobs = jobOpportunities.filter(
    job => job.department === currentUser.department
  );

  const taskStatusData = [
    { name: "Completed", value: completedTasks.length },
    { name: "In Progress", value: inProgressTasks.length },
    { name: "Todo", value: todoTasks.length },
  ];

  // Weekly task progress for weekly/monthly/yearly view
  const progressData = {
    week: [
      { name: "Mon", completed: 2, total: 3 },
      { name: "Tue", completed: 1, total: 2 },
      { name: "Wed", completed: 3, total: 3 },
      { name: "Thu", completed: 0, total: 1 },
      { name: "Fri", completed: 1, total: 2 },
      { name: "Sat", completed: 0, total: 0 },
      { name: "Sun", completed: 0, total: 0 },
    ],
    month: [
      { name: "Week 1", completed: 6, total: 8 },
      { name: "Week 2", completed: 4, total: 7 },
      { name: "Week 3", completed: 5, total: 6 },
      { name: "Week 4", completed: 3, total: 5 },
    ],
    year: [
      { name: "Jan", completed: 12, total: 15 },
      { name: "Feb", completed: 10, total: 14 },
      { name: "Mar", completed: 15, total: 18 },
      { name: "Apr", completed: 14, total: 16 },
      { name: "May", completed: 18, total: 20 },
      { name: "Jun", completed: 8, total: 12 },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {currentUser.name}! Here's your progress and tasks overview.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTasks.length}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {completedTasks.length} completed
              </span>
              <span className="text-xs font-medium">
                {taskCompletionRate}%
              </span>
            </div>
            <Progress value={taskCompletionRate} className="mt-1 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.length}/{departmentCourses.length}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                Enrolled in {enrolledCourses.length} courses
              </span>
              <span className="text-xs font-medium">
                {courseEnrollmentRate}%
              </span>
            </div>
            <Progress value={courseEnrollmentRate} className="mt-1 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser.department}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {users.filter(user => user.department === currentUser.department).length - 1} other team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Job Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relevantJobs.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Available in your department
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>
              View your task completion over time
            </CardDescription>
            <div className="flex space-x-2 mt-2">
              <Button 
                variant={selectedTime === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTime("week")}
              >
                Week
              </Button>
              <Button 
                variant={selectedTime === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTime("month")}
              >
                Month
              </Button>
              <Button 
                variant={selectedTime === "year" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedTime("year")}
              >
                Year
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <BarChart
                width={400}
                height={300}
                data={progressData[selectedTime]}
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

        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of your current tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <PieChart width={300} height={300} data={taskStatusData}>
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
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTasks
                .filter(task => task.status !== "Completed")
                .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
                .slice(0, 5)
                .map(task => {
                  const assignedBy = users.find(user => user.id === task.assignedBy);
                  const daysRemaining = Math.ceil((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysRemaining < 0;
                  
                  return (
                    <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-4">
                        {task.status === "In Progress" ? (
                          <Clock className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <FileText className="h-6 w-6 text-blue-500" />
                        )}
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs">
                              Assigned by: {assignedBy?.name || "Unknown"}
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
              {userTasks.filter(task => task.status !== "Completed").length === 0 && (
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

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
            <CardDescription>Courses available for your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentCourses
                .filter(course => !course.enrolledUsers.includes(currentUser.id))
                .slice(0, 3)
                .map(course => (
                  <div key={course.id} className="border rounded-lg overflow-hidden">
                    {course.thumbnail ? (
                      <div className="aspect-video w-full bg-muted">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-muted flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    </div>
                    <div className="p-4 pt-0">
                      <Button variant="outline" className="w-full">
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                ))}
              {departmentCourses.filter(course => !course.enrolledUsers.includes(currentUser.id)).length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                  <p className="mt-4 text-muted-foreground">
                    You're enrolled in all available courses!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">View All Courses</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Opportunities</CardTitle>
            <CardDescription>Open positions in your department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relevantJobs.slice(0, 3).map(job => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {job.department}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-muted-foreground">
                      Deadline: {job.deadline.toLocaleDateString()}
                    </span>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </div>
              ))}
              {relevantJobs.length === 0 && (
                <div className="text-center py-8">
                  <BriefcaseBusiness className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No job opportunities available at the moment.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">View All Jobs</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
