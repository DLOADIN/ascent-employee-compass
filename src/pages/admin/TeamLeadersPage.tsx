
import { useState } from "react";
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

const TeamLeadersPage = () => {
  const { toast } = useToast();
  const { users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");

  // Filter team leaders
  const teamLeaders = users.filter(user => user.role === "TeamLeader");
  
  const filteredTeamLeaders = teamLeaders.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || user.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleAddTeamLeader = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditTeamLeader = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteTeamLeader = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      // In a real app, this would call an API
      toast({
        title: "Team Leader Deleted",
        description: `${selectedUser.name} has been removed from the system.`,
      });
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold">Team Leaders Management</h2>
        <Button onClick={handleAddTeamLeader} className="sm:w-auto w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Leader
        </Button>
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
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
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
                      <TableCell className="hidden lg:table-cell">{user.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeamLeader(user);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeamLeader(user);
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

      <AddTeamLeaderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedUser && (
        <>
          <EditTeamLeaderDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
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
