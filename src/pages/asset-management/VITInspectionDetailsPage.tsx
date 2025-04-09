import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Edit, MapPin, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { VITInspectionData } from "@/lib/asset-types";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function VITInspectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSavedVITInspection, deleteVITInspection } = useData();
  const [inspection, setInspection] = useState<VITInspectionData | null>(null);
  
  useEffect(() => {
    if (id) {
      const foundInspection = getSavedVITInspection(id);
      if (foundInspection) {
        setInspection(foundInspection);
      } else {
        toast.error("Inspection not found");
        navigate("/asset-management/vit-inspection-management");
      }
    }
  }, [id, getSavedVITInspection, navigate]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Handle delete inspection
  const handleDelete = () => {
    if (!id) return;
    
    if (confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
      deleteVITInspection(id);
      toast.success("VIT inspection deleted successfully");
      navigate("/asset-management/vit-inspection-management");
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!inspection) {
      toast.error("No inspection data to export");
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

  // View location on map
  const viewOnMap = () => {
    if (!inspection?.gpsLocation) {
      toast.error("No GPS coordinates available");
      return;
    }
    
    try {
      // Parse GPS coordinates (assuming format like "5.123456°N, -0.123456°W")
      const coords = inspection.gpsLocation.match(/([\d.-]+)°[NS],\s*([\d.-]+)°[EW]/);
      if (!coords || coords.length < 3) throw new Error("Invalid GPS format");
      
      const latitude = parseFloat(coords[1]);
      const longitude = parseFloat(coords[2]);
      
      // Open in Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
    } catch (error) {
      toast.error("Could not parse GPS coordinates");
    }
  };

  // Loading state
  if (!inspection) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center py-16">
            <p>Loading inspection details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/asset-management/vit-inspection-management")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">VIT Inspection Details</h1>
              <p className="text-muted-foreground mt-2">
                Viewing inspection report for {inspection.typeOfUnit} - {inspection.serialNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="default"
              onClick={() => navigate(`/asset-management/edit-vit-inspection/${id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 print:grid-cols-1">
          {/* Basic Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>VIT Information</CardTitle>
              <CardDescription>
                Basic details about the VIT unit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Region</dt>
                  <dd className="text-base">{inspection.region}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">District</dt>
                  <dd className="text-base">{inspection.district}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                  <dd className="text-base">{formatDate(inspection.date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Voltage Level</dt>
                  <dd className="text-base">{inspection.voltageLevel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Type of Unit</dt>
                  <dd className="text-base">{inspection.typeOfUnit}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Serial Number</dt>
                  <dd className="text-base">{inspection.serialNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="text-base">{inspection.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">GPS Location</dt>
                  <dd className="text-base flex items-center">
                    {inspection.gpsLocation} 
                    {inspection.gpsLocation && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2 h-6 w-6" 
                        onClick={viewOnMap}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="text-base">
                    <Badge 
                      className={
                        inspection.status === 'Operational' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : inspection.status === 'Under Maintenance'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {inspection.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Protection</dt>
                  <dd className="text-base">{inspection.protection}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Inspection Checklist */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>VIT Checklist</CardTitle>
              <CardDescription>
                Results of the inspection checklist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Item</TableHead>
                      <TableHead className="w-[20%]">Status</TableHead>
                      <TableHead className="w-[30%]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspection.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              item.status === 'yes' || item.status === 'good'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-sm text-muted-foreground print:hidden">
          <p>
            Created on {format(new Date(inspection.createdAt), 'dd MMMM yyyy')} 
            by {inspection.createdBy}
          </p>
        </div>
      </div>
    </Layout>
  );
}
