
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/lib/types";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { EditIcon, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Mock list of users
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "district@ecg.com",
    name: "District Engineer",
    role: "district_engineer",
    region: "Greater Accra",
    district: "Accra Metro"
  },
  {
    id: "2",
    email: "regional@ecg.com",
    name: "Regional Engineer",
    role: "regional_engineer",
    region: "Greater Accra"
  },
  {
    id: "3",
    email: "global@ecg.com",
    name: "Global Engineer",
    role: "global_engineer"
  },
  {
    id: "4",
    email: "district2@ecg.com",
    name: "Tema District Engineer",
    role: "district_engineer",
    region: "Greater Accra",
    district: "Tema"
  },
  {
    id: "5",
    email: "district3@ecg.com",
    name: "Kumasi District Engineer",
    role: "district_engineer",
    region: "Ashanti",
    district: "Kumasi Metro"
  },
  {
    id: "6",
    email: "regional2@ecg.com",
    name: "Ashanti Regional Engineer",
    role: "regional_engineer",
    region: "Ashanti"
  }
];

export function UsersList() {
  const { user: currentUser } = useAuth();
  const { regions, districts } = useData();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>(null);
  const [newRegion, setNewRegion] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "district_engineer":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "regional_engineer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "global_engineer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "district_engineer":
        return "District Engineer";
      case "regional_engineer":
        return "Regional Engineer";
      case "global_engineer":
        return "Global Engineer";
      default:
        return "Unknown Role";
    }
  };
  
  const handleAddUser = () => {
    if (!newName || !newEmail || !newRole) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (newRole === "district_engineer" && (!newRegion || !newDistrict)) {
      toast.error("District Engineers must have a region and district assigned");
      return;
    }
    
    if (newRole === "regional_engineer" && !newRegion) {
      toast.error("Regional Engineers must have a region assigned");
      return;
    }
    
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: newName,
      email: newEmail,
      role: newRole,
      region: newRole !== "global_engineer" ? newRegion : undefined,
      district: newRole === "district_engineer" ? newDistrict : undefined
    };
    
    setUsers([...users, newUser]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("User added successfully");
  };
  
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!newName || !newEmail || !newRole) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (newRole === "district_engineer" && (!newRegion || !newDistrict)) {
      toast.error("District Engineers must have a region and district assigned");
      return;
    }
    
    if (newRole === "regional_engineer" && !newRegion) {
      toast.error("Regional Engineers must have a region assigned");
      return;
    }
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id
        ? {
            ...user,
            name: newName,
            email: newEmail,
            role: newRole,
            region: newRole !== "global_engineer" ? newRegion : undefined,
            district: newRole === "district_engineer" ? newDistrict : undefined
          }
        : user
    );
    
    setUsers(updatedUsers);
    resetForm();
    setIsEditDialogOpen(false);
    toast.success("User updated successfully");
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setSelectedUser(null);
    setIsDeleteDialogOpen(false);
    toast.success("User deleted successfully");
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewRegion(user.region || "");
    setNewDistrict(user.district || "");
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const resetForm = () => {
    setNewName("");
    setNewEmail("");
    setNewRole(null);
    setNewRegion("");
    setNewDistrict("");
    setSelectedUser(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          className="flex items-center"
        >
          <PlusCircle size={16} className="mr-2" />
          Add User
        </Button>
      </div>
      
      <Table>
        <TableCaption>List of system users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>District</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user.region || "-"}</TableCell>
              <TableCell>{user.district || "-"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(user)}
                >
                  <EditIcon size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(user)}
                >
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific role and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRole || ""} onValueChange={(value) => setNewRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="district_engineer">District Engineer</SelectItem>
                  <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                  <SelectItem value="global_engineer">Global Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newRole === "district_engineer" || newRole === "regional_engineer") && (
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={newRegion} onValueChange={setNewRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newRole === "district_engineer" && newRegion && (
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={newDistrict} onValueChange={setNewDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts
                      .filter(d => {
                        const district = regions.find(r => r.name === newRegion)?.districts.find(dist => dist.id === d.id);
                        return !!district;
                      })
                      .map(district => (
                        <SelectItem key={district.id} value={district.name}>
                          {district.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsAddDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={newRole || ""} onValueChange={(value) => setNewRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="district_engineer">District Engineer</SelectItem>
                  <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                  <SelectItem value="global_engineer">Global Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newRole === "district_engineer" || newRole === "regional_engineer") && (
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Select value={newRegion} onValueChange={setNewRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newRole === "district_engineer" && newRegion && (
              <div className="space-y-2">
                <Label htmlFor="edit-district">District</Label>
                <Select value={newDistrict} onValueChange={setNewDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts
                      .filter(d => {
                        const district = regions.find(r => r.name === newRegion)?.districts.find(dist => dist.id === d.id);
                        return !!district;
                      })
                      .map(district => (
                        <SelectItem key={district.id} value={district.name}>
                          {district.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {getRoleLabel(selectedUser.role)}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setSelectedUser(null);
              setIsDeleteDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
