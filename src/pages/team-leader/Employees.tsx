import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TeamLeaderEmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchDepartmentEmployees();
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Department Employees</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
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

                {employee.description && (
                  <div>
                    <p className="text-sm text-gray-600">{employee.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamLeaderEmployeePage;