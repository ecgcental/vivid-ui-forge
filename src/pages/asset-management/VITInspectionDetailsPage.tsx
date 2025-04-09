
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ChevronLeft, Download, Edit, MoreHorizontal, Trash2, FileText } from "lucide-react";
import { VITAsset, VITInspectionChecklist } from "@/lib/types";
import { formatDate } from "@/utils/calculations";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Add type declaration for jsPDF with autotable extensions
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: any) => jsPDF;
  }
}

export default function VITInspectionDetailsPage() {
  const { id: assetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vitAssets, vitInspections, regions, districts, deleteVITInspection } = useData();
  
  const [asset, setAsset] = useState<VITAsset | null>(null);
  const [inspections, setInspections] = useState<VITInspectionChecklist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (assetId) {
      setLoading(true);
      // Find the asset
      const foundAsset = vitAssets.find(a => a.id === assetId);
      if (foundAsset) {
        setAsset(foundAsset);
        
        // Find all inspections for this asset
        const assetInspections = vitInspections.filter(i => i.vitAssetId === assetId);
        setInspections(assetInspections);
        setLoading(false);
      } else {
        toast.error("Asset not found");
        navigate("/asset-management/vit-inspection");
      }
    }
  }, [assetId, vitAssets, vitInspections, navigate]);
  
  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "Unknown";
  };
  
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown";
  };
  
  const handleEdit = (inspectionId: string) => {
    navigate(`/asset-management/edit-vit-inspection/${inspectionId}`);
  };
  
  const handleDelete = (inspectionId: string) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      deleteVITInspection(inspectionId);
      // Update the local state to reflect the deletion
      setInspections(prev => prev.filter(i => i.id !== inspectionId));
      toast.success("Inspection record deleted successfully");
    }
  };
  
  // Export to CSV function
  const exportToCsv = (inspection: VITInspectionChecklist) => {
    // Create headers
    const headers = [
      "Field",
      "Value"
    ];
    
    // Create data rows
    const dataRows = [
      ["Asset Serial Number", asset?.serialNumber || ""],
      ["Asset Type", asset?.typeOfUnit || ""],
      ["Region", asset ? getRegionName(asset.regionId) : ""],
      ["District", asset ? getDistrictName(asset.districtId) : ""],
      ["Inspection Date", formatDate(inspection.inspectionDate)],
      ["Inspector", inspection.inspectedBy],
      ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
      ["Clean & Dust Free", inspection.cleanDustFree],
      ["Protection Button Enabled", inspection.protectionButtonEnabled],
      ["Recloser Button Enabled", inspection.recloserButtonEnabled],
      ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
      ["AC Power On", inspection.acPowerOn],
      ["Battery Power Low", inspection.batteryPowerLow],
      ["Handle Lock On", inspection.handleLockOn],
      ["Remote Button Enabled", inspection.remoteButtonEnabled],
      ["Gas Level Low", inspection.gasLevelLow],
      ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
      ["No Fuses Blown", inspection.noFusesBlown],
      ["No Damage to Bushings", inspection.noDamageToBushings],
      ["No Damage to HV Connections", inspection.noDamageToHVConnections],
      ["Insulators Clean", inspection.insulatorsClean],
      ["Paintwork Adequate", inspection.paintworkAdequate],
      ["PT Fuse Link Intact", inspection.ptFuseLinkIntact],
      ["No Corrosion", inspection.noCorrosion],
      ["Silica Gel Condition", inspection.silicaGelCondition],
      ["Correct Labelling", inspection.correctLabelling],
      ["Remarks", inspection.remarks]
    ];
    
    // Combine headers and data
    const csvContent = [headers.join(","), ...dataRows.map(row => `"${row[0]}","${row[1]}"`).join("\n")].join("\n");
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vit-inspection-${asset?.serialNumber}-${inspection.inspectionDate.split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate comprehensive PDF report
  const exportToPDF = (inspection: VITInspectionChecklist) => {
    if (!asset) return;

    const region = getRegionName(asset.regionId);
    const district = getDistrictName(asset.districtId);
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title and logo
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("VIT Inspection Comprehensive Report", 14, 20);
    
    // Add date and inspector info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${formatDate(inspection.inspectionDate)}`, 14, 30);
    doc.text(`Inspector: ${inspection.inspectedBy}`, 14, 37);
    
    // Add asset information
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Asset Information", 14, 47);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Serial Number: ${asset.serialNumber}`, 14, 55);
    doc.text(`Type of Unit: ${asset.typeOfUnit}`, 14, 61);
    doc.text(`Voltage Level: ${asset.voltageLevel}`, 14, 67);
    doc.text(`Region: ${region}`, 114, 55);
    doc.text(`District: ${district}`, 114, 61);
    doc.text(`Location: ${asset.location}`, 114, 67);
    doc.text(`Status: ${asset.status}`, 114, 73);
    
    // Add inspection checklist - General Condition
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("General Condition", 14, 83);
    
    const generalConditionItems = [
      ["Item", "Status"],
      ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
      ["Clean and Dust Free", inspection.cleanDustFree],
      ["Silica Gel Condition", inspection.silicaGelCondition],
      ["No Corrosion", inspection.noCorrosion],
      ["Paintwork Adequate", inspection.paintworkAdequate]
    ];
    
    doc.autoTable({
      startY: 87,
      head: [generalConditionItems[0]],
      body: generalConditionItems.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 }
    });
    
    // Add inspection checklist - Operational Status
    let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 120;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Operational Status", 14, finalY + 10);
    
    const operationalItems = [
      ["Item", "Status"],
      ["Protection Button Enabled", inspection.protectionButtonEnabled],
      ["Recloser Button Enabled", inspection.recloserButtonEnabled],
      ["AC Power On", inspection.acPowerOn],
      ["Battery Power Low", inspection.batteryPowerLow],
      ["Remote Button Enabled", inspection.remoteButtonEnabled]
    ];
    
    doc.autoTable({
      startY: finalY + 14,
      head: [operationalItems[0]],
      body: operationalItems.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 }
    });
    
    // Add inspection checklist - Safety & Protection
    finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 160;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Safety & Protection", 14, finalY + 10);
    
    const safetyItems = [
      ["Item", "Status"],
      ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
      ["Handle Lock On", inspection.handleLockOn],
      ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
      ["Gas Level Low", inspection.gasLevelLow],
      ["Correct Labelling", inspection.correctLabelling]
    ];
    
    doc.autoTable({
      startY: finalY + 14,
      head: [safetyItems[0]],
      body: safetyItems.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 }
    });
    
    // Component Condition
    finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 200;
    
    // Check if we need a new page
    if (finalY > 220) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Component Condition", 14, finalY + 10);
    
    const componentItems = [
      ["Item", "Status"],
      ["No Fuses Blown", inspection.noFusesBlown],
      ["No Damage to Bushings", inspection.noDamageToBushings],
      ["No Damage to HV Connections", inspection.noDamageToHVConnections],
      ["Insulators Clean", inspection.insulatorsClean],
      ["PT Fuse Link Intact", inspection.ptFuseLinkIntact]
    ];
    
    doc.autoTable({
      startY: finalY + 14,
      head: [componentItems[0]],
      body: componentItems.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 }
    });
    
    // Remarks
    finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 240;
    
    if (inspection.remarks) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Remarks", 14, finalY + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(inspection.remarks, 14, finalY + 20, {
        maxWidth: 180
      });
    }
    
    // Summary of Issues
    const issuesCount = Object.entries(inspection).reduce((count, [key, value]) => {
      if (key === 'rodentTermiteEncroachment' && value === 'Yes') return count + 1;
      if (key === 'batteryPowerLow' && value === 'Yes') return count + 1;
      if (key === 'gasLevelLow' && value === 'Yes') return count + 1;
      if (key === 'silicaGelCondition' && value === 'Bad') return count + 1;
      
      if (
        ['cleanDustFree', 'protectionButtonEnabled', 'recloserButtonEnabled', 
         'groundEarthButtonEnabled', 'acPowerOn', 'handleLockOn', 'remoteButtonEnabled', 
         'earthingArrangementAdequate', 'noFusesBlown', 'noDamageToBushings', 
         'noDamageToHVConnections', 'insulatorsClean', 'paintworkAdequate', 
         'ptFuseLinkIntact', 'noCorrosion', 'correctLabelling'].includes(key) && 
        value === 'No'
      ) {
        return count + 1;
      }
      
      return count;
    }, 0);
    
    // Add a new page if needed
    if ((finalY + (inspection.remarks ? 30 : 0)) > 240) {
      doc.addPage();
      finalY = 20;
    } else {
      finalY = finalY + (inspection.remarks ? 40 : 10);
    }
    
    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Inspection Summary", 14, finalY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total issues found: ${issuesCount}`, 14, finalY + 20);
    doc.text(`Overall assessment: ${issuesCount === 0 ? 'No issues found' : issuesCount < 3 ? 'Minor issues found' : issuesCount < 7 ? 'Moderate issues found' : 'Major issues found'}`, 14, finalY + 30);
    
    // Add timestamp and page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save PDF
    const filename = `vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`;
    doc.save(filename);
    toast.success("Comprehensive report generated successfully");
  };
  
  if (loading || !asset) {
    return (
      <Layout>
        <div className="container py-8">
          <p className="text-center">Loading asset details...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/asset-management/vit-inspection")} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to VIT Inspection
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VIT Asset Details</h1>
            <p className="text-muted-foreground mt-1">
              View asset information and inspection history
            </p>
          </div>
          
          <Button 
            onClick={() => navigate(`/asset-management/vit-inspection-form/${asset.id}`)}
            className="mt-4 md:mt-0"
          >
            New Inspection
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Asset Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                    <p className="text-base">{asset.serialNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type of Unit</p>
                    <p className="text-base">{asset.typeOfUnit}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Voltage Level</p>
                    <p className="text-base">{asset.voltageLevel}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Region</p>
                    <p className="text-base">{getRegionName(asset.regionId)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">District</p>
                    <p className="text-base">{getDistrictName(asset.districtId)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-base">{asset.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GPS Coordinates</p>
                    <p className="text-base">{asset.gpsCoordinates}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-base">{asset.status}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Protection</p>
                    <p className="text-base">{asset.protection}</p>
                  </div>
                </div>
                
                {asset.photoUrl && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Asset Photo</p>
                    <img 
                      src={asset.photoUrl} 
                      alt={`${asset.typeOfUnit} - ${asset.serialNumber}`}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Inspection History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Inspection History</h2>
                
                {inspections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No inspection records found for this asset.</p>
                    <Button 
                      onClick={() => navigate(`/asset-management/vit-inspection-form/${asset.id}`)}
                      className="mt-4"
                    >
                      Conduct First Inspection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inspections.map((inspection) => (
                      <div key={inspection.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">
                              Inspection on {formatDate(inspection.inspectionDate)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Conducted by {inspection.inspectedBy}
                            </p>
                          </div>
                          
                          <div className="mt-2 md:mt-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(inspection.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportToCsv(inspection)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Export to CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportToPDF(inspection)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Export to PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDelete(inspection.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">General Condition</h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-sm">Rodent/Termite Encroachment</span>
                                <span className={`text-sm font-medium ${
                                  inspection.rodentTermiteEncroachment === "No" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.rodentTermiteEncroachment}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Clean & Dust Free</span>
                                <span className={`text-sm font-medium ${
                                  inspection.cleanDustFree === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.cleanDustFree}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Silica Gel Condition</span>
                                <span className={`text-sm font-medium ${
                                  inspection.silicaGelCondition === "Good" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.silicaGelCondition}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">No Corrosion</span>
                                <span className={`text-sm font-medium ${
                                  inspection.noCorrosion === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.noCorrosion}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Paintwork Adequate</span>
                                <span className={`text-sm font-medium ${
                                  inspection.paintworkAdequate === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.paintworkAdequate}
                                </span>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Operational Status</h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-sm">Protection Button Enabled</span>
                                <span className={`text-sm font-medium ${
                                  inspection.protectionButtonEnabled === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.protectionButtonEnabled}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Recloser Button Enabled</span>
                                <span className={`text-sm font-medium ${
                                  inspection.recloserButtonEnabled === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.recloserButtonEnabled}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">AC Power On</span>
                                <span className={`text-sm font-medium ${
                                  inspection.acPowerOn === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.acPowerOn}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Battery Power Low</span>
                                <span className={`text-sm font-medium ${
                                  inspection.batteryPowerLow === "No" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.batteryPowerLow}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Remote Button Enabled</span>
                                <span className={`text-sm font-medium ${
                                  inspection.remoteButtonEnabled === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.remoteButtonEnabled}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Safety & Protection</h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-sm">Ground/Earth Button Enabled</span>
                                <span className={`text-sm font-medium ${
                                  inspection.groundEarthButtonEnabled === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.groundEarthButtonEnabled}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Handle Lock On</span>
                                <span className={`text-sm font-medium ${
                                  inspection.handleLockOn === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.handleLockOn}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Earthing Arrangement Adequate</span>
                                <span className={`text-sm font-medium ${
                                  inspection.earthingArrangementAdequate === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.earthingArrangementAdequate}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Gas Level Low</span>
                                <span className={`text-sm font-medium ${
                                  inspection.gasLevelLow === "No" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.gasLevelLow}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Correct Labelling</span>
                                <span className={`text-sm font-medium ${
                                  inspection.correctLabelling === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.correctLabelling}
                                </span>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Component Condition</h4>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-sm">No Fuses Blown</span>
                                <span className={`text-sm font-medium ${
                                  inspection.noFusesBlown === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.noFusesBlown}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">No Damage to Bushings</span>
                                <span className={`text-sm font-medium ${
                                  inspection.noDamageToBushings === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.noDamageToBushings}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">No Damage to HV Connections</span>
                                <span className={`text-sm font-medium ${
                                  inspection.noDamageToHVConnections === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.noDamageToHVConnections}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">Insulators Clean</span>
                                <span className={`text-sm font-medium ${
                                  inspection.insulatorsClean === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.insulatorsClean}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-sm">PT Fuse Link Intact</span>
                                <span className={`text-sm font-medium ${
                                  inspection.ptFuseLinkIntact === "Yes" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {inspection.ptFuseLinkIntact}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        {inspection.remarks && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Remarks</h4>
                            <p className="text-sm bg-gray-50 p-3 rounded-md">{inspection.remarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
