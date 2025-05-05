
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Course } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, BookOpenCheck, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoursesPage() {
  const { currentUser, courses, enrollInCourse } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("available");

  if (!currentUser || !currentUser.department) return null;

  // Filter courses by user's department
  const departmentCourses = courses.filter(
    course => course.department === currentUser.department
  );

  // Get courses the user is enrolled in
  const enrolledCourses = departmentCourses.filter(
    course => course.enrolledUsers.includes(currentUser.id)
  );

  // Available courses (not enrolled yet)
  const availableCourses = departmentCourses.filter(
    course => !course.enrolledUsers.includes(currentUser.id)
  );

  // Mock course progress data
  const getCourseProgress = (courseId: string) => {
    // In a real app, this would come from the database
    const progressMap: Record<string, number> = {
      [courses[0]?.id || "1"]: 75,
      [courses[1]?.id || "2"]: 30,
      [courses[2]?.id || "3"]: 100,
      [courses[3]?.id || "4"]: 10,
    };
    return progressMap[courseId] || 0;
  };

  const handleEnroll = (courseId: string) => {
    enrollInCourse(courseId, currentUser.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Explore and learn with our curated courses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="outline" className="text-sm">
            Department: {currentUser.department}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="available">Available Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-10">
                <BookOpenCheck className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  You've enrolled in all available courses!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map(course => (
                <Card key={course.id} className="flex flex-col">
                  <div className="aspect-video w-full bg-muted">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>
                      Added on {new Date(course.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                      Enroll Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="enrolled" className="mt-6">
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-10">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  You haven't enrolled in any courses yet.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("available")}>
                  Browse Available Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => {
                const progress = getCourseProgress(course.id);
                return (
                  <Card key={course.id} className="flex flex-col">
                    <div className="aspect-video w-full bg-muted relative group cursor-pointer">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              className="rounded-full h-14 w-14"
                              onClick={() => setSelectedCourse(course)}
                            >
                              <Play className="h-6 w-6" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{course.title}</DialogTitle>
                              <DialogDescription>
                                {course.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 aspect-video w-full bg-black">
                              <iframe 
                                src={course.videoUrl} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-full"
                              ></iframe>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription>
                        <div className="flex justify-between items-center mt-1">
                          <span>Progress: {progress}%</span>
                          <Badge variant={
                            progress === 100 ? "success" : 
                            progress > 50 ? "secondary" : "outline"
                          }>
                            {progress === 100 ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2 mt-2" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedCourse(course)}
                      >
                        {progress === 100 ? "Review Course" : "Continue Learning"}
                        {progress < 100 && <Clock className="ml-2 h-4 w-4" />}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
