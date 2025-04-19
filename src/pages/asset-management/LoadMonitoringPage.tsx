import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadMonitoringData } from "@/lib/asset-types";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/calculations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";

export default function LoadMonitoringPage() {
  const { user } = useAuth();
  const { regions, districts, loadMonitoringRecords, deleteLoadMonitoringRecord } = useData();
  const navigate = useNavigate();
  
  // Filter records based on user's role and region/district
  const filteredRecords = loadMonitoringRecords?.filter(record => {
    if (user?.role === 'global_engineer') return true;
    
    // For regional engineers, check if the record's region matches their assigned region
    if (user?.role === 'regional_engineer') {
      const userRegion = regions.find(r => r.name === user.region);
      return userRegion && record.regionId === userRegion.id;
    }
    
    // For district engineers, check if the record's district matches their assigned district
    if (user?.role === 'district_engineer') {
      const userDistrict = districts.find(d => d.name === user.district);
      return userDistrict && record.districtId === userDistrict.id;
    }
    
    return false;
  }) || [];

  const handleView = (id: string) => {
    navigate(`/asset-management/load-monitoring-details/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };

  const handleDelete = (id: string) => {
    const record = loadMonitoringRecords?.find(r => r.id === id);
    if (!record) return;

    // Check if user has permission to delete
    if (user?.role === 'global_engineer') {
      deleteLoadMonitoringRecord(id);
      toast.success("Load monitoring record deleted successfully");
      return;
    }

    if (user?.role === 'regional_engineer') {
      const userRegion = regions.find(r => r.name === user.region);
      if (userRegion && record.regionId === userRegion.id) {
        deleteLoadMonitoringRecord(id);
        toast.success("Load monitoring record deleted successfully");
        return;
      }
    }

    if (user?.role === 'district_engineer') {
      const userDistrict = districts.find(d => d.name === user.district);
      if (userDistrict && record.districtId === userDistrict.id) {
        deleteLoadMonitoringRecord(id);
        toast.success("Load monitoring record deleted successfully");
        return;
      }
    }

    toast.error("You don't have permission to delete this record");
  };

  return (
    <AccessControlWrapper type="load-monitoring">
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Load Monitoring</h1>
            <Button onClick={() => navigate('/asset-management/create-load-monitoring')}>
              Add New Record
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableCaption>List of load monitoring records</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Substation</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Rating (MW)</TableHead>
                    <TableHead>Load (%)</TableHead>
                    <TableHead>Peak Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const region = regions.find(r => r.id === record.regionId);
                    const district = districts.find(d => d.id === record.districtId);
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.substationName}</TableCell>
                        <TableCell>{region?.name || 'Unknown'}</TableCell>
                        <TableCell>{district?.name || 'Unknown'}</TableCell>
                        <TableCell>{record.rating}</TableCell>
                        <TableCell>{record.percentageLoad}</TableCell>
                        <TableCell>{record.peakLoadStatus}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(record.id)}>
                                View Details
                              </DropdownMenuItem>
                              {(user?.role === 'global_engineer' || 
                                (user?.role === 'regional_engineer' && record.regionId === regions.find(r => r.name === user.region)?.id) ||
                                (user?.role === 'district_engineer' && record.districtId === districts.find(d => d.name === user.district)?.id)) && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(record.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(record.id)}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
}
