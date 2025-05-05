
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sample course progress data for employees in a department
const employeeCourseData = [
  { id: 1, name: "John Smith", coursesCompleted: 8, totalCourses: 10, progress: 80, department: "IT", lastActive: "2 days ago" },
  { id: 2, name: "Emily Johnson", coursesCompleted: 5, totalCourses: 10, progress: 50, department: "IT", lastActive: "1 day ago" },
  { id: 3, name: "Michael Brown", coursesCompleted: 10, totalCourses: 10, progress: 100, department: "IT", lastActive: "4 hours ago" },
  { id: 4, name: "Sarah Davis", coursesCompleted: 3, totalCourses: 10, progress: 30, department: "IT", lastActive: "1 week ago" },
  { id: 5, name: "David Miller", coursesCompleted: 6, totalCourses: 10, progress: 60, department: "IT", lastActive: "3 days ago" },
  { id: 6, name: "Jessica Wilson", coursesCompleted: 7, totalCourses: 10, progress: 70, department: "IT", lastActive: "12 hours ago" },
];

// Data for pie chart
const departmentProgressData = [
  { name: "Completed", value: 39 },
  { name: "In Progress", value: 28 },
  { name: "Not Started", value: 13 },
];

const COLORS = ["#10b981", "#3b82f6", "#ef4444"];

const CoursesPage = () => {
  const { currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter employees based on search
  const filteredEmployees = employeeCourseData.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate department completion statistics
  const totalCourses = employeeCourseData.reduce((acc, curr) => acc + curr.totalCourses, 0);
  const completedCourses = employeeCourseData.reduce((acc, curr) => acc + curr.coursesCompleted, 0);
  const completionRate = Math.round((completedCourses / totalCourses) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Department Courses</h2>
        <p className="text-muted-foreground">
          Track course progress for all employees in your department.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Progress</CardTitle>
            <CardDescription>
              Overall course completion rate for the {currentUser?.department} department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentProgressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} courses`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="font-medium">Total completion rate</p>
              <div className="flex items-center space-x-4">
                <Progress value={completionRate} className="h-2" />
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {completedCourses} completed out of {totalCourses} total courses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>
              Course statistics for the {currentUser?.department} department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="text-muted-foreground text-sm">Total Employees</div>
                <div className="text-2xl font-bold">{employeeCourseData.length}</div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="text-muted-foreground text-sm">Avg. Completion</div>
                <div className="text-2xl font-bold">{completionRate}%</div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="text-muted-foreground text-sm">Top Performer</div>
                <div className="text-base font-medium">Michael Brown</div>
                <div className="text-xs text-muted-foreground">100% complete</div>
              </div>
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="text-muted-foreground text-sm">Needs Attention</div>
                <div className="text-base font-medium">Sarah Davis</div>
                <div className="text-xs text-muted-foreground">30% complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Employee Course Progress</CardTitle>
              <CardDescription>
                Detailed view of individual employee progress on assigned courses.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="hidden md:table-cell">Completed</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Active</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No employees found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={employee.progress} className="h-2 w-full max-w-32" />
                          <span className="text-xs tabular-nums">{employee.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {employee.coursesCompleted} of {employee.totalCourses}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {employee.lastActive}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          employee.progress === 100 ? "default" :
                          employee.progress >= 50 ? "outline" : "destructive"
                        }>
                          {employee.progress === 100 ? "Completed" :
                           employee.progress >= 50 ? "In Progress" : "Attention Needed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employeeCourseData.length} employees
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesPage;
