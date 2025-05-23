import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from '@/lib/constants';

interface DepartmentEmployee {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  skill_level: string;
  experience: number;
  experience_level: number;
  description: string;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface TeamMemberProgress {
  userId: number;
  userName: string;
  courses: {
    courseId: string;
    courseTitle: string;
    progress: number;
    lastAccessed: string | null;
    lastWatchPosition: number | null;
    totalWatchTime: number;
    daysWatched: number;
  }[];
}

const TeamLeaderCoursesPage: React.FC = () => {
  const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
  const [teamProgress, setTeamProgress] = useState<TeamMemberProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartmentEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/team-leader/department-employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department employees');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching department employees:', error);
      toast({
        title: "Error",
        description: "Failed to load department employees",
        variant: "destructive"
      });
    }
  };

  const fetchTeamProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_URL}/team-leader/course-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team progress');
      }

      const data = await response.json();
      setTeamProgress(data);
    } catch (error) {
      console.error('Error fetching team progress:', error);
      toast({
        title: "Error",
        description: "Failed to load team progress",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDepartmentEmployees(),
        fetchTeamProgress()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEngagementLevel = (daysWatched: number, totalWatchTime: number) => {
    if (daysWatched >= 5 && totalWatchTime >= 7200) return 'High';
    if (daysWatched >= 3 && totalWatchTime >= 3600) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Department Employees & Course Progress</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => {
          const employeeProgress = teamProgress.find(p => p.userId === employee.id);
          
          return (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{employee.name}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <p className="text-sm text-gray-600">{employee.phone_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Skill Level: {employee.skill_level}</p>
                    <p className="text-sm font-medium">Experience: {employee.experience} years</p>
                  </div>

                  {employeeProgress && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Course Progress</h3>
                      {employeeProgress.courses.map((course) => (
                        <div key={course.courseId} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{course.courseTitle}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            className={`h-2 ${getProgressColor(course.progress)}`}
                          />
                          <div className="text-xs text-gray-500">
                            <p>Watch Time: {formatDuration(course.totalWatchTime)}</p>
                            <p>Days Watched: {course.daysWatched}</p>
                            <p>Engagement: {getEngagementLevel(course.daysWatched, course.totalWatchTime)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TeamLeaderCoursesPage;