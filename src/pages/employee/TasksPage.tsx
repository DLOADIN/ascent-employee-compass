import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

const API_URL = 'http://localhost:5000/api';

export default function TasksPage() {
  const { currentUser, users, tasks, updateTask } = useAppContext();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documentation, setDocumentation] = useState("");
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_URL}/tasks/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        setUserTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchUserTasks();
    }
  }, [currentUser, toast]);

  if (!currentUser) return null;

  const completedTasks = userTasks.filter(task => task.status === "Completed").length;
  const inProgressTasks = userTasks.filter(task => task.status === "In Progress").length;
  const todoTasks = userTasks.filter(task => task.status === "Todo").length;

  const taskProgress = userTasks.length > 0
    ? Math.round((completedTasks / userTasks.length) * 100)
    : 0;

  const handleUpdateProgress = async () => {
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/tasks/${selectedTask.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progress,
          documentation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task progress');
      }

      const updatedTask = await response.json();
      setUserTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      
      toast({
        title: "Success",
        description: "Task progress updated successfully",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating task progress:', error);
      toast({
        title: "Error",
        description: "Failed to update task progress",
        variant: "destructive"
      });
    }
  };

  const openProgressDialog = (task: Task) => {
    setSelectedTask(task);
    setProgress(task.progress || 0);
    setDocumentation(task.documentation || "");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            View and update your assigned tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Your current task status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-lg font-bold">{todoTasks}</span>
                <span className="text-xs text-muted-foreground mt-1">To Do</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-lg font-bold">{inProgressTasks}</span>
                <span className="text-xs text-muted-foreground mt-1">In Progress</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-lg font-bold">{completedTasks}</span>
                <span className="text-xs text-muted-foreground mt-1">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskBoard
        tasks={userTasks}
        canEdit={true}
        onEdit={updateTask}
        teamMembers={users}
        onUpdateProgress={openProgressDialog}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Task Progress</DialogTitle>
            <DialogDescription>
              Update the progress and documentation for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Progress: {progress}%</label>
              <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                {progress < 50 ? "To Do" : progress < 90 ? "In Progress" : "Completed"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Documentation</label>
              <Textarea
                value={documentation}
                onChange={(e) => setDocumentation(e.target.value)}
                placeholder="Add documentation about the task progress..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateProgress}>Update Progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
