
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";

interface TaskBoardProps {
  tasks: Task[];
  canEdit: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskBoard({ tasks, canEdit, onEdit, onDelete }: TaskBoardProps) {
  const { users } = useAppContext();
  
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTodoTasks(tasks.filter(task => task.status === "Todo"));
    setInProgressTasks(tasks.filter(task => task.status === "In Progress"));
    setCompletedTasks(tasks.filter(task => task.status === "Completed"));
  }, [tasks]);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, status: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceStatus", status);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: "Todo" | "In Progress" | "Completed") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    
    if (sourceStatus === targetStatus) return;

    // Find the task in the source list
    let task: Task | undefined;
    if (sourceStatus === "Todo") {
      task = todoTasks.find(t => t.id === taskId);
      if (task) setTodoTasks(todoTasks.filter(t => t.id !== taskId));
    } else if (sourceStatus === "In Progress") {
      task = inProgressTasks.find(t => t.id === taskId);
      if (task) setInProgressTasks(inProgressTasks.filter(t => t.id !== taskId));
    } else if (sourceStatus === "Completed") {
      task = completedTasks.find(t => t.id === taskId);
      if (task) setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
    }

    // Add the task to the target list
    if (task) {
      const updatedTask = { ...task, status: targetStatus };
      if (targetStatus === "Todo") {
        setTodoTasks([...todoTasks, updatedTask]);
      } else if (targetStatus === "In Progress") {
        setInProgressTasks([...inProgressTasks, updatedTask]);
      } else if (targetStatus === "Completed") {
        setCompletedTasks([...completedTasks, updatedTask]);
      }
      
      // Notify parent if edit handler is provided
      if (onEdit) {
        onEdit(updatedTask);
      }
    }
  };

  const getAssignedUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown";
  };

  const getDeadlineStatus = (deadline: Date) => {
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { label: "Overdue", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" };
    } else if (daysLeft <= 2) {
      return { label: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" };
    } else {
      return { label: `${daysLeft} days left`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" };
    }
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const deadline = getDeadlineStatus(task.deadline);

    return (
      <div
        draggable={canEdit}
        onDragStart={(e) => handleDragStart(e, task.id, task.status)}
        className="p-3 mb-3 bg-card border rounded-md shadow-sm cursor-move"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{task.title}</h3>
          {canEdit && (
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit(task);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(task.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Due: {format(task.deadline, "MMM d, yyyy")}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs">
            Assigned to: {getAssignedUserName(task.assignedTo)}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${deadline.className}`}>
            {deadline.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>To Do</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200 text-xs font-medium">
              {todoTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-3 mt-2 h-[600px] overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Todo")}
        >
          {todoTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
          {todoTasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-md border-muted text-muted-foreground">
              No tasks
            </div>
          )}
          {canEdit && (
            <Button variant="outline" className="w-full mt-2" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>In Progress</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 text-xs font-medium">
              {inProgressTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-3 mt-2 h-[600px] overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "In Progress")}
        >
          {inProgressTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
          {inProgressTasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-md border-muted text-muted-foreground">
              No tasks in progress
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 bg-green-50 dark:bg-green-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>Completed</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200 text-xs font-medium">
              {completedTasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent 
          className="p-3 mt-2 h-[600px] overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "Completed")}
        >
          {completedTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
          {completedTasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-md border-muted text-muted-foreground">
              No completed tasks
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
