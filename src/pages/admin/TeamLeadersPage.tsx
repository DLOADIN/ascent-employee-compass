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
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Search, Edit, Trash2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Department, User, UserRole } from "@/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AddTeamLeaderDialog } from "@/components/admin/AddTeamLeaderDialog";
import { EditTeamLeaderDialog } from "@/components/admin/EditTeamLeaderDialog";
import { TeamLeaderDetailsDialog } from "@/components/admin/TeamLeaderDetailsDialog";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const TeamLeadersPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('search') || "";
  });
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('department') as Department | "All") || "All";
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamLeaders();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (departmentFilter !== "All") params.set('department', departmentFilter);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [searchTerm, departmentFilter, navigate, location.pathname]);

  const fetchTeamLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get<User[]>('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamLeaders(data.filter(user => user.role === "TeamLeader"));
    } catch (error: any) {
      console.error('Error fetching team leaders:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch team leaders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamLeader = async (formData: Omit<User, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post<User>(
        'http://localhost:5000/api/users',
        { ...formData, role: 'TeamLeader' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTeamLeaders(prev => [...prev, data]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Team leader added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add team leader",
        variant: "destructive",
      });
    }
  };

  const handleEditTeamLeader = async (userId: string, updatedData: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      
      // Format the data to match backend expectations
      const formattedData = {
        name: updatedData.name,
        email: updatedData.email,
        role: updatedData.role || 'TeamLeader',
        department: updatedData.department || null,
        phone_number: updatedData.phoneNumber || null,
        skill_level: updatedData.skillLevel || null,
        experience: updatedData.experience || null,
        description: updatedData.description || null,
        is_active: true
      };

      const { data } = await axios.put<any>(
        `http://localhost:5000/api/users/${userId}`,
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Transform the response data
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
        isActive: Boolean(user.is_active)
      }));

      // If the user was demoted to Employee, remove them from the team leaders list
      if (updatedData.role === 'Employee') {
        setTeamLeaders(prev => prev.filter(tl => tl.id !== userId));
      } else {
        // Otherwise update the existing entry
        setTeamLeaders(prev => prev.map(tl => tl.id === userId ? transformedUsers[0] : tl));
      }

      setIsEditDialogOpen(false);
      setSelectedUser(null);

      // Refresh the data to ensure we have the latest state
      await fetchTeamLeaders();

    } catch (error: any) {
      console.error('Error updating team leader:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update team leader",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeamLeader = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTeamLeaders(prev => prev.filter(tl => tl.id !== selectedUser.id));
      setIsConfirmDialogOpen(false);
      toast({
        title: "Success",
        description: `${selectedUser.name} has been removed from the system`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete team leader",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  // Filter team leaders
  const filteredTeamLeaders = teamLeaders.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || user.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-48">Loading team leaders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold">Team Leaders Management</h2>
        {/* <Button onClick={() => setIsAddDialogOpen(true)} className="sm:w-auto w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Leader
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter team leaders by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team leaders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
          <CardTitle>Team Leaders Listing</CardTitle>
          <CardDescription>View and manage all team leaders in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  {/* <TableHead className="hidden lg:table-cell">Phone</TableHead> */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamLeaders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No team leaders found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeamLeaders.map((user) => (
                    <TableRow key={user.id} onClick={() => handleViewDetails(user)} className="cursor-pointer">
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.department || "N/A"}</TableCell>
                      {/* <TableCell className="hidden lg:table-cell">{user.phoneNumber}</TableCell> */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeamLeader(user);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
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

      <AddTeamLeaderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTeamLeader}
      />

      {selectedUser && (
        <>
          <EditTeamLeaderDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
            onSubmit={(data) => handleEditTeamLeader(selectedUser.id, data)}
          />
          <TeamLeaderDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            user={selectedUser}
          />
          <ConfirmDialog
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
            title="Delete Team Leader"
            description={`Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default TeamLeadersPage;
