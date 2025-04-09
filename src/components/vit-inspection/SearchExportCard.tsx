
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DownloadIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { VITInspectionData } from "@/lib/asset-types";
import { format } from "date-fns";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface SearchExportCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredInspections: VITInspectionData[];
}

export const SearchExportCard = ({ 
  searchQuery, 
  setSearchQuery, 
  filteredInspections 
}: SearchExportCardProps) => {
  
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
  const exportToPDF = () => {
    if (filteredInspections.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Add header
    const doc = new jsPDF();
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
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
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
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
