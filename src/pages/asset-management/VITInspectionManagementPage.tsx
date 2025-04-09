
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { SearchExportCard } from "@/components/vit-inspection/SearchExportCard";
import { VITInspectionTable } from "@/components/vit-inspection/VITInspectionTable";

export default function VITInspectionManagementPage() {
  const { savedVITInspections, deleteVITInspection } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter inspections based on search query
  const filteredInspections = savedVITInspections.filter(inspection => {
    const searchText = searchQuery.toLowerCase();
    return (
      inspection.region.toLowerCase().includes(searchText) ||
      inspection.district.toLowerCase().includes(searchText) ||
      inspection.typeOfUnit.toLowerCase().includes(searchText) ||
      inspection.serialNumber.toLowerCase().includes(searchText) ||
      inspection.location.toLowerCase().includes(searchText)
    );
  });

  // Handle delete inspection
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inspection? This action cannot be undone.")) {
      deleteVITInspection(id);
    }
  };

  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VIT Inspections Management</h1>
            <p className="text-muted-foreground mt-2">
              View, edit and manage all VIT inspections
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/asset-management/vit-inspection")}>
              New VIT Inspection
            </Button>
          </div>
        </div>

        <SearchExportCard 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredInspections={filteredInspections}
        />

        <VITInspectionTable 
          filteredInspections={filteredInspections}
          handleDelete={handleDelete}
        />
      </div>
    </Layout>
  );
}
