
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon, FileText, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function VITInspectionManagementPage() {
  const { savedVITInspections, deleteVITInspection } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter inspections based on search query
  const filteredInspections = savedVITInspections.filter(inspection => {
    const searchText = searchQuery.toLowerCase();
    return (
      inspection.region.toLowerCase().includes(searchText) ||
      inspection.district.toLowerCase().includes(searchText) ||
      inspection.typeOfUnit.toLowerCase().includes(searchText) ||
      inspection.serialNumber.toLowerCase().includes(searchText) ||
      inspection.location.toLowerCase().includes(searchText)
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Handle delete inspection
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
      deleteVITInspection(id);
      toast.success("VIT inspection deleted successfully");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredInspections.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Create CSV headers
    const headers = [
      "ID", "Region", "District", "Date", "Voltage Level", "Type of Unit", 
      "Serial Number", "Location", "GPS Location", "Status", "Protection"
    ];
    
    // Create CSV rows
    const rows = filteredInspections.map(inspection => [
      inspection.id,
      inspection.region,
      inspection.district,
      inspection.date,
      inspection.voltageLevel,
      inspection.typeOfUnit,
      inspection.serialNumber,
      inspection.location,
      inspection.gpsLocation,
      inspection.status,
      inspection.protection
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vit_inspections.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully");
  };

  // Export to PDF
  const exportToPDF = (id?: string) => {
    const doc = new jsPDF();
    
    // If ID is provided, export specific inspection details
    if (id) {
      const inspection = savedVITInspections.find(insp => insp.id === id);
      if (!inspection) {
        toast.error("Inspection not found");
        return;
      }
      
      // Add header
      doc.setFontSize(18);
      doc.text("VIT Inspection Report", 105, 15, { align: "center" });
      
      // Add basic information
      doc.setFontSize(12);
      doc.text(`Region: ${inspection.region}`, 20, 30);
      doc.text(`District: ${inspection.district}`, 20, 37);
      doc.text(`Date: ${formatDate(inspection.date)}`, 20, 44);
      doc.text(`Voltage Level: ${inspection.voltageLevel}`, 20, 51);
      doc.text(`Type of Unit: ${inspection.typeOfUnit}`, 20, 58);
      doc.text(`Serial Number: ${inspection.serialNumber}`, 20, 65);
      doc.text(`Location: ${inspection.location}`, 20, 72);
      doc.text(`GPS Location: ${inspection.gpsLocation}`, 20, 79);
      doc.text(`Status: ${inspection.status}`, 20, 86);
      doc.text(`Protection: ${inspection.protection}`, 20, 93);
      
      // Add checklist items
      doc.setFontSize(14);
      doc.text("VIT Checklist", 105, 110, { align: "center" });
      
      // Prepare data for table
      const tableData = inspection.items.map(item => [
        item.name,
        item.status.toUpperCase(),
        item.remarks || "-"
      ]);
      
      // Add table with items
      (doc as any).autoTable({
        startY: 120,
        head: [["Item", "Status", "Remarks"]],
        body: tableData,
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        doc.text(`Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 295, { align: "center" });
      }
      
      doc.save(`vit_inspection_${inspection.id}.pdf`);
      toast.success("PDF generated successfully");
    } 
    // Export summary of all inspections
    else {
      if (filteredInspections.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      // Add header
      doc.setFontSize(18);
      doc.text("VIT Inspections Summary Report", 105, 15, { align: "center" });
      
      // Prepare data for table
      const tableData = filteredInspections.map(inspection => [
        formatDate(inspection.date),
        inspection.region,
        inspection.district,
        inspection.voltageLevel,
        inspection.typeOfUnit,
        inspection.serialNumber,
        inspection.status
      ]);
      
      // Add table with summary
      (doc as any).autoTable({
        startY: 25,
        head: [["Date", "Region", "District", "Voltage", "Type", "Serial Number", "Status"]],
        body: tableData,
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        doc.text(`Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 295, { align: "center" });
      }
      
      doc.save("vit_inspections_summary.pdf");
      toast.success("PDF generated successfully");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VIT Inspections Management</h1>
            <p className="text-muted-foreground mt-2">
              View, edit and manage all VIT inspections
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/asset-management/vit-inspection")}>
              New VIT Inspection
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search and Export</CardTitle>
            <CardDescription>
              Find inspections or export data for reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search by region, district, type, serial number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
                <Button variant="outline" onClick={() => exportToPDF()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VIT Inspections</CardTitle>
            <CardDescription>
              {filteredInspections.length} {filteredInspections.length === 1 ? 'inspection' : 'inspections'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Voltage</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Serial No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.length > 0 ? (
                    filteredInspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell>{formatDate(inspection.date)}</TableCell>
                        <TableCell>{inspection.region}</TableCell>
                        <TableCell>{inspection.district}</TableCell>
                        <TableCell>{inspection.voltageLevel}</TableCell>
                        <TableCell>{inspection.typeOfUnit}</TableCell>
                        <TableCell>{inspection.serialNumber}</TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inspection.status === 'Operational' 
                                ? 'bg-green-100 text-green-800' 
                                : inspection.status === 'Under Maintenance'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {inspection.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/asset-management/vit-inspection-details/${inspection.id}`)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/asset-management/edit-vit-inspection/${inspection.id}`)}
                              title="Edit inspection"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => exportToPDF(inspection.id)}
                              title="Export to PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(inspection.id)}
                              title="Delete inspection"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No inspections found. {searchQuery ? "Try a different search term or " : ""}
                        <Button 
                          variant="link" 
                          onClick={() => navigate("/asset-management/vit-inspection")}
                          className="px-1 py-0 h-auto font-normal"
                        >
                          create a new inspection
                        </Button>.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
