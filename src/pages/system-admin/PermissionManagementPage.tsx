import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionService } from '@/services/PermissionService';
import { UserRole } from '@/lib/types';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function PermissionManagementPage() {
  const { user } = useAuth();
  const permissionService = PermissionService.getInstance();
  const [newFeature, setNewFeature] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [featurePermissions, setFeaturePermissions] = useState<{ [key: string]: UserRole[] }>({});
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);

  // Get all available roles
  const allRoles: UserRole[] = ['technician', 'district_engineer', 'regional_engineer', 'global_engineer', 'system_admin'];

  // Load current permissions
  useEffect(() => {
    setFeaturePermissions(permissionService.getFeaturePermissions());
  }, []);

  // Check if user has permission to access this page
  if (!permissionService.canAccessFeature(user?.role || null, 'system_configuration')) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  const handleAddFeature = () => {
    if (!newFeature.trim()) {
      toast.error('Please enter a feature name');
      return;
    }

    try {
      permissionService.addFeature(newFeature, selectedRoles);
      setFeaturePermissions(permissionService.getFeaturePermissions());
      toast.success(`Feature "${newFeature}" added successfully`);
      setNewFeature('');
      setSelectedRoles([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add feature');
    }
  };

  const handleEditClick = (feature: string, roles: UserRole[]) => {
    setEditingFeature(feature);
    setEditRoles(roles);
  };

  const handleUpdatePermissions = () => {
    if (!editingFeature) return;

    try {
      permissionService.updateFeaturePermissions(editingFeature, editRoles);
      setFeaturePermissions(permissionService.getFeaturePermissions());
      toast.success(`Permissions updated for "${editingFeature}"`);
      setEditingFeature(null);
      setEditRoles([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update permissions');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    try {
      permissionService.removeFeature(feature);
      setFeaturePermissions(permissionService.getFeaturePermissions());
      toast.success(`Feature "${feature}" removed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove feature');
    }
  };

  const handleRoleToggle = (role: UserRole, currentRoles: UserRole[], setRoles: (roles: UserRole[]) => void) => {
    if (currentRoles.includes(role)) {
      setRoles(currentRoles.filter(r => r !== role));
    } else {
      setRoles([...currentRoles, role]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Permission Management</h1>

      {/* Navigation Links */}
      <div className="mb-6 flex flex-wrap gap-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              "text-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/user-management"
          className={({ isActive }) =>
            cn(
              "text-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )
          }
        >
          User Management
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            cn(
              "text-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/asset-management/inspection-management"
          className={({ isActive }) =>
            cn(
              "text-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )
          }
        >
          Inspections
        </NavLink>
        <NavLink
          to="/report-fault"
          className={({ isActive }) =>
            cn(
              "text-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )
          }
        >
          Report Fault
        </NavLink>
      </div>

      {/* Add New Feature Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="feature">Feature Name</Label>
              <Input
                id="feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Enter feature name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Allowed Roles</Label>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                {allRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role, selectedRoles, setSelectedRoles)}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {role.replace('_', ' ').toUpperCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleAddFeature}>Add Feature</Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Allowed Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(featurePermissions).map(([feature, roles]) => (
                <TableRow key={feature}>
                  <TableCell className="font-medium">
                    {feature.replace('_', ' ').toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {roles.join(', ').replace(/_/g, ' ').toUpperCase()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleEditClick(feature, roles)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Permissions for {feature.replace('_', ' ').toUpperCase()}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>Allowed Roles</Label>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                              {allRoles.map((role) => (
                                <div key={role} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-role-${role}`}
                                    checked={editRoles.includes(role)}
                                    onCheckedChange={() => handleRoleToggle(role, editRoles, setEditRoles)}
                                  />
                                  <Label htmlFor={`edit-role-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {role.replace('_', ' ').toUpperCase()}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button onClick={handleUpdatePermissions}>Save Changes</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveFeature(feature)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 