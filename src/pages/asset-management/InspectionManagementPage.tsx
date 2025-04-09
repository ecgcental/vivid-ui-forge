import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";
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

export default function InspectionManagementPage() {
  const { savedInspections, deleteInspection } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter inspections based on search query
  const filteredInspections = savedInspections.filter(inspection => {
    const searchText = searchQuery.toLowerCase();
    return (
      inspection.region.toLowerCase().includes(searchText) ||
      inspection.district.toLowerCase().includes(searchText) ||
      inspection.substationName.toLowerCase().includes(searchText) ||
      inspection.substationNo.toLowerCase().includes(searchText)
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
      deleteInspection(id);
      toast.success("Inspection deleted successfully");
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
      "ID", "Region", "District", "Date", "Substation No", "Substation Name",
      "Type", "Items", "Created At", "Created By"
    ];

    // Create CSV rows
    const rows = filteredInspections.map(inspection => [
      inspection.id,
      inspection.region,
      inspection.district,
      inspection.date,
      inspection.substationNo,
      inspection.substationName || "",
      inspection.type,
      inspection.items.length.toString(),
      inspection.createdAt,
      inspection.createdBy
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
    link.setAttribute('download', 'substation_inspections.csv');
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
      const inspection = savedInspections.find(insp => insp.id === id);
      if (!inspection) {
        toast.error("Inspection not found");
        return;
      }

      // Add header
      doc.setFontSize(18);
      doc.text("Substation Inspection Report", 105, 15, { align: "center" });

      // Add basic information
      doc.setFontSize(12);
      doc.text(`Region: ${inspection.region}`, 20, 30);
      doc.text(`District: ${inspection.district}`, 20, 37);
      doc.text(`Date: ${formatDate(inspection.date)}`, 20, 44);
      doc.text(`Substation No: ${inspection.substationNo}`, 20, 51);
      doc.text(`Substation Name: ${inspection.substationName || "-"}`, 20, 58);
      doc.text(`Type: ${inspection.type}`, 20, 65);

      // Add checklist items
      doc.setFontSize(14);
      doc.text("Inspection Checklist", 105, 80, { align: "center" });

      // Prepare data for table
      const tableData = inspection.items.map(item => [
        item.category,
        item.name,
        item.status.toUpperCase(),
        item.remarks || "-"
      ]);

      // Add table with items
      (doc as any).autoTable({
        startY: 90,
        head: [["Category", "Item", "Status", "Remarks"]],
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

      doc.save(`substation_inspection_${inspection.id}.pdf`);
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
      doc.text("Substation Inspections Summary Report", 105, 15, { align: "center" });

      // Prepare data for table
      const tableData = filteredInspections.map(inspection => [
        formatDate(inspection.date),
        inspection.region,
        inspection.district,
        inspection.substationNo,
        inspection.substationName || "-",
        inspection.type,
        inspection.items.length
      ]);

      // Add table with summary
      (doc as any).autoTable({
        startY: 25,
        head: [["Date", "Region", "District", "Substation No", "Substation Name", "Type", "Items"]],
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

      doc.save("substation_inspections_summary.pdf");
      toast.success("PDF generated successfully");
    }
  };

  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Substation Inspections Management</h1>
            <p className="text-muted-foreground mt-2">
              View, edit and manage all substation inspections
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/asset-management/substation-inspection")}>
              New Inspection
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
                  placeholder="Search by region, district, substation..."
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
            <CardTitle>Substation Inspections</CardTitle>
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
                    <TableHead>Substation No.</TableHead>
                    <TableHead>Substation Name</TableHead>
                    <TableHead>Type</TableHead>
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
                        <TableCell>{inspection.substationNo}</TableCell>
                        <TableCell>{inspection.substationName}</TableCell>
                        <TableCell>{inspection.type}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/asset-management/inspection-details/${inspection.id}`)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/asset-management/edit-inspection/${inspection.id}`)}
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
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No inspections found. {searchQuery ? "Try a different search term or " : ""}
                        <Button
                          variant="link"
                          onClick={() => navigate("/asset-management/substation-inspection")}
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
