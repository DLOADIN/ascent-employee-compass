
import { useState } from "react";
import { Task } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PlusIcon, FileText, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select an employee"),
  deadline: z.date({ required_error: "Please select a deadline" }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TeamLeaderTasksPage() {
  const { currentUser, users, tasks, addTask, updateTask, deleteTask } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!currentUser || !currentUser.department) return null;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
    },
  });

  // Get all team members (employees) in the current user's department
  const teamMembers = users.filter(
    user => user.department === currentUser.department && user.role === "Employee"
  );

  // Get all tasks assigned by the team leader to their team members
  const teamTasks = tasks.filter(
    task => {
      const assignedUser = users.find(user => user.id === task.assignedTo);
      return (
        task.assignedBy === currentUser.id && 
        assignedUser?.department === currentUser.department
      );
    }
  );

  const completedTasks = teamTasks.filter(task => task.status === "Completed").length;
  const inProgressTasks = teamTasks.filter(task => task.status === "In Progress").length;
  const todoTasks = teamTasks.filter(task => task.status === "Todo").length;

  const handleCreateTask = (data: TaskFormValues) => {
    addTask({
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      assignedBy: currentUser.id,
      status: "Todo",
      deadline: data.deadline,
    });
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEditTask = (updatedTask: Task) => {
    updateTask(updatedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assign tasks to your team members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Assign a new task to a team member.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task details" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
            <CardDescription>Current team task statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/40">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg font-bold mt-2">{todoTasks}</span>
                  <span className="text-xs text-muted-foreground mt-1">To Do</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/40">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-lg font-bold mt-2">{inProgressTasks}</span>
                  <span className="text-xs text-muted-foreground mt-1">In Progress</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/40">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-lg font-bold mt-2">{completedTasks}</span>
                  <span className="text-xs text-muted-foreground mt-1">Completed</span>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Team Members</h3>
                  <div className="mt-2 space-y-2">
                    {teamMembers.map(member => {
                      const memberTasks = tasks.filter(task => task.assignedTo === member.id);
                      const completedCount = memberTasks.filter(task => task.status === "Completed").length;
                      const progressPercentage = memberTasks.length > 0 
                        ? Math.round((completedCount / memberTasks.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm">{member.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {completedCount}/{memberTasks.length} tasks
                            </span>
                            <span className="text-xs font-medium">{progressPercentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskBoard
        tasks={teamTasks}
        canEdit={true}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
