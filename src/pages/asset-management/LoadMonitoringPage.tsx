import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoadMonitoringData } from "@/lib/asset-types";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
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

export default function LoadMonitoringPage() {
  const navigate = useNavigate();
  const { 
    loadMonitoringRecords = [],
    deleteLoadMonitoringRecord
  } = useData();

  // --- Action Handlers ---
  const handleView = (id: string) => {
    navigate(`/asset-management/load-monitoring-details/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };

  const handleDelete = (id: string) => {
    if (deleteLoadMonitoringRecord && window.confirm("Are you sure you want to delete this record?")) {
      deleteLoadMonitoringRecord(id);
    } else if (!deleteLoadMonitoringRecord) {
      toast.error("Delete function not available.")
    }
  };
  
  // --- CSV Export Handler ---
  const handleExportCsv = () => {
    if (!loadMonitoringRecords || loadMonitoringRecords.length === 0) {
      toast.info("No records to export.");
      return;
    }
    const headers = [
      "ID", "Date", "Time", "Region", "District", 
      "Substation Name", "Substation Number", "Location", "Rating (KVA)", "Peak Load Status",
      "Rated Load (A)", "Red Phase Bulk (A)", "Yellow Phase Bulk (A)", "Blue Phase Bulk (A)",
      "Average Current (A)", "% Load", "10% Rated Neutral (A)", "Calculated Neutral (A)"
    ];
    const rows = loadMonitoringRecords.map(record => [
      record.id,
      record.date,
      record.time,
      record.region,
      record.district,
      record.substationName,
      record.substationNumber,
      record.location,
      record.rating,
      record.peakLoadStatus,
      record.ratedLoad.toFixed(2),
      record.redPhaseBulkLoad.toFixed(2),
      record.yellowPhaseBulkLoad.toFixed(2),
      record.bluePhaseBulkLoad.toFixed(2),
      record.averageCurrent.toFixed(2),
      record.percentageLoad.toFixed(2),
      record.tenPercentFullLoadNeutral.toFixed(2),
      record.calculatedNeutral.toFixed(2)
    ]);
    const escapeCsvCell = (cell: any) => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    };
    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map(row => row.map(escapeCsvCell).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = `transformer_load_monitoring_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export started successfully.");
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Transformer Load Records</h1>
           <Button 
              onClick={() => navigate("/asset-management/create-load-monitoring")}
              variant="default"
            >
              New Load Record
            </Button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold tracking-tight">Saved Records</h2>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>List of saved transformer load monitoring records.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Substation No</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Avg. Current (A)</TableHead>
                      <TableHead>% Load</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadMonitoringRecords.length > 0 ? (
                      loadMonitoringRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{record.time}</TableCell>
                          <TableCell>{record.substationNumber}</TableCell>
                          <TableCell>{record.region}</TableCell>
                          <TableCell>{record.district}</TableCell>
                          <TableCell>{record.averageCurrent.toFixed(2)}</TableCell>
                          <TableCell>{record.percentageLoad.toFixed(2)}%</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleView(record.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(record.id)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Record
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={() => handleDelete(record.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No load monitoring records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
