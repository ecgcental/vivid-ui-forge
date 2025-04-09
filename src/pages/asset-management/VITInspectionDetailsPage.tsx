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
import { ChevronLeft, Download, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { VITAsset, VITInspectionChecklist } from "@/lib/types";
import { formatDate } from "@/utils/calculations";

export default function VITInspectionDetailsPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { vitAssets, vitInspections, regions, districts, deleteVITInspection } = useData();
  
  const [asset, setAsset] = useState<VITAsset | null>(null);
  const [inspections, setInspections] = useState<VITInspectionChecklist[]>([]);
  
  useEffect(() => {
    if (assetId) {
      // Find the asset
      const foundAsset = vitAssets.find(a => a.id === assetId);
      if (foundAsset) {
        setAsset(foundAsset);
        
        // Find all inspections for this asset
        const assetInspections = vitInspections.filter(i => i.vitAssetId === assetId);
        setInspections(assetInspections);
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
    const inspection = vitInspections.find(i => i.id === inspectionId);
    if (inspection) {
      navigate(`/asset-management/edit-vit-inspection/${inspectionId}`);
    }
  };
  
  const handleDelete = (inspectionId: string) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      deleteVITInspection(inspectionId);
      // Update the local state to reflect the deletion
      setInspections(prev => prev.filter(i => i.id !== inspectionId));
      toast.success("Inspection record deleted successfully");
    }
  };
  
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
  
  if (!asset) {
    return (
      <Layout>
        <div className="container py-8">
          <p>Loading asset details...</p>
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
                                <Button variant="ghost" className="h-8 w-8 p-0">
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
