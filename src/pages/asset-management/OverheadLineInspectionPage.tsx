import { useState } from "react";
import { useData } from "@/contexts/DataContext";
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

export default function OverheadLineInspectionPage() {
  const [activeTab, setActiveTab] = useState("inspections");
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<OverheadLineInspection | null>(null);
  const [editingInspection, setEditingInspection] = useState<OverheadLineInspection | null>(null);
  const { overheadLineInspections, updateOverheadLineInspection, deleteOverheadLineInspection, addOverheadLineInspection } = useData();

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
      deleteOverheadLineInspection(inspection.id);
      toast.success("Inspection deleted successfully");
    } catch (error) {
      toast.error("Failed to delete inspection");
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overhead Line Inspection</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor overhead line inspections
            </p>
          </div>
          <Button onClick={handleAddInspection} className="mt-4 md:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-1">
            <TabsTrigger value="inspections">Inspection Records</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections" className="space-y-4">
            <OverheadLineInspectionsTable 
              inspections={overheadLineInspections || []}
              onEdit={handleEditInspection}
              onDelete={handleDeleteInspection}
              onView={handleViewInspection}
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
                onSubmit={(updatedInspection) => {
                  if (editingInspection) {
                    updateOverheadLineInspection(editingInspection.id, updatedInspection);
                  } else {
                    addOverheadLineInspection(updatedInspection);
                  }
                  setIsInspectionFormOpen(false);
                  setEditingInspection(null);
                }}
                onCancel={() => {
                  setIsInspectionFormOpen(false);
                  setEditingInspection(null);
                }}
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
  );
} 