
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { VITAssetsTable } from "@/components/vit/VITAssetsTable";
import { VITAssetForm } from "@/components/vit/VITAssetForm";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PlusCircle, Database, ClipboardList } from "lucide-react";
import { VITAsset } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VITInspectionManagementPage() {
  const [activeTab, setActiveTab] = useState("assets");
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<VITAsset | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setIsAssetFormOpen(true);
  };

  const handleEditAsset = (asset: VITAsset) => {
    setSelectedAsset(asset);
    setIsAssetFormOpen(true);
  };

  const handleAddInspection = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsInspectionFormOpen(true);
  };

  const handleCloseAssetForm = () => {
    setIsAssetFormOpen(false);
    setSelectedAsset(null);
  };

  const handleCloseInspectionForm = () => {
    setIsInspectionFormOpen(false);
    setSelectedAssetId("");
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">VIT Inspection Management</h1>
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab("assets")}>
                <Database className="mr-2 h-4 w-4" />
                Assets
              </Button>
              <Button onClick={() => setActiveTab("inspections")}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Inspections
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="assets">Assets Management</TabsTrigger>
              <TabsTrigger value="inspections">Inspection Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="space-y-4">
              <VITAssetsTable 
                onAddAsset={handleAddAsset}
                onEditAsset={handleEditAsset}
                onInspect={handleAddInspection}
              />
              
              <Button
                onClick={handleAddAsset}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New VIT Asset
              </Button>
            </TabsContent>
            
            <TabsContent value="inspections" className="space-y-4">
              <InspectionRecordsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Asset Form Sheet */}
      <Sheet open={isAssetFormOpen} onOpenChange={setIsAssetFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedAsset ? "Edit VIT Asset" : "Add New VIT Asset"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VITAssetForm
              asset={selectedAsset ?? undefined}
              onSubmit={handleCloseAssetForm}
              onCancel={handleCloseAssetForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Inspection Form Sheet */}
      <Sheet open={isInspectionFormOpen} onOpenChange={setIsInspectionFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add VIT Inspection</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VITInspectionForm
              assetId={selectedAssetId}
              onSubmit={handleCloseInspectionForm}
              onCancel={handleCloseInspectionForm}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}

// Internal component for inspection records table
function InspectionRecordsTable() {
  const { vitInspections, vitAssets, regions, districts } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter inspections based on search term
  const filteredInspections = searchTerm 
    ? vitInspections.filter(inspection => {
        const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
        if (!asset) return false;
        
        const lowercaseSearch = searchTerm.toLowerCase();
        const region = regions.find(r => r.id === asset.regionId)?.name || "";
        const district = districts.find(d => d.id === asset.districtId)?.name || "";
        
        return (
          asset.serialNumber.toLowerCase().includes(lowercaseSearch) ||
          asset.location.toLowerCase().includes(lowercaseSearch) ||
          region.toLowerCase().includes(lowercaseSearch) ||
          district.toLowerCase().includes(lowercaseSearch) ||
          inspection.inspectedBy.toLowerCase().includes(lowercaseSearch)
        );
      })
    : vitInspections;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search inspections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md w-full max-w-xs"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No inspections found matching your search" : "No inspection records found"}
                </td>
              </tr>
            ) : (
              filteredInspections.map(inspection => {
                const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
                if (!asset) return null;
                
                const region = regions.find(r => r.id === asset.regionId)?.name || "Unknown";
                const district = districts.find(d => d.id === asset.districtId)?.name || "Unknown";
                
                // Count issues
                const issuesCount = Object.entries(inspection).reduce((count, [key, value]) => {
                  // Check only Yes/No fields for issues (Yes for negative fields, No for positive fields)
                  if (key === 'rodentTermiteEncroachment' && value === 'Yes') return count + 1;
                  if (key === 'batteryPowerLow' && value === 'Yes') return count + 1;
                  if (key === 'gasLevelLow' && value === 'Yes') return count + 1;
                  if (key === 'silicaGelCondition' && value === 'Bad') return count + 1;
                  
                  // All other boolean fields where "No" is an issue
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
                
                return (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inspection.inspectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inspection.inspectedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issuesCount > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {issuesCount} {issuesCount === 1 ? "issue" : "issues"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Select defaultValue="view">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View Details</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
