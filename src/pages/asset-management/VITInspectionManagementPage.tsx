
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils/calculations";
import { useNavigate } from "react-router-dom";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { VITInspectionChecklist } from "@/lib/types";
import { ArrowLeft, CheckCircle2, Download, Edit, FileText, MoreHorizontal, Search, Trash2 } from "lucide-react";

export default function VITInspectionManagementPage() {
  const { vitInspections, vitAssets, regions, districts, deleteVITInspection } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filteredInspections, setFilteredInspections] = useState<VITInspectionChecklist[]>(vitInspections);
  
  const [isEditInspectionOpen, setIsEditInspectionOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VITInspectionChecklist | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState<VITInspectionChecklist | null>(null);
  
  // Filter inspections when search or filters change
  useEffect(() => {
    let filtered = [...vitInspections];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inspection => {
        const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
        return (
          asset?.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset?.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inspection.inspectedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply region filter
    if (filterRegion) {
      filtered = filtered.filter(inspection => {
        const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
        return asset?.regionId === filterRegion;
      });
    }
    
    // Apply district filter
    if (filterDistrict) {
      filtered = filtered.filter(inspection => {
        const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
        return asset?.districtId === filterDistrict;
      });
    }
    
    setFilteredInspections(filtered);
  }, [searchTerm, filterRegion, filterDistrict, vitInspections, vitAssets]);
  
  const getAssetDetails = (assetId: string) => {
    const asset = vitAssets.find(a => a.id === assetId);
    return asset || null;
  };

  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "Unknown";
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown";
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
  
  const handleViewDetails = (inspection: VITInspectionChecklist) => {
    const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
    if (asset) {
      navigate(`/asset-management/vit-inspection-details/${asset.id}`);
    }
  };
  
  const handleInspectionFormClose = () => {
    setIsEditInspectionOpen(false);
    setSelectedInspection(null);
  };
  
  const exportToCsv = () => {
    // Create headers
    const headers = [
      "Asset Serial",
      "Asset Type",
      "Region",
      "District",
      "Inspection Date",
      "Inspector",
      "Issues Count",
      "Remarks"
    ];
    
    // Create data rows
    const dataRows = filteredInspections.map(inspection => {
      const asset = getAssetDetails(inspection.vitAssetId);
      return [
        asset?.serialNumber || "N/A",
        asset?.typeOfUnit || "N/A",
        asset ? getRegionName(asset.regionId) : "N/A",
        asset ? getDistrictName(asset.districtId) : "N/A",
        formatDate(inspection.inspectionDate),
        inspection.inspectedBy,
        calculateIssueCount(inspection),
        inspection.remarks.replace(/,/g, ";") // Replace commas to avoid CSV issues
      ];
    });
    
    // Combine headers and data
    const csvContent = [headers.join(","), ...dataRows.map(row => row.join(","))].join("\n");
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vit-inspections-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inspection Records</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all VIT inspection records
            </p>
          </div>
          
          <Button 
            onClick={exportToCsv}
            className="mt-4 md:mt-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by serial number, location, inspector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterDistrict} onValueChange={setFilterDistrict} disabled={!filterRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Districts</SelectItem>
                  {filterRegion && districts
                    .filter(d => d.regionId === filterRegion)
                    .map(district => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Asset Serial</TableHead>
                <TableHead className="font-medium">Asset Type</TableHead>
                <TableHead className="font-medium">Region</TableHead>
                <TableHead className="font-medium">District</TableHead>
                <TableHead className="font-medium">Inspection Date</TableHead>
                <TableHead className="font-medium">Inspector</TableHead>
                <TableHead className="font-medium">Issues</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    {searchTerm || filterRegion || filterDistrict
                      ? "No inspection records match your search criteria"
                      : "No inspection records found. Add some to get started!"
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredInspections.map((inspection) => {
                  const asset = getAssetDetails(inspection.vitAssetId);
                  const issueCount = calculateIssueCount(inspection);
                  
                  return (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        {asset?.serialNumber || "N/A"}
                      </TableCell>
                      <TableCell>{asset?.typeOfUnit || "Unknown"}</TableCell>
                      <TableCell>
                        {asset ? getRegionName(asset.regionId) : "Unknown"}
                      </TableCell>
                      <TableCell>
                        {asset ? getDistrictName(asset.districtId) : "Unknown"}
                      </TableCell>
                      <TableCell>{formatDate(inspection.inspectionDate)}</TableCell>
                      <TableCell>{inspection.inspectedBy}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          issueCount === 0
                            ? "bg-green-100 text-green-800"
                            : issueCount < 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {issueCount} {issueCount === 1 ? "issue" : "issues"}
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(inspection)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Inspection Sheet */}
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
