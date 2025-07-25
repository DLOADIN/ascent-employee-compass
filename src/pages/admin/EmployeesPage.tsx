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
import { UserPlus, Search, Edit, Trash2, UserCog, FileText, Download, Eye, FileDown } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Department, SkillLevel, User, UserRole } from "@/types";
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog";
import { EditEmployeeDialog } from "@/components/admin/EditEmployeeDialog";
import { EmployeeDetailsDialog } from "@/components/admin/EmployeeDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PromoteToTeamLeaderDialog } from "@/components/admin/PromoteToTeamLeaderDialog";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const skillLevelSchema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

const EmployeesPage = () => {
  const { toast } = useToast();
  const { users, tasks, courses } = useAppContext();
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
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skillDialogUser, setSkillDialogUser] = useState<User | null>(null);
  const [isCvDialogOpen, setIsCvDialogOpen] = useState(false);
  const [cvDialogUser, setCvDialogUser] = useState<User | null>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get<any[]>('https://manzi897098.pythonanywhere.com/api/users', {
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
        cvUrl: user.cv_url || undefined,
        cvJobTitle: user.cv_job_title || undefined,
        cvSubmittedAt: user.cv_submitted_at || undefined
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
        'https://manzi897098.pythonanywhere.com/api/users',
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
        cvUrl: data.cv_url || undefined,
        cvJobTitle: data.cv_job_title || undefined,
        cvSubmittedAt: data.cv_submitted_at || undefined
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
        `https://manzi897098.pythonanywhere.com/api/users/${userId}`,
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
          cvUrl: response.data.user.cv_url || undefined,
          cvJobTitle: response.data.user.cv_job_title || undefined,
          cvSubmittedAt: response.data.user.cv_submitted_at || undefined
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
        await axios.delete(`https://manzi897098.pythonanywhere.com/api/users/${selectedUser.id}`, {
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
        `https://manzi897098.pythonanywhere.com/api/users/${updatedUser.id}`,
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

  const handleOpenSkillDialog = (user: User) => {
    setSkillDialogUser(user);
    setIsSkillDialogOpen(true);
  };

  const handleSkillDialogClose = () => {
    setIsSkillDialogOpen(false);
    setSkillDialogUser(null);
  };

  const handleSkillLevelUpdate = async (values: { skillLevel: SkillLevel }) => {
    if (!skillDialogUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://manzi897098.pythonanywhere.com/api/users/${skillDialogUser.id}/promote-skill`,
        { skillLevel: values.skillLevel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees((prev) => prev.map(emp => emp.id === skillDialogUser.id ? { ...emp, skillLevel: values.skillLevel } : emp));
      toast({ title: "Success", description: `${skillDialogUser.name}'s skill level updated to ${values.skillLevel}` });
      handleSkillDialogClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update skill level", variant: "destructive" });
    }
  };

  const handleViewCv = async (user: User) => {
    try {
      setIsLoadingCv(true);
      setCvDialogUser(user);
      setIsCvDialogOpen(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://manzi897098.pythonanywhere.com/api/users/${user.id}/cv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCvData(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "No CV Found",
          description: "This employee doesn't have a CV uploaded yet.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch CV",
          variant: "destructive",
        });
      }
      setIsCvDialogOpen(false);
    } finally {
      setIsLoadingCv(false);
    }
  };

  const handleDownloadCv = (cvUrl: string, employeeName: string) => {
    const fullUrl = `https://manzi897098.pythonanywhere.com${cvUrl}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${employeeName}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://manzi897098.pythonanywhere.com/api/admin/export-employee-report-pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Employee report generated and downloaded successfully",
        });
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate employee report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Employees Management</h2>
        </div>
        <div className="pl-[340px]">
          <Button onClick={() => setIsAddDialogOpen(true)} className="sm:w-auto w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button
            variant="outline"
            className="sm:w-auto w-full ml-2"
            onClick={async () => {
              const token = localStorage.getItem('token');
              const res = await fetch('https://manzi897098.pythonanywhere.com/api/admin/export-employees-pdf', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'employees.pdf';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } else {
                alert('Failed to download PDF');
              }
            }}
          >
            Print Employees PDF
          </Button>
          <Button
            variant="outline"
            className="sm:w-auto w-full ml-2"
            onClick={handleGenerateReport}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
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
                  <TableHead className="hidden lg:table-cell">Skill Level</TableHead>
                  <TableHead className="hidden lg:table-cell">CV</TableHead>
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
                      <TableCell className="hidden lg:table-cell">{user.skillLevel}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCv(user);
                            }}
                            title="View CV"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Badge variant="outline" className="text-xs">
                            {user.cvUrl ? "Available" : "No CV"}
                          </Badge>
                        </div>
                      </TableCell>
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
                          <Button
                            variant="outline"
                            size="icon"
                            className="px-3 w-fit bg-blue-50 hover:bg-blue-100 text-blue-700"
                            onClick={e => { e.stopPropagation(); handleOpenSkillDialog(user); }}
                            title="Update Skill Level"
                          >
                            <span className="font-bold">Skill Level Promote</span>
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

      {skillDialogUser && (
        <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Skill Level</DialogTitle>
            </DialogHeader>
            <div className="mb-2">
              <div className="font-semibold">{skillDialogUser.name}</div>
              <div className="text-xs text-muted-foreground mb-2">Current: {skillDialogUser.skillLevel || "-"}</div>
              <div className="text-sm mb-2">
                <div className="font-medium">Task Completion:</div>
                {/* Show number of completed tasks and total tasks */}
                {(() => {
                  const userTasks = tasks.filter(t => t.assignedTo === skillDialogUser.id || (Array.isArray(t.assignedTo) && t.assignedTo.includes(skillDialogUser.id)));
                  const completed = userTasks.filter(t => t.status === "Completed").length;
                  return `${completed} of ${userTasks.length} tasks completed`;
                })()}
              </div>
              <div className="text-sm mb-2">
                <div className="font-medium">Courses Completed:</div>
                {/* Show number of completed courses and total courses enrolled */}
                {(() => {
                  const userCourses = courses.filter(c => c.enrolledUsers && c.enrolledUsers.includes(skillDialogUser.id));
                  const completed = userCourses.filter(c => c.status === "Completed").length;
                  return `${completed} of ${userCourses.length} courses completed`;
                })()}
              </div>
            </div>
            <SkillLevelForm user={skillDialogUser} onSubmit={handleSkillLevelUpdate} onCancel={handleSkillDialogClose} />
          </DialogContent>
        </Dialog>
      )}

      {cvDialogUser && (
        <Dialog open={isCvDialogOpen} onOpenChange={setIsCvDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Employee CV - {cvDialogUser.name}</DialogTitle>
            </DialogHeader>
            {isLoadingCv ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Loading CV...</p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                {cvData ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">CV Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Job Title:</span> {cvData.job_title}</div>
                        <div><span className="font-medium">Submitted:</span> {new Date(cvData.submitted_at).toLocaleDateString()}</div>
                        <div><span className="font-medium">File:</span> {cvData.cv_url.split('/').pop()}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="bg-gray-100 p-8 rounded-lg text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">CV Document</p>
                        <p className="text-xs text-gray-500 mt-1">Click download to view the full document</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCvDialogOpen(false)}
                      >
                        Close
                      </Button>
                      <Button 
                        onClick={() => handleDownloadCv(cvData.cv_url, cvDialogUser.name)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download CV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No CV Found</h3>
                    <p className="text-gray-600 mb-4">This employee doesn't have a CV uploaded yet.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCvDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function SkillLevelForm({ user, onSubmit, onCancel }: { user: User, onSubmit: (values: { skillLevel: SkillLevel }) => void, onCancel: () => void }) {
  const form = useForm<{ skillLevel: SkillLevel }>({
    resolver: zodResolver(skillLevelSchema),
    defaultValues: { skillLevel: user.skillLevel || "Beginner" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="skillLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Level</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="Beginner" />
                    </FormControl>
                    <FormLabel>Beginner</FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="Intermediate" />
                    </FormControl>
                    <FormLabel>Intermediate</FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <RadioGroupItem value="Advanced" />
                    </FormControl>
                    <FormLabel>Advanced</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </Form>
  );
}

export default EmployeesPage;
