import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Edit, Trash2, UserCog } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Department, SkillLevel, User, UserRole } from "@/types";
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/admin/EditEmployeeDialog";
import { EmployeeDetailsDialog } from "@/components/admin/EmployeeDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PromoteToTeamLeaderDialog } from "@/components/admin/PromoteToTeamLeaderDialog";
import axios from "axios";

const EmployeesPage = () => {
  const { toast } = useToast();
  const { users } = useAppContext();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<any[]>('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform the response data to match our User type
      const transformedUsers: User[] = data.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phoneNumber: user.phone_number,
        skillLevel: user.skill_level,
        experience: user.experience,
        experienceLevel: user.experience_level,
        description: user.description,
        profileImage: user.profile_image_url,
        isActive: Boolean(user.is_active),
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));

      setEmployees(transformedUsers.filter(user => user.role === "Employee"));
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search, role, and department
  const filteredEmployees = employees.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesDepartment = departmentFilter === "All" || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment && user.role === "Employee";
  });

  const handleAddEmployee = async (employeeData: Omit<User, 'id'> & { password?: string }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format the data to match backend expectations
      const formattedData = {
        name: employeeData.name,
        email: employeeData.email,
        password: employeeData.password || 'password123', // Use default password if not provided
        role: employeeData.role,
        department: employeeData.department || null,
        phone_number: employeeData.phoneNumber || null,
        skill_level: employeeData.skillLevel || null,
        experience: employeeData.experience || null,
        experience_level: employeeData.experienceLevel || null,
        description: employeeData.description || null,
        is_active: employeeData.isActive
      };

      const { data } = await axios.post<any>(
        'http://localhost:5000/api/users',
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Transform the response data to match our User type
      const transformedUser: User = {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phoneNumber: data.phone_number,
        skillLevel: data.skill_level,
        experience: data.experience,
        experienceLevel: data.experience_level,
        description: data.description,
        profileImage: data.profile_image_url,
        isActive: Boolean(data.is_active),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setEmployees([...employees, transformedUser]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to add employee";
      throw new Error(errorMessage);
    }
  };

  const handleEditEmployee = async (userId: string, updatedData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format the data to match backend expectations
      const formattedData = {
        name: updatedData.name,
        email: updatedData.email,
        role: updatedData.role,
        department: updatedData.department || null,
        phone_number: updatedData.phoneNumber || null,
        skill_level: updatedData.skillLevel || null,
        experience: updatedData.experience || null,
        experience_level: updatedData.experienceLevel || null,
        description: updatedData.description || null,
        is_active: updatedData.isActive
      };

      const response = await axios.put<any>(
        `http://localhost:5000/api/users/${userId}`,
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.user) {
        // Transform the response data to match our User type
        const transformedUser: User = {
          id: userId,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          department: response.data.user.department,
          phoneNumber: response.data.user.phone_number || '',
          skillLevel: response.data.user.skill_level,
          experience: response.data.user.experience || 0,
          experienceLevel: response.data.user.experience_level || 0,
          description: response.data.user.description || '',
          profileImage: response.data.user.profile_image_url || '',
          isActive: Boolean(response.data.user.is_active),
          createdAt: response.data.user.created_at,
          updatedAt: response.data.user.updated_at
        };

        // Update the employees list immediately
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => emp.id === userId ? transformedUser : emp)
        );

        // Close the edit dialog
        setIsEditDialogOpen(false);
        setSelectedUser(null);

        // Show success toast
        toast({
          title: "Success",
          description: "Employee updated successfully",
          variant: "default"
        });

        // Refresh the list to ensure we have the latest data
        await fetchEmployees();
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteEmployee = async (user: User) => {
    setSelectedUser(user);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEmployees(employees.filter(emp => emp.id !== selectedUser.id));
        setIsConfirmDialogOpen(false);
        toast({
          title: "Success",
          description: `${selectedUser.name} has been removed from the system.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete employee",
          variant: "destructive",
        });
      }
    }
  };

  const handlePromoteEmployee = async (user: User) => {
    try {
      setSelectedUser(user);
      setIsPromoteDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open promotion dialog",
        variant: "destructive",
      });
    }
  };

  const handlePromoteConfirm = async (updatedUser: User) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format the data to match backend expectations
      const formattedData = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: 'TeamLeader',
        department: updatedUser.department || null,
        phone_number: updatedUser.phoneNumber || null,
        skill_level: updatedUser.skillLevel || null,
        experience: updatedUser.experience || null,
        experience_level: updatedUser.experienceLevel || null,
        description: updatedUser.description || null,
        is_active: updatedUser.isActive
      };

      const { data } = await axios.put<any>(
        `http://localhost:5000/api/users/${updatedUser.id}`,
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setEmployees(employees.filter(emp => emp.id !== updatedUser.id));
      
      toast({
        title: "Success",
        description: `${updatedUser.name} has been promoted to Team Leader`,
        variant: "default"
      });
      
      setIsPromoteDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Promotion error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to promote employee",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold">Employees Management</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="sm:w-auto w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter employees by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "All")}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="TeamLeader">Team Leader</option>
              <option value="Employee">Employee</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as Department | "All")}
            >
              <option value="All">All Departments</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="Customer-Service">Customer Service</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Listing</CardTitle>
          <CardDescription>View and manage all employees in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No employees found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((user) => (
                    <TableRow key={user.id} onClick={() => handleViewDetails(user)} className="cursor-pointer">
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.department || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{user.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.role === "Employee" && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 hover:bg-green-100 text-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePromoteEmployee(user);
                              }}
                              title="Promote to Team Leader"
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => handleEditClick(e, user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(user);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddEmployee}
      />

      {selectedUser && (
        <>
          <EditEmployeeDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
            onSubmit={handleEditEmployee}
          />
          <EmployeeDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            user={selectedUser}
          />
          <ConfirmDialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
            title="Delete Employee"
            description={`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`}
            onConfirm={confirmDelete}
          />
          <PromoteToTeamLeaderDialog
            open={isPromoteDialogOpen}
            onOpenChange={setIsPromoteDialogOpen}
            user={selectedUser}
            onConfirm={handlePromoteConfirm}
          />
        </>
      )}
    </div>
  );
};

export default EmployeesPage;
