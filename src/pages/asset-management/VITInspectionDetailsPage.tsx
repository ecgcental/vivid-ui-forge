
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { VITAsset, VITInspectionChecklist } from "@/lib/types";
import { formatDate } from "@/utils/calculations";
import { 
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, Clock, Download, Edit, 
  FileText, ListChecks, MoreHorizontal, Plus, Trash2 
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function VITInspectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { vitAssets, vitInspections, regions, districts, deleteVITInspection } = useData();
  const navigate = useNavigate();
  
  const [asset, setAsset] = useState<VITAsset | null>(null);
  const [inspections, setInspections] = useState<VITInspectionChecklist[]>([]);
  const [isAddInspectionOpen, setIsAddInspectionOpen] = useState(false);
  const [isEditInspectionOpen, setIsEditInspectionOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VITInspectionChecklist | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<VITInspectionChecklist | null>(null);
  
  useEffect(() => {
    if (id) {
      const foundAsset = vitAssets.find(a => a.id === id);
      if (foundAsset) {
        setAsset(foundAsset);
        
        const assetInspections = vitInspections.filter(i => i.vitAssetId === id);
        setInspections(assetInspections.sort((a, b) => 
          new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
        ));
      } else {
        navigate("/asset-management/vit-inspection");
      }
    }
  }, [id, vitAssets, vitInspections, navigate]);
  
  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "Unknown";
  };
  
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown";
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Under Maintenance":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Faulty":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Decommissioned":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    }
  };
  
  const calculateIssueCount = (inspection: VITInspectionChecklist) => {
    let count = 0;
    
    if (inspection.rodentTermiteEncroachment === "Yes") count++;
    if (inspection.cleanDustFree === "No") count++;
    if (inspection.protectionButtonEnabled === "No") count++;
    if (inspection.recloserButtonEnabled === "No") count++;
    if (inspection.groundEarthButtonEnabled === "No") count++;
    if (inspection.acPowerOn === "No") count++;
    if (inspection.batteryPowerLow === "Yes") count++;
    if (inspection.handleLockOn === "No") count++;
    if (inspection.remoteButtonEnabled === "No") count++;
    if (inspection.gasLevelLow === "Yes") count++;
    if (inspection.earthingArrangementAdequate === "No") count++;
    if (inspection.noFusesBlown === "No") count++;
    if (inspection.noDamageToBushings === "No") count++;
    if (inspection.noDamageToHVConnections === "No") count++;
    if (inspection.insulatorsClean === "No") count++;
    if (inspection.paintworkAdequate === "No") count++;
    if (inspection.ptFuseLinkIntact === "No") count++;
    if (inspection.noCorrosion === "No") count++;
    if (inspection.silicaGelCondition === "Bad") count++;
    if (inspection.correctLabelling === "No") count++;
    
    return count;
  };
  
  const handleAddInspection = () => {
    setIsAddInspectionOpen(true);
  };
  
  const handleInspectionFormClose = () => {
    setIsAddInspectionOpen(false);
    setIsEditInspectionOpen(false);
    setSelectedInspection(null);
  };
  
  const handleEditInspection = (inspection: VITInspectionChecklist) => {
    setSelectedInspection(inspection);
    setIsEditInspectionOpen(true);
  };
  
  const handleDeleteClick = (inspection: VITInspectionChecklist) => {
    setInspectionToDelete(inspection);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (inspectionToDelete) {
      deleteVITInspection(inspectionToDelete.id);
      setIsDeleteDialogOpen(false);
      setInspectionToDelete(null);
    }
  };
  
  const exportInspectionHistory = () => {
    if (!asset) return;
    
    // Create CSV data
    const headers = ["Inspection Date", "Inspector", "Issues Count", "Remarks"];
    
    const dataRows = inspections.map(inspection => [
      formatDate(inspection.inspectionDate),
      inspection.inspectedBy,
      calculateIssueCount(inspection).toString(),
      inspection.remarks.replace(/,/g, ";") // Replace commas to avoid CSV issues
    ]);
    
    const csvContent = [headers.join(","), ...dataRows.map(row => row.join(","))].join("\n");
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vit-inspections-${asset.serialNumber}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const generatePDFReport = () => {
    if (!asset || inspections.length === 0) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("VIT Asset Inspection Report", 14, 22);
    
    // Add asset info
    doc.setFontSize(12);
    doc.text(`Asset: ${asset.serialNumber} - ${asset.typeOfUnit}`, 14, 32);
    doc.text(`Location: ${asset.location}`, 14, 38);
    doc.text(`Voltage Level: ${asset.voltageLevel}`, 14, 44);
    doc.text(`Region: ${getRegionName(asset.regionId)}, District: ${getDistrictName(asset.districtId)}`, 14, 50);
    doc.text(`Status: ${asset.status}`, 14, 56);
    
    // Add latest inspection details
    const latestInspection = inspections[0];
    if (latestInspection) {
      doc.setFontSize(14);
      doc.text("Latest Inspection Summary", 14, 66);
      
      doc.setFontSize(12);
      doc.text(`Date: ${formatDate(latestInspection.inspectionDate)}`, 14, 74);
      doc.text(`Inspector: ${latestInspection.inspectedBy}`, 14, 80);
      doc.text(`Issues Found: ${calculateIssueCount(latestInspection)}`, 14, 86);
      
      // Add checklist results
      doc.setFontSize(14);
      doc.text("Inspection Checklist Results", 14, 96);
      
      const checklistItems = [
        { name: "Rodent/termite encroachments", value: latestInspection.rodentTermiteEncroachment, issue: latestInspection.rodentTermiteEncroachment === "Yes" },
        { name: "Clean and dust free compartments", value: latestInspection.cleanDustFree, issue: latestInspection.cleanDustFree === "No" },
        { name: "Protection button enabled", value: latestInspection.protectionButtonEnabled, issue: latestInspection.protectionButtonEnabled === "No" },
        { name: "Recloser button enabled", value: latestInspection.recloserButtonEnabled, issue: latestInspection.recloserButtonEnabled === "No" },
        { name: "GROUND/EARTH button enabled", value: latestInspection.groundEarthButtonEnabled, issue: latestInspection.groundEarthButtonEnabled === "No" },
        { name: "AC power ON", value: latestInspection.acPowerOn, issue: latestInspection.acPowerOn === "No" },
        { name: "Battery Power Low", value: latestInspection.batteryPowerLow, issue: latestInspection.batteryPowerLow === "Yes" },
        { name: "Handle Lock ON", value: latestInspection.handleLockOn, issue: latestInspection.handleLockOn === "No" },
        { name: "Remote button enabled", value: latestInspection.remoteButtonEnabled, issue: latestInspection.remoteButtonEnabled === "No" },
        { name: "Gas Level Low", value: latestInspection.gasLevelLow, issue: latestInspection.gasLevelLow === "Yes" },
        { name: "Earthing arrangement adequate", value: latestInspection.earthingArrangementAdequate, issue: latestInspection.earthingArrangementAdequate === "No" },
        { name: "No fuses blown in control cubicle", value: latestInspection.noFusesBlown, issue: latestInspection.noFusesBlown === "No" },
        { name: "No damage to bushings or insulators", value: latestInspection.noDamageToBushings, issue: latestInspection.noDamageToBushings === "No" },
        { name: "No damage to H.V. connections", value: latestInspection.noDamageToHVConnections, issue: latestInspection.noDamageToHVConnections === "No" },
        { name: "Insulators clean", value: latestInspection.insulatorsClean, issue: latestInspection.insulatorsClean === "No" },
        { name: "Paintwork adequate", value: latestInspection.paintworkAdequate, issue: latestInspection.paintworkAdequate === "No" },
        { name: "PT fuse link intact", value: latestInspection.ptFuseLinkIntact, issue: latestInspection.ptFuseLinkIntact === "No" },
        { name: "No corrosion on equipment", value: latestInspection.noCorrosion, issue: latestInspection.noCorrosion === "No" },
        { name: "Condition of silica gel", value: latestInspection.silicaGelCondition, issue: latestInspection.silicaGelCondition === "Bad" },
        { name: "Correct labelling and warning notices", value: latestInspection.correctLabelling, issue: latestInspection.correctLabelling === "No" }
      ];
      
      // Create checklist table
      doc.autoTable({
        startY: 100,
        head: [['Checklist Item', 'Status', 'Condition']],
        body: checklistItems.map(item => [
          item.name, 
          item.value,
          item.issue ? 'Issue' : 'OK'
        ]),
        headStyles: { fillColor: [41, 65, 148] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        rowPageBreak: 'auto',
        bodyStyles: { valign: 'middle' },
        styles: { cellPadding: 2 }
      });
      
      // Add remarks
      const finalY = (doc as any).lastAutoTable.finalY || 180;
      
      if (latestInspection.remarks) {
        doc.setFontSize(14);
        doc.text("Remarks", 14, finalY + 10);
        
        doc.setFontSize(12);
        const remarkLines = doc.splitTextToSize(latestInspection.remarks, 180);
        doc.text(remarkLines, 14, finalY + 20);
      }
      
      // Add inspection history table in new page if needed
      doc.addPage();
      
      doc.setFontSize(16);
      doc.text("Inspection History", 14, 20);
      
      doc.autoTable({
        startY: 30,
        head: [['Date', 'Inspector', 'Issues Found', 'Remarks']],
        body: inspections.map(inspection => [
          formatDate(inspection.inspectionDate),
          inspection.inspectedBy,
          calculateIssueCount(inspection).toString(),
          (inspection.remarks || "").substring(0, 50) + (inspection.remarks && inspection.remarks.length > 50 ? "..." : "")
        ]),
        headStyles: { fillColor: [41, 65, 148] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        rowPageBreak: 'auto',
        bodyStyles: { valign: 'middle' },
        styles: { cellPadding: 2 }
      });
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount} - Generated on ${new Date().toLocaleDateString()}`, 14, 290);
      doc.text("ECG Fault Master - VIT Inspection System", doc.internal.pageSize.getWidth() - 80, 290);
    }
    
    // Save PDF
    doc.save(`VIT-Report-${asset.serialNumber}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/asset-management/vit-inspection")} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to VIT Inspection
        </Button>
        
        {asset ? (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  {asset.serialNumber}
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </h1>
                <p className="text-muted-foreground mt-1">
                  {asset.typeOfUnit} - {asset.voltageLevel}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={exportInspectionHistory}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={generatePDFReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </Button>
                <Button variant="default" onClick={handleAddInspection}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Inspection
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="details">Asset Details</TabsTrigger>
                <TabsTrigger value="latest">Latest Inspection</TabsTrigger>
                <TabsTrigger value="history">Inspection History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>VIT Asset Information</CardTitle>
                    <CardDescription>
                      Detailed information about this VIT asset
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{asset.serialNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Type of Unit</p>
                        <p className="font-medium">{asset.typeOfUnit}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Voltage Level</p>
                        <p className="font-medium">{asset.voltageLevel}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Region</p>
                        <p className="font-medium">{getRegionName(asset.regionId)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">District</p>
                        <p className="font-medium">{getDistrictName(asset.districtId)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{asset.status}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{asset.location}</p>
                      </div>
                      
                      {asset.gpsCoordinates && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">GPS Coordinates</p>
                          <p className="font-medium">{asset.gpsCoordinates}</p>
                        </div>
                      )}
                      
                      {asset.protection && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Protection</p>
                          <p className="font-medium">{asset.protection}</p>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created At</p>
                        <p className="font-medium">{formatDate(asset.createdAt)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{formatDate(asset.updatedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Inspection Status</p>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {inspections.length} inspection{inspections.length !== 1 ? "s" : ""} recorded
                          </span>
                          <span className="text-muted-foreground">
                            {inspections.length > 0 
                              ? `(latest on ${formatDate(inspections[0].inspectionDate)})` 
                              : "(no inspections yet)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="latest">
                {inspections.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <CardTitle>Latest Inspection</CardTitle>
                          <CardDescription>
                            Performed on {formatDate(inspections[0].inspectionDate)} by {inspections[0].inspectedBy}
                          </CardDescription>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(inspections[0].inspectionDate).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <ListChecks className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Inspection Results</span>
                        </div>
                        
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          calculateIssueCount(inspections[0]) === 0
                            ? "bg-green-100 text-green-800"
                            : calculateIssueCount(inspections[0]) < 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {calculateIssueCount(inspections[0])} {calculateIssueCount(inspections[0]) === 1 ? "issue" : "issues"} found
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Cubicle and Protection</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Rodent/termite encroachments</span>
                              <Badge variant={inspections[0].rodentTermiteEncroachment === "Yes" ? "destructive" : "outline"}>
                                {inspections[0].rodentTermiteEncroachment}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Clean and dust free</span>
                              <Badge variant={inspections[0].cleanDustFree === "No" ? "destructive" : "outline"}>
                                {inspections[0].cleanDustFree}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Protection button enabled</span>
                              <Badge variant={inspections[0].protectionButtonEnabled === "No" ? "destructive" : "outline"}>
                                {inspections[0].protectionButtonEnabled}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Recloser button enabled</span>
                              <Badge variant={inspections[0].recloserButtonEnabled === "No" ? "destructive" : "outline"}>
                                {inspections[0].recloserButtonEnabled}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">GROUND/EARTH button enabled</span>
                              <Badge variant={inspections[0].groundEarthButtonEnabled === "No" ? "destructive" : "outline"}>
                                {inspections[0].groundEarthButtonEnabled}
                              </Badge>
                            </div>
                          </div>
                          
                          <h4 className="font-medium pt-2">Power and Controls</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">AC power ON</span>
                              <Badge variant={inspections[0].acPowerOn === "No" ? "destructive" : "outline"}>
                                {inspections[0].acPowerOn}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Battery Power Low</span>
                              <Badge variant={inspections[0].batteryPowerLow === "Yes" ? "destructive" : "outline"}>
                                {inspections[0].batteryPowerLow}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Handle Lock ON</span>
                              <Badge variant={inspections[0].handleLockOn === "No" ? "destructive" : "outline"}>
                                {inspections[0].handleLockOn}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Remote button enabled</span>
                              <Badge variant={inspections[0].remoteButtonEnabled === "No" ? "destructive" : "outline"}>
                                {inspections[0].remoteButtonEnabled}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Gas Level Low</span>
                              <Badge variant={inspections[0].gasLevelLow === "Yes" ? "destructive" : "outline"}>
                                {inspections[0].gasLevelLow}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Physical Condition</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Earthing arrangement adequate</span>
                              <Badge variant={inspections[0].earthingArrangementAdequate === "No" ? "destructive" : "outline"}>
                                {inspections[0].earthingArrangementAdequate}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No fuses blown in control cubicle</span>
                              <Badge variant={inspections[0].noFusesBlown === "No" ? "destructive" : "outline"}>
                                {inspections[0].noFusesBlown}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No damage to bushings or insulators</span>
                              <Badge variant={inspections[0].noDamageToBushings === "No" ? "destructive" : "outline"}>
                                {inspections[0].noDamageToBushings}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No damage to H.V. connections</span>
                              <Badge variant={inspections[0].noDamageToHVConnections === "No" ? "destructive" : "outline"}>
                                {inspections[0].noDamageToHVConnections}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Insulators clean</span>
                              <Badge variant={inspections[0].insulatorsClean === "No" ? "destructive" : "outline"}>
                                {inspections[0].insulatorsClean}
                              </Badge>
                            </div>
                          </div>
                          
                          <h4 className="font-medium pt-2">Maintenance Status</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Paintwork adequate</span>
                              <Badge variant={inspections[0].paintworkAdequate === "No" ? "destructive" : "outline"}>
                                {inspections[0].paintworkAdequate}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">PT fuse link intact</span>
                              <Badge variant={inspections[0].ptFuseLinkIntact === "No" ? "destructive" : "outline"}>
                                {inspections[0].ptFuseLinkIntact}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">No corrosion on equipment</span>
                              <Badge variant={inspections[0].noCorrosion === "No" ? "destructive" : "outline"}>
                                {inspections[0].noCorrosion}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Silica gel condition</span>
                              <Badge variant={inspections[0].silicaGelCondition === "Bad" ? "destructive" : "outline"}>
                                {inspections[0].silicaGelCondition}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Correct labelling</span>
                              <Badge variant={inspections[0].correctLabelling === "No" ? "destructive" : "outline"}>
                                {inspections[0].correctLabelling}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {inspections[0].remarks && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="font-medium">Remarks</h4>
                            <p className="text-sm whitespace-pre-line">{inspections[0].remarks}</p>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditInspection(inspections[0])}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit Inspection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Inspections Yet</CardTitle>
                      <CardDescription>
                        This asset doesn't have any inspection records
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground max-w-md">
                        No inspection records have been created for this asset yet. Click the button below to perform the first inspection.
                      </p>
                      <Button onClick={handleAddInspection} className="mt-6">
                        <Plus className="h-4 w-4 mr-2" />
                        New Inspection
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <CardTitle>Inspection History</CardTitle>
                        <CardDescription>
                          All recorded inspections for this asset
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-2 sm:mt-0"
                        onClick={handleAddInspection}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Inspection
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inspections.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          No inspection records found for this asset.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-medium">Inspection Date</TableHead>
                              <TableHead className="font-medium">Inspector</TableHead>
                              <TableHead className="font-medium">Issues Found</TableHead>
                              <TableHead className="font-medium">Remarks</TableHead>
                              <TableHead className="text-right font-medium">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inspections.map((inspection) => (
                              <TableRow key={inspection.id}>
                                <TableCell>
                                  {formatDate(inspection.inspectionDate)}
                                </TableCell>
                                <TableCell>{inspection.inspectedBy}</TableCell>
                                <TableCell>
                                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    calculateIssueCount(inspection) === 0
                                      ? "bg-green-100 text-green-800"
                                      : calculateIssueCount(inspection) < 5
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {calculateIssueCount(inspection)} {calculateIssueCount(inspection) === 1 ? "issue" : "issues"}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={inspection.remarks}>
                                  {inspection.remarks || "No remarks"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleEditInspection(inspection)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Inspection
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteClick(inspection)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Inspection
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Asset Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The VIT asset you're looking for could not be found.
              </p>
              <Button 
                onClick={() => navigate("/asset-management/vit-inspection")} 
                className="mt-4"
              >
                Return to VIT Inspection
              </Button>
            </div>
          </div>
        )}
        
        {/* Add/Edit Inspection Sheet */}
        <Sheet open={isAddInspectionOpen} onOpenChange={setIsAddInspectionOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Inspection</SheetTitle>
              <SheetDescription>
                Complete the inspection checklist for this VIT asset
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VITInspectionForm 
                assetId={asset?.id}
                onSubmit={handleInspectionFormClose}
                onCancel={handleInspectionFormClose}
              />
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet open={isEditInspectionOpen} onOpenChange={setIsEditInspectionOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Inspection</SheetTitle>
              <SheetDescription>
                Update the inspection details for this VIT asset
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {selectedInspection && (
                <VITInspectionForm
                  inspectionData={selectedInspection}
                  onSubmit={handleInspectionFormClose}
                  onCancel={handleInspectionFormClose}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this inspection record? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
