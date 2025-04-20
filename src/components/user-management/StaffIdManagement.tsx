import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/components/ui/sonner";
import { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, Download, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type StaffIdEntry = {
  id: string;
  name: string;
  role: UserRole;
  region?: string;
  district?: string;
};

export function StaffIdManagement() {
  const { staffIds, addStaffId, updateStaffId, deleteStaffId } = useAuth();
  const { regions } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<Omit<StaffIdEntry, "id"> & { customId?: string }>({
    name: "",
    role: "technician",
    region: undefined,
    district: undefined,
    customId: undefined
  });
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAdd = () => {
    setError(null);
    // Validate the entry
    if (!newEntry.name) {
      setError("Name is required");
      return;
    }
    if (!newEntry.role) {
      setError("Role is required");
      return;
    }
    if (newEntry.role !== "global_engineer" && !newEntry.region) {
      setError("Region is required for this role");
      return;
    }
    if (newEntry.role === "district_engineer" && !newEntry.district) {
      setError("District is required for district engineers");
      return;
    }
    if (newEntry.role === "technician" && !newEntry.district) {
      setError("District is required for technicians");
      return;
    }

    try {
      addStaffId(newEntry);
      setIsAdding(false);
      setNewEntry({
        name: "",
        role: "technician",
        region: undefined,
        district: undefined,
        customId: undefined
      });
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleUpdate = (id: string) => {
    setError(null);
    const entry = staffIds.find(e => e.id === id);
    if (!entry) return;

    // Validate the entry
    if (!entry.name) {
      setError("Name is required");
      return;
    }
    if (!entry.role) {
      setError("Role is required");
      return;
    }
    if (entry.role !== "global_engineer" && !entry.region) {
      setError("Region is required for this role");
      return;
    }
    if (entry.role === "district_engineer" && !entry.district) {
      setError("District is required for district engineers");
      return;
    }
    if (entry.role === "technician" && !entry.district) {
      setError("District is required for technicians");
      return;
    }

    try {
      updateStaffId(id, {
        name: entry.name,
        role: entry.role,
        region: entry.region,
        district: entry.district
      });
      setIsEditing(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteStaffId(id);
    } catch (error) {
      setError((error as Error).message);
    }
  };

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      // Skip header row
      const dataRows = rows.slice(1);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of dataRows) {
        const [name, role, region, district, customId] = row.split(',').map(cell => cell.trim());
        
        try {
          // Validate role is a valid UserRole
          if (!['global_engineer', 'regional_engineer', 'district_engineer', 'technician'].includes(role)) {
            throw new Error(`Invalid role: ${role}`);
          }

          addStaffId({
            name,
            role: role as UserRole,
            region,
            district,
            customId: customId || undefined
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to add staff: ${name}`, error);
        }
      }
      
      toast.success(`Upload complete: ${successCount} successful, ${errorCount} failed`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process the CSV file');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const downloadSample = () => {
    const sampleData = `name,role,region,district,customId
John Doe,regional_engineer,Greater Accra,,ECG001
Jane Smith,district_engineer,Ashanti,Kumasi,ECG002
Mike Johnson,technician,Western,Takoradi,ECG003
Sarah Williams,global_engineer,,,ECG004
Kwame Asante,technician,Central,Cape Coast,ECG005`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_id_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Staff ID Management</CardTitle>
        <CardDescription>
          Manage staff IDs and their associated information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>CSV Upload Guide</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>You can upload staff information using a CSV file with the following format:</p>
            <ul className="list-disc pl-4">
              <li>First row must be headers: name,role,region,district,customId</li>
              <li>Each subsequent row represents one staff member</li>
              <li>Fields should be separated by commas</li>
              <li>Leave district empty for regional engineers</li>
              <li>Leave region and district empty for global engineers</li>
              <li>Custom ID is optional (6-10 alphanumeric characters)</li>
            </ul>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={downloadSample}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Label htmlFor="csv-upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </Label>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Staff ID Management</h2>
          <Button onClick={() => setIsAdding(true)}>Add New Staff ID</Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isAdding && (
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">Add New Staff ID</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Custom Staff ID (Optional)</Label>
                <Input
                  value={newEntry.customId || ""}
                  onChange={(e) => setNewEntry({ ...newEntry, customId: e.target.value })}
                  placeholder="Enter custom ID (6-10 alphanumeric characters)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to generate an ECGXXX format ID
                </p>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newEntry.role}
                  onValueChange={(value) => setNewEntry({ ...newEntry, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global_engineer">Global Engineer</SelectItem>
                    <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                    <SelectItem value="district_engineer">District Engineer</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newEntry.role !== "global_engineer" && (
                <>
                  <div>
                    <Label>Region</Label>
                    <Select
                      value={newEntry.region}
                      onValueChange={(value) => setNewEntry({ ...newEntry, region: value })}
                    >
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
                  {(newEntry.role === "district_engineer" || newEntry.role === "technician") && newEntry.region && (
                    <div>
                      <Label>District</Label>
                      <Select
                        value={newEntry.district}
                        onValueChange={(value) => setNewEntry({ ...newEntry, district: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions
                            .find(r => r.name === newEntry.region)
                            ?.districts.map(district => (
                              <SelectItem key={district.id} value={district.name}>
                                {district.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffIds.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>
                    {isEditing === entry.id ? (
                      <Input
                        value={entry.name}
                        onChange={(e) => {
                          const updatedEntry = { ...entry, name: e.target.value };
                          updateStaffId(entry.id, updatedEntry);
                        }}
                      />
                    ) : (
                      entry.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === entry.id ? (
                      <Select
                        value={entry.role}
                        onValueChange={(value) => {
                          const updatedEntry = { ...entry, role: value as UserRole };
                          updateStaffId(entry.id, updatedEntry);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global_engineer">Global Engineer</SelectItem>
                          <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                          <SelectItem value="district_engineer">District Engineer</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      entry.role.replace('_', ' ')
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === entry.id ? (
                      <Select
                        value={entry.region}
                        onValueChange={(value) => {
                          const updatedEntry = { ...entry, region: value, district: undefined };
                          updateStaffId(entry.id, updatedEntry);
                        }}
                      >
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
                    ) : (
                      entry.region || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === entry.id ? (
                      <Select
                        value={entry.district}
                        onValueChange={(value) => {
                          const updatedEntry = { ...entry, district: value };
                          updateStaffId(entry.id, updatedEntry);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions
                            .find(r => r.name === entry.region)
                            ?.districts.map(district => (
                              <SelectItem key={district.id} value={district.name}>
                                {district.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      entry.district || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {isEditing === entry.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleUpdate(entry.id)}>Save</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(entry.id)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>Delete</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 