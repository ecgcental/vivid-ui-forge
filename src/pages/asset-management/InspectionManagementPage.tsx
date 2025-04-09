
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubstationInspectionData } from "@/lib/asset-types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Eye, FileText, Pencil, Trash2, Download } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function InspectionManagementPage() {
  const { user } = useAuth();
  const { savedInspections, deleteInspection } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter inspections based on search term
  const filteredInspections = savedInspections?.filter(inspection => 
    inspection.substationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.district.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleView = (id: string) => {
    navigate(`/asset-management/inspection-details/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/asset-management/edit-inspection/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inspection?")) {
      deleteInspection(id);
      toast.success("Inspection deleted successfully");
    }
  };

  const exportToPDF = (inspection: SubstationInspectionData) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Substation Inspection Report", 14, 20);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Substation: ${inspection.substationNo}`, 14, 30);
    doc.text(`Region: ${inspection.region}`, 14, 36);
    doc.text(`District: ${inspection.district}`, 14, 42);
    doc.text(`Date: ${format(new Date(inspection.date), "PPP")}`, 14, 48);
    doc.text(`Type: ${inspection.type}`, 14, 54);
    
    // Group items by category
    const itemsByCategory = inspection.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof inspection.items>);
    
    let yPos = 64;
    
    // Add items by category
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Add category title
      yPos += 10;
      doc.setFontSize(14);
      doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, yPos);
      yPos += 6;
      
      // Add table for this category
      // @ts-ignore - jsPDF types are not complete
      doc.autoTable({
        startY: yPos,
        head: [["Item", "Status", "Remarks"]],
        body: items.map(item => [
          item.name,
          item.status === "good" ? "Good" : "Bad",
          item.remarks || "-"
        ]),
        margin: { left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 70 }
        }
      });
      
      // @ts-ignore - jsPDF types are not complete
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Save PDF
    doc.save(`inspection-${inspection.substationNo}-${inspection.date}.pdf`);
  };

  const exportToCSV = (inspection: SubstationInspectionData) => {
    // Prepare CSV content
    const headers = ["Category", "Item", "Status", "Remarks"];
    const rows = inspection.items.map(item => [
      item.category,
      item.name,
      item.status,
      item.remarks
    ]);
    
    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inspection-${inspection.substationNo}-${inspection.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportAllToCSV = () => {
    if (!savedInspections || savedInspections.length === 0) {
      toast.error("No inspections to export");
      return;
    }
    
    // Prepare CSV content
    const headers = ["ID", "Date", "Region", "District", "Substation No", "Type", "Items Count", "Status Summary"];
    const rows = savedInspections.map(inspection => {
      const goodItems = inspection.items.filter(item => item.status === "good").length;
      const badItems = inspection.items.filter(item => item.status === "bad").length;
      const statusSummary = `${goodItems} good, ${badItems} bad`;
      
      return [
        inspection.id,
        inspection.date,
        inspection.region,
        inspection.district,
        inspection.substationNo,
        inspection.type,
        inspection.items.length,
        statusSummary
      ];
    });
    
    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `all-inspections-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Substation Inspections</h1>
          <div className="flex space-x-4">
            <Button 
              onClick={exportAllToCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export All to CSV
            </Button>
            <Button 
              onClick={() => navigate("/asset-management/substation-inspection")}
              variant="default"
            >
              New Inspection
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by substation number, region or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of all substation inspections</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Substation No</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status Summary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.length > 0 ? (
                filteredInspections.map((inspection) => {
                  const goodItems = inspection.items.filter(item => item.status === "good").length;
                  const badItems = inspection.items.filter(item => item.status === "bad").length;
                  
                  return (
                    <TableRow key={inspection.id}>
                      <TableCell>
                        {format(new Date(inspection.date), "PPP")}
                      </TableCell>
                      <TableCell className="font-medium">{inspection.substationNo}</TableCell>
                      <TableCell>{inspection.region}</TableCell>
                      <TableCell>{inspection.district}</TableCell>
                      <TableCell className="capitalize">{inspection.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {goodItems} good
                          </span>
                          {badItems > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {badItems} bad
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(inspection.id)}
                            title="View"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(inspection.id)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => exportToPDF(inspection)}
                            title="Export to PDF"
                          >
                            <FileText size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => exportToCSV(inspection)}
                            title="Export to CSV"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(inspection.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {searchTerm ? "No inspections found matching your search." : "No inspections have been saved yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
