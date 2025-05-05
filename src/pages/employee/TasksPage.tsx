
import { useState } from "react";
import { Task } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TasksPage() {
  const { currentUser, users, tasks, updateTask } = useAppContext();

  if (!currentUser) return null;

  const userTasks = tasks.filter(task => task.assignedTo === currentUser.id);
  const completedTasks = userTasks.filter(task => task.status === "Completed").length;
  const inProgressTasks = userTasks.filter(task => task.status === "In Progress").length;
  const todoTasks = userTasks.filter(task => task.status === "Todo").length;

  // Calculate overall progress
  const taskProgress = userTasks.length > 0
    ? Math.round((completedTasks / userTasks.length) * 100)
    : 0;

  const handleEditTask = (updatedTask: Task) => {
    updateTask(updatedTask);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your assigned tasks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
            <CardDescription>Your current task statistics</CardDescription>
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

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Tasks to be started</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs">Tasks in progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Completed tasks</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              <p>Drag and drop tasks to update their status.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskBoard
        tasks={userTasks}
        canEdit={true}
        onEdit={handleEditTask}
      />
    </div>
  );
}
