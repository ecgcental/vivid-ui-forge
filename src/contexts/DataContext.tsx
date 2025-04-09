
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import mockRegionsData from "@/data/regions.json";
import mockDistrictsData from "@/data/districts.json";
import mockOP5FaultsData from "@/data/op5-faults.json";
import mockControlSystemOutagesData from "@/data/control-system-outages.json";
import mockVITAssetsData from "@/data/vit-assets.json";
import mockVITInspectionsData from "@/data/vit-inspections.json";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/sonner";
import {
  Region,
  District,
  OP5Fault,
  ControlSystemOutage,
  DataContextType,
  VITAsset,
  VITInspectionChecklist,
} from "@/lib/types";

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>([]);
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>([]);
  const [vitAssets, setVITAssets] = useState<VITAsset[]>([]);
  const [vitInspections, setVITInspections] = useState<VITInspectionChecklist[]>([]);

  // Initialize data from mock JSON
  useEffect(() => {
    // Load regions and link districts
    const loadedRegions: Region[] = mockRegionsData.map(region => ({
      ...region,
      districts: [],
    }));

    // Load districts and link to regions
    const loadedDistricts: District[] = mockDistrictsData;

    // Associate districts with regions
    loadedRegions.forEach(region => {
      region.districts = loadedDistricts.filter(district => district.regionId === region.id);
    });

    setRegions(loadedRegions);
    setDistricts(loadedDistricts);
    
    // Load fault data
    setOP5Faults(mockOP5FaultsData);
    setControlOutages(mockControlSystemOutagesData);
    
    // Load VIT assets and inspections
    setVITAssets(mockVITAssetsData);
    setVITInspections(mockVITInspectionsData);
  }, []);

  // Function to determine if user can edit a fault
  const canEditFault = (fault: OP5Fault | ControlSystemOutage): boolean => {
    if (!user) return false;

    // Global engineers can edit any fault
    if (user.role === "global_engineer") return true;

    // Regional engineers can only edit faults in their region
    if (user.role === "regional_engineer") {
      if (!user.region) return false;
      const faultRegion = regions.find(r => r.id === fault.regionId);
      return faultRegion?.name === user.region;
    }

    // District engineers can only edit faults in their district
    if (user.role === "district_engineer") {
      if (!user.district) return false;
      const faultDistrict = districts.find(d => d.id === fault.districtId);
      return faultDistrict?.name === user.district;
    }

    return false;
  };
  
  // CRUD functions for OP5 faults
  const addOP5Fault = (fault: Omit<OP5Fault, "id" | "status">) => {
    const newFault: OP5Fault = {
      ...fault,
      id: uuidv4(),
      status: "active",
    };
    
    setOP5Faults(prev => [...prev, newFault]);
    toast.success("OP5 Fault report submitted successfully");
  };

  // CRUD functions for Control System Outages
  const addControlOutage = (outage: Omit<ControlSystemOutage, "id" | "status">) => {
    const newOutage: ControlSystemOutage = {
      ...outage,
      id: uuidv4(),
      status: "active",
    };
    
    setControlOutages(prev => [...prev, newOutage]);
    toast.success("Control System Outage report submitted successfully");
  };

  // Function to resolve a fault (shared for both types)
  const resolveFault = (id: string, type: "op5" | "control") => {
    const currentDate = new Date().toISOString();
    
    if (type === "op5") {
      setOP5Faults(prev =>
        prev.map(fault =>
          fault.id === id
            ? { ...fault, status: "resolved", restorationDate: currentDate }
            : fault
        )
      );
    } else {
      setControlOutages(prev =>
        prev.map(outage =>
          outage.id === id
            ? { ...outage, status: "resolved", restorationDate: currentDate }
            : outage
        )
      );
    }
  };

  // Function to delete a fault
  const deleteFault = (id: string, type: "op5" | "control") => {
    if (type === "op5") {
      setOP5Faults(prev => prev.filter(fault => fault.id !== id));
    } else {
      setControlOutages(prev => prev.filter(outage => outage.id !== id));
    }
  };
  
  // CRUD functions for VIT assets
  const addVITAsset = (asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newAsset: VITAsset = {
      ...asset,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    setVITAssets(prev => [...prev, newAsset]);
    toast.success("VIT Asset added successfully");
  };
  
  const updateVITAsset = (id: string, asset: Partial<VITAsset>) => {
    setVITAssets(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...asset, updatedAt: new Date().toISOString() } 
          : item
      )
    );
    toast.success("VIT Asset updated successfully");
  };
  
  const deleteVITAsset = (id: string) => {
    // Delete the asset
    setVITAssets(prev => prev.filter(asset => asset.id !== id));
    
    // Delete associated inspections
    setVITInspections(prev => prev.filter(inspection => inspection.vitAssetId !== id));
    toast.success("VIT Asset deleted successfully");
  };
  
  // CRUD functions for VIT inspections
  const addVITInspection = (inspection: Omit<VITInspectionChecklist, "id">) => {
    const newInspection: VITInspectionChecklist = {
      ...inspection,
      id: uuidv4(),
    };
    
    setVITInspections(prev => [...prev, newInspection]);
    toast.success("VIT Inspection added successfully");
  };
  
  const updateVITInspection = (id: string, inspection: Partial<VITInspectionChecklist>) => {
    setVITInspections(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...inspection } 
          : item
      )
    );
    toast.success("VIT Inspection updated successfully");
  };
  
  const deleteVITInspection = (id: string) => {
    setVITInspections(prev => prev.filter(inspection => inspection.id !== id));
    toast.success("VIT Inspection deleted successfully");
  };

  return (
    <DataContext.Provider
      value={{
        regions,
        districts,
        op5Faults,
        controlOutages,
        vitAssets,
        vitInspections,
        addOP5Fault,
        addControlOutage,
        resolveFault,
        deleteFault,
        canEditFault,
        addVITAsset,
        updateVITAsset,
        deleteVITAsset,
        addVITInspection,
        updateVITInspection,
        deleteVITInspection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
