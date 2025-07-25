import { useState, useEffect, useMemo } from "react";
import { Task, User } from "@/types/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Clock, CheckCircle, AlertCircle, MoreVertical, Trash2, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const API_URL = 'https://manzi897098.pythonanywhere.com/api';

const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select an employee"),
  deadline: z.date({ required_error: "Please select a deadline" }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskBoardProps {
  tasks: Task[];
  teamMembers: User[];
  canEdit?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onUpdateProgress?: (task: Task) => void;
}

export function TaskBoard({ tasks, teamMembers, canEdit = false, onEdit, onDelete, onUpdateProgress }: TaskBoardProps) {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
  }>({
    todo: [],
    inProgress: [],
    completed: []
  });

  // Filter team members based on department access
  const filteredTeamMembers = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'Admin') {
      // Admins can see all team members
      return teamMembers;
    } else if (currentUser.role === 'TeamLeader') {
      // Team leaders can only see members in their department
      return teamMembers.filter(member => member.department === currentUser.department);
    }
    return [];
  }, [teamMembers, currentUser]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    // Filter tasks by status
    setFilteredTasks({
      todo: tasks.filter(task => task.status === "Todo"),
      inProgress: tasks.filter(task => task.status === "In Progress"),
      completed: tasks.filter(task => task.status === "Completed")
    });
  }, [tasks]);
  
  const handleCreateTask = async (data: TaskFormValues) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          assignedTo: data.assignedTo,
          deadline: data.deadline.toISOString(),
          status: "Todo",
          progress: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      const newTask = await response.json();
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
      
      if (onEdit) {
        onEdit(newTask);
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      const updatedTask = await response.json();
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
      
      if (onEdit) {
        onEdit(updatedTask);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      // Use onDelete callback instead of reloading
      if (onDelete) {
        onDelete(taskId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== "Completed";

    return (
      <Card className="mb-4">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{task.title}</CardTitle>
              <CardDescription className="text-xs">
                Assigned to: {task.assigned_to_name} ({task.assigned_to_department})
              </CardDescription>
              <CardDescription className="text-xs">
                Assigned by: {task.assigned_by_name}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onUpdateProgress && (
                  <DropdownMenuItem onClick={() => onUpdateProgress(task)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Update Progress
                  </DropdownMenuItem>
                )}
                {canEdit && onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(task.id.toString())}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {task.description}
          </p>
          {task.documentation && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Documentation</h4>
              <p className="text-sm text-muted-foreground">{task.documentation}</p>
            </div>
          )}
          {task.document_url && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Attached Document</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://manzi897098.pythonanywhere.com${task.document_url}`;
                  window.open(url, '_blank');
                }}
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate">
                  {task.document_url.split('/').pop() || 'Download Document'}
                </span>
                <Download className="ml-auto h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Deadline:</span>
              <span className={cn(
                "font-medium",
                isOverdue && "text-destructive"
              )}>
                {format(new Date(task.deadline), "MMM d, yyyy")}
                {isOverdue && <AlertCircle className="ml-1 inline h-3 w-3" />}
              </span>
            </div>
            {task.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {canEdit && filteredTeamMembers.length > 0 && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button
          className="mt-4 sm:mt-0 ml-2"
          variant="outline"
          onClick={async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('https://manzi897098.pythonanywhere.com/api/team-leader/export-tasks-pdf', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'tasks.pdf';
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } else {
              alert('Failed to download PDF');
            }
          }}
        >
          Print Tasks PDF
        </Button>
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
                          {filteredTeamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name} ({member.department})
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="font-semibold">To Do</h3>
            <span className="text-sm text-muted-foreground">
              {filteredTasks.todo.length} tasks
              </span>
            </div>
          <div className="space-y-4">
            {filteredTasks.todo.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
              </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="font-semibold">In Progress</h3>
            <span className="text-sm text-muted-foreground">
              {filteredTasks.inProgress.length} tasks
              </span>
            </div>
          <div className="space-y-4">
            {filteredTasks.inProgress.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
              </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="font-semibold">Completed</h3>
            <span className="text-sm text-muted-foreground">
              {filteredTasks.completed.length} tasks
              </span>
            </div>
          <div className="space-y-4">
            {filteredTasks.completed.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
              </div>
              </div>
            </div>
          </div>
  );
}
