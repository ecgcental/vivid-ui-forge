import { useState, useEffect } from "react";
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { EditIcon, PlusCircle, Trash2, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { validateUserRoleAssignment, getFilteredRegionsAndDistricts } from "@/utils/user-utils";
import { hashPassword } from "@/utils/security";

export function UsersList() {
  const { user: currentUser, users, setUsers } = useAuth();
  const { regions, districts } = useData();
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
  const [tempPassword, setTempPassword] = useState<string>("");
  const [showCredentials, setShowCredentials] = useState(false);
  
  // Check if current user is system admin
  const isSystemAdmin = currentUser?.role === "system_admin";
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "district_engineer":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "regional_engineer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "global_engineer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "system_admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "technician":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
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
      case "system_admin":
        return "System Administrator";
      case "technician":
        return "Technician";
      default:
        return "Unknown Role";
    }
  };
  
  // Function to generate a random temporary password
  const generateTempPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };
  
  const handleAddUser = () => {
    if (!newName || !newEmail || !newRole) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // For system admin and global engineer, skip region/district validation
    if (newRole !== "system_admin" && newRole !== "global_engineer") {
      const validation = validateUserRoleAssignment(newRole, newRegion, newDistrict, regions, districts);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }

    // Generate temporary password
    const tempPass = generateTempPassword();
    setTempPassword(tempPass);
    
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      region: (newRole !== "system_admin" && newRole !== "global_engineer") ? newRegion : undefined,
      district: newRole === "district_engineer" ? newDistrict : undefined,
      tempPassword: tempPass,
      mustChangePassword: true,
      password: hashPassword(tempPass)
    };
    
    // Add to users state
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    resetForm();
    setIsAddDialogOpen(false);
    setShowCredentials(true);
    toast.success("User added successfully!");
  };
  
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!newName || !newEmail || !newRole) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // For system admin and global engineer, skip region/district validation
    if (newRole !== "system_admin" && newRole !== "global_engineer") {
      const validation = validateUserRoleAssignment(newRole, newRegion, newDistrict, regions, districts);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
    }
    
    // Update user in state
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === selectedUser.id
        ? {
            ...user,
            name: newName,
            email: newEmail,
            role: newRole,
            region: (newRole !== "system_admin" && newRole !== "global_engineer") ? newRegion : undefined,
            district: (newRole === "district_engineer" || newRole === "technician") ? newDistrict : undefined
          }
        : user
    ));
    
    resetForm();
    setIsEditDialogOpen(false);
    toast.success("User updated successfully");
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser || !isSystemAdmin) return;
    
    // Remove user from state
    setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
    setSelectedUser(null);
    setIsDeleteDialogOpen(false);
    toast.success("User deleted successfully");
  };
  
  const handleDisableUser = (user: User) => {
    if (!user || !isSystemAdmin) return;
    
    // Update user in state
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === user.id
        ? {
            ...u,
            disabled: !u.disabled
          }
        : u
    ));
    
    toast.success(`User ${user.disabled ? 'enabled' : 'disabled'} successfully`);
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
  
  // Get filtered regions and districts based on user role
  const { filteredRegions, filteredDistricts } = getFilteredRegionsAndDistricts(
    currentUser,
    regions,
    districts,
    newRegion ? regions.find(r => r.name === newRegion)?.id : undefined
  );

  // Simplified district filtering - just get districts for the selected region
  const availableDistricts = newRegion
    ? districts.filter(d => {
        const selectedRegion = regions.find(r => r.name === newRegion);
        return d.regionId === selectedRegion?.id;
      })
    : [];
  
  // When region changes, reset district selection
  useEffect(() => {
    setNewDistrict("");
  }, [newRegion]);
  
  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success("Copied to clipboard");
        } catch (err) {
          toast.error("Failed to copy to clipboard");
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
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
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id} className={user.disabled ? "opacity-50" : ""}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>{user.region || "-"}</TableCell>
              <TableCell>{user.district || "-"}</TableCell>
              <TableCell>
                <Badge variant={user.disabled ? "destructive" : "default"}>
                  {user.disabled ? "Disabled" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(user)}
                  disabled={user.disabled}
                >
                  <EditIcon size={16} />
                </Button>
                {isSystemAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisableUser(user)}
                    >
                      {user.disabled ? "Enable" : "Disable"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      disabled={user.disabled}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
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
              Fill in the details to create a new user account.
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
                placeholder="name@example.com"
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
                  <SelectItem value="system_admin">System Administrator</SelectItem>
                  <SelectItem value="global_engineer">Global Engineer</SelectItem>
                  <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                  <SelectItem value="district_engineer">District Engineer</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newRole === "district_engineer" || newRole === "regional_engineer" || newRole === "technician") && (
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={newRegion} onValueChange={setNewRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map(region => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(newRole === "district_engineer" || newRole === "technician") && newRegion && (
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={newDistrict} onValueChange={setNewDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map(district => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
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
      
      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New User Credentials</DialogTitle>
            <DialogDescription>
              Please provide these credentials to the new user. They will be required to change their password on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="flex items-center space-x-2">
                <Input value={newEmail} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(newEmail)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Temporary Password</Label>
              <div className="flex items-center space-x-2">
                <Input value={tempPassword} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(tempPassword)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCredentials(false)}>Close</Button>
          </DialogFooter>
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
                  <SelectItem value="system_admin">System Administrator</SelectItem>
                  <SelectItem value="global_engineer">Global Engineer</SelectItem>
                  <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                  <SelectItem value="district_engineer">District Engineer</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(newRole === "district_engineer" || newRole === "regional_engineer" || newRole === "technician") && (
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Select value={newRegion} onValueChange={setNewRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map(region => (
                      <SelectItem key={region.id} value={region.name}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(newRole === "district_engineer" || newRole === "technician") && newRegion && (
              <div className="space-y-2">
                <Label htmlFor="edit-district">District</Label>
                <Select value={newDistrict} onValueChange={setNewDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map(district => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
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
