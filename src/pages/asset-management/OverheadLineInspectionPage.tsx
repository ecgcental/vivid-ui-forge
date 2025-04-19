import { useState, useEffect, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OverheadLineInspectionForm } from "@/components/overhead-line/OverheadLineInspectionForm";
import { OverheadLineInspectionsTable } from "@/components/overhead-line/OverheadLineInspectionsTable";
import { PlusCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { OverheadLineInspection } from "@/lib/types";
import { OverheadLineInspectionDetails } from "@/components/overhead-line/OverheadLineInspectionDetails";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";

export default function OverheadLineInspectionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inspections");
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<OverheadLineInspection | null>(null);
  const [editingInspection, setEditingInspection] = useState<OverheadLineInspection | null>(null);
  const { overheadLineInspections, updateOverheadLineInspection, deleteOverheadLineInspection, addOverheadLineInspection, districts, regions } = useData();

  // Filter inspections based on user's role and assigned district/region
  const filteredInspections = useMemo(() => {
    if (!overheadLineInspections) return [];
    
    return overheadLineInspections.filter(inspection => {
      if (user?.role === 'district_engineer') {
        const userDistrict = districts.find(d => d.name === user.district);
        return userDistrict && inspection.districtId === userDistrict.id;
      } else if (user?.role === 'regional_engineer') {
        const userRegion = regions.find(r => r.name === user.region);
        return userRegion && inspection.regionId === userRegion.id;
      }
      return true; // Global engineers can see all inspections
    });
  }, [overheadLineInspections, user, districts, regions]);

  const handleAddInspection = () => {
    setEditingInspection(null);
    setIsInspectionFormOpen(true);
  };

  const handleInspectionFormClose = () => {
    setIsInspectionFormOpen(false);
    setEditingInspection(null);
  };

  const handleViewInspection = (inspection: OverheadLineInspection) => {
    setSelectedInspection(inspection);
    setIsDetailsDialogOpen(true);
  };

  const handleEditInspection = (inspection: OverheadLineInspection) => {
    setEditingInspection(inspection);
    setIsInspectionFormOpen(true);
  };

  const handleDeleteInspection = async (inspection: OverheadLineInspection) => {
    try {
      await deleteOverheadLineInspection(inspection.id);
      toast.success("Inspection deleted successfully");
    } catch (error) {
      toast.error("Failed to delete inspection");
    }
  };

  const handleFormSubmit = async (inspection: OverheadLineInspection) => {
    try {
      if (editingInspection) {
        await updateOverheadLineInspection(editingInspection.id, inspection);
        toast.success("Inspection updated successfully");
      } else {
        await addOverheadLineInspection(inspection);
        toast.success("Inspection created successfully");
      }
      setIsInspectionFormOpen(false);
      setEditingInspection(null);
    } catch (error) {
      toast.error(editingInspection ? "Failed to update inspection" : "Failed to create inspection");
    }
  };

  return (
    <AccessControlWrapper type="inspection">
      <Layout>
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Overhead Line Inspection</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor overhead line inspections
              </p>
            </div>
            {(user?.role === 'global_engineer' || user?.role === 'district_engineer' || user?.role === 'regional_engineer') && (
              <Button onClick={handleAddInspection} className="mt-4 md:mt-0">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Inspection
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="inspections">Inspection Records</TabsTrigger>
            </TabsList>

            <TabsContent value="inspections" className="space-y-4">
              <OverheadLineInspectionsTable 
                inspections={filteredInspections}
                onEdit={handleEditInspection}
                onDelete={handleDeleteInspection}
                onView={handleViewInspection}
                userRole={user?.role}
              />
            </TabsContent>
          </Tabs>

          {/* Inspection Form Sheet */}
          <Sheet open={isInspectionFormOpen} onOpenChange={setIsInspectionFormOpen}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingInspection ? "Edit Overhead Line Inspection" : "New Overhead Line Inspection"}
                </SheetTitle>
                <SheetDescription>
                  {editingInspection ? "Update the inspection details." : "Complete the inspection checklist for the overhead line."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <OverheadLineInspectionForm
                  inspection={editingInspection}
                  onSubmit={handleFormSubmit}
                  onCancel={handleInspectionFormClose}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Inspection Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Overhead Line Inspection Details</DialogTitle>
                <DialogDescription>
                  Inspection performed on {selectedInspection ? new Date(selectedInspection.createdAt).toLocaleDateString() : ""}
                </DialogDescription>
              </DialogHeader>
              {selectedInspection && <OverheadLineInspectionDetails inspection={selectedInspection} />}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
} 