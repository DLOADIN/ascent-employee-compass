import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { Course } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, BookOpenCheck, Clock, Youtube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { courseTutorials, getTutorialsByDepartment } from "@/data/courseTutorials";

export default function CoursesPage() {
  const { currentUser, courses, enrollInCourse } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const videoRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Track video progress
  const trackVideoProgress = async (courseId: string, position: number, duration: number) => {
    try {
      const progress = Math.round((position / duration) * 100);
      setVideoProgress(prev => ({ ...prev, [courseId]: progress }));

      // Update progress in database
      await fetch('/api/courses/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          progress,
          position,
          duration
        })
      });
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  };

  // Handle video interactions
  const handleVideoInteraction = async (courseId: string, type: 'play' | 'pause' | 'seek', position: number) => {
    try {
      await fetch('/api/courses/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId,
          type,
          position
        })
      });
    } catch (error) {
      console.error('Error tracking video interaction:', error);
    }
  };

  // Handle course completion
  const handleCourseCompletion = async (courseId: string) => {
    try {
      await fetch('/api/courses/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ courseId })
      });

      toast({
        title: "Course Completed!",
        description: "Congratulations on completing the course!",
      });
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  // Message handler for YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      
      const data = JSON.parse(event.data);
      if (!selectedCourse) return;

      switch (data.event) {
        case "onStateChange":
          if (data.info === 1) { // Playing
            handleVideoInteraction(selectedCourse.id, 'play', data.currentTime);
          } else if (data.info === 2) { // Paused
            handleVideoInteraction(selectedCourse.id, 'pause', data.currentTime);
          }
          break;
        case "onReady":
          // Set initial position if exists
          if (selectedCourse.lastWatchPosition) {
            videoRef.current?.contentWindow?.postMessage(
              JSON.stringify({
                event: 'seekTo',
                seconds: selectedCourse.lastWatchPosition
              }),
              '*'
            );
          }
          break;
        case "onProgress":
          trackVideoProgress(selectedCourse.id, data.currentTime, data.duration);
          break;
        case "onComplete":
          handleCourseCompletion(selectedCourse.id);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedCourse]);

  if (!currentUser || !currentUser.department) return null;

  // Get tutorials for the user's department
  const departmentTutorials = getTutorialsByDepartment(currentUser.department);

  // Filter courses by user's department
  const departmentCourses = courses.filter(
    course => course.department === currentUser.department
  );

  // Get courses the user is enrolled in
  const enrolledCourses = departmentCourses.filter(
    course => course.enrolledUsers?.includes(currentUser.id)
  );

  // Available courses (not enrolled yet)
  const availableCourses = departmentCourses.filter(
    course => !course.enrolledUsers?.includes(currentUser.id)
  );

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId, currentUser.id);
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course.",
      });
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Courses</h1>
          <p className="text-muted-foreground mt-1">
            Explore and learn with our curated courses for {currentUser.department} department
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
              {departmentTutorials.map(tutorial => (
                <Card key={tutorial.id} className="flex flex-col">
                  <div className="aspect-video w-full bg-muted relative">
                    {tutorial.thumbnailUrl ? (
                      <img
                        src={tutorial.thumbnailUrl}
                        alt={tutorial.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="secondary" 
                            className="rounded-full h-14 w-14"
                            onClick={() => setSelectedCourse({
                              id: tutorial.id,
                              title: tutorial.title,
                              description: tutorial.description,
                              department: tutorial.department,
                              videoUrl: tutorial.videoUrl,
                              thumbnailUrl: tutorial.thumbnailUrl,
                              duration: tutorial.duration
                            })}
                          >
                            <Play className="h-6 w-6" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{tutorial.title}</DialogTitle>
                            <DialogDescription>
                              {tutorial.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 aspect-video w-full bg-black">
                            <iframe 
                              src={tutorial.videoUrl} 
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
                    <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{tutorial.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {tutorial.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" onClick={() => handleEnroll(tutorial.id)}>
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
                const progress = videoProgress[course.id] || course.progress || 0;
                return (
                  <Card key={course.id} className="flex flex-col">
                    <div className="aspect-video w-full bg-muted relative group cursor-pointer">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="h-12 w-12 text-muted-foreground" />
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
                                ref={videoRef}
                                src={`${course.videoUrl}?enablejsapi=1&origin=${window.location.origin}`}
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
                          <Badge variant="default">
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
