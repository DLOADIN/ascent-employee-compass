import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { User, Department, Task, Course } from "@/types";
import { Briefcase, DollarSign, Users, Monitor } from "lucide-react";

const departments: { key: Department; label: string; icon: any }[] = [
  { key: "Finance", label: "Finance", icon: DollarSign },
  { key: "Sales", label: "Sales", icon: Briefcase },
  { key: "Customer-Service", label: "Customer Service", icon: Users },
  { key: "IT", label: "IT", icon: Monitor },
];

export default function ProgressPage() {
  const { users, tasks, courses } = useAppContext();
  const [openDept, setOpenDept] = useState<Department | null>(null);

  const getEmployeesByDept = (dept: Department) =>
    users.filter((u) => u.role === "Employee" && u.department === dept);

  const getTasksForUser = (userId: string) =>
    tasks.filter((t) => t.assignedTo === userId || (Array.isArray(t.assignedTo) && t.assignedTo.includes(userId)));

  const getCoursesForUser = (userId: string) =>
    courses.filter((c) => c.enrolledUsers && c.enrolledUsers.includes(userId));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Progress Reports</h1>
      <p className="text-muted-foreground">View detailed employee performance by department</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((dept) => (
          <Dialog key={dept.key} open={openDept === dept.key} onOpenChange={(open) => setOpenDept(open ? dept.key : null)}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <dept.icon className="h-6 w-6 text-primary" />
                    {dept.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground text-sm">
                    View all employees, tasks, and courses in {dept.label}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{dept.label} Department</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {getEmployeesByDept(dept.key).length === 0 ? (
                  <div className="text-muted-foreground">No employees in this department.</div>
                ) : (
                  getEmployeesByDept(dept.key).map((emp) => (
                    <div key={emp.id} className="border rounded p-3">
                      <div className="font-semibold">{emp.name} <span className="text-xs text-muted-foreground">({emp.email})</span></div>
                      <div className="text-xs text-muted-foreground mb-1">Skill: {emp.skillLevel || "-"} | Experience: {emp.experience || 0} yrs</div>
                      <div className="mt-1">
                        <div className="font-medium">Tasks:</div>
                        <ul className="list-disc ml-5 text-sm">
                          {getTasksForUser(emp.id).length === 0 ? (
                            <li className="text-muted-foreground">No tasks</li>
                          ) : (
                            getTasksForUser(emp.id).map((task) => (
                              <li key={task.id}>
                                {task.title} <span className="text-xs">[{task.status}]</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                      <div className="mt-1">
                        <div className="font-medium">Courses:</div>
                        <ul className="list-disc ml-5 text-sm">
                          {getCoursesForUser(emp.id).length === 0 ? (
                            <li className="text-muted-foreground">No courses</li>
                          ) : (
                            getCoursesForUser(emp.id).map((course) => (
                              <li key={course.id}>
                                {course.title} <span className="text-xs">[{course.status || "-"}]</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
} 