
import { VITInspectionData } from "@/lib/asset-types";
import { format } from "date-fns";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

// Format date for display
export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (error) {
    return dateString;
  }
};

// Export individual VIT inspection to PDF
export const exportInspectionToPDF = (inspection: VITInspectionData | undefined) => {
  if (!inspection) {
    toast.error("Inspection not found");
    return;
  }
  
  const doc = new jsPDF();
  
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
};
