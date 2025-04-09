
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VITAssetsTable } from "@/components/vit/VITAssetsTable";
import { VITAssetForm } from "@/components/vit/VITAssetForm";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VITAsset } from "@/lib/types";
import { useNavigate } from "react-router-dom";

export default function VITInspectionPage() {
  const { vitAssets } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assets");
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<VITAsset | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
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
  
  const handleAssetFormClose = () => {
    setIsAssetFormOpen(false);
    setSelectedAsset(null);
  };
  
  const handleInspectionFormClose = () => {
    setIsInspectionFormOpen(false);
    setSelectedAssetId(null);
  };
  
  const handleViewInspections = (assetId: string) => {
    navigate(`/asset-management/vit-inspection-details/${assetId}`);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VITs Inspection</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor VIT assets and conduct inspections
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="assets">VIT Assets</TabsTrigger>
            <TabsTrigger value="inspections">Inspection Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assets" className="space-y-6">
            <VITAssetsTable 
              onAddAsset={handleAddAsset} 
              onEditAsset={handleEditAsset}
              onInspect={handleAddInspection}
            />
          </TabsContent>
          
          <TabsContent value="inspections">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold">View Inspection Records</h2>
                <p className="text-muted-foreground">
                  Select an asset from the Assets tab to view its inspection history, or click below to browse all inspections.
                </p>
              </div>
              <Button
                onClick={() => navigate("/asset-management/vit-inspection-management")}
                size="lg"
                className="mt-4"
              >
                Browse All Inspections
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Asset Form Sheet */}
        <Sheet open={isAssetFormOpen} onOpenChange={setIsAssetFormOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedAsset ? "Edit VIT Asset" : "Add New VIT Asset"}</SheetTitle>
              <SheetDescription>
                {selectedAsset 
                  ? "Update the information for this VIT asset" 
                  : "Fill in the details to add a new VIT asset"}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VITAssetForm 
                asset={selectedAsset || undefined} 
                onSubmit={handleAssetFormClose}
                onCancel={handleAssetFormClose}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Inspection Form Sheet */}
        <Sheet open={isInspectionFormOpen} onOpenChange={setIsInspectionFormOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Inspection</SheetTitle>
              <SheetDescription>
                Complete the inspection checklist for this VIT asset
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <VITInspectionForm 
                assetId={selectedAssetId || undefined}
                onSubmit={handleInspectionFormClose}
                onCancel={handleInspectionFormClose}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
