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
  VoltageLevel,
  VITStatus,
  YesNoOption,
  GoodBadOption,
  SubstationInspection,
  FaultType,
  InspectionItem
} from "@/lib/types";

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>([]);
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>([]);
  const [vitAssets, setVITAssets] = useState<VITAsset[]>(() => {
    const saved = localStorage.getItem('vitAssets');
    return saved ? JSON.parse(saved) : mockVITAssetsData.map(asset => ({
      ...asset,
      voltageLevel: asset.voltageLevel as VoltageLevel,
      status: asset.status as VITStatus
    }));
  });
  const [vitInspections, setVITInspections] = useState<VITInspectionChecklist[]>(() => {
    const saved = localStorage.getItem('vitInspections');
    return saved ? JSON.parse(saved) : mockVITInspectionsData.map(inspection => ({
      ...inspection,
      rodentTermiteEncroachment: inspection.rodentTermiteEncroachment as YesNoOption,
      cleanDustFree: inspection.cleanDustFree as YesNoOption,
      protectionButtonEnabled: inspection.protectionButtonEnabled as YesNoOption,
      recloserButtonEnabled: inspection.recloserButtonEnabled as YesNoOption,
      groundEarthButtonEnabled: inspection.groundEarthButtonEnabled as YesNoOption,
      acPowerOn: inspection.acPowerOn as YesNoOption,
      batteryPowerLow: inspection.batteryPowerLow as YesNoOption,
      handleLockOn: inspection.handleLockOn as YesNoOption,
      remoteButtonEnabled: inspection.remoteButtonEnabled as YesNoOption,
      gasLevelLow: inspection.gasLevelLow as YesNoOption,
      earthingArrangementAdequate: inspection.earthingArrangementAdequate as YesNoOption,
      noFusesBlown: inspection.noFusesBlown as YesNoOption,
      noDamageToBushings: inspection.noDamageToBushings as YesNoOption,
      noDamageToHVConnections: inspection.noDamageToHVConnections as YesNoOption,
      insulatorsClean: inspection.insulatorsClean as YesNoOption,
      paintworkAdequate: inspection.paintworkAdequate as YesNoOption,
      ptFuseLinkIntact: inspection.ptFuseLinkIntact as YesNoOption,
      noCorrosion: inspection.noCorrosion as YesNoOption,
      silicaGelCondition: inspection.silicaGelCondition as GoodBadOption,
      correctLabelling: inspection.correctLabelling as YesNoOption
    }));
  });
  const [savedInspections, setSavedInspections] = useState<SubstationInspection[]>(() => {
    const saved = localStorage.getItem('savedInspections');
    return saved ? JSON.parse(saved) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedInspections', JSON.stringify(savedInspections));
  }, [savedInspections]);

  useEffect(() => {
    localStorage.setItem('vitAssets', JSON.stringify(vitAssets));
  }, [vitAssets]);

  useEffect(() => {
    localStorage.setItem('vitInspections', JSON.stringify(vitInspections));
  }, [vitInspections]);

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
    
    // Load fault data with proper type casting
    setOP5Faults(mockOP5FaultsData.map(fault => ({
      ...fault,
      faultType: fault.faultType as FaultType,
      status: fault.status as "active" | "resolved",
      createdBy: "System",
      createdAt: new Date().toISOString()
    })));
    
    setControlOutages(mockControlSystemOutagesData.map(outage => ({
      ...outage,
      faultType: outage.faultType as FaultType,
      status: outage.status as "active" | "resolved",
      createdBy: "System",
      createdAt: new Date().toISOString()
    })));
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
  
  // Function to get filtered faults
  const getFilteredFaults = (regionId?: string, districtId?: string) => {
    let filteredOP5 = op5Faults;
    let filteredControl = controlOutages;
    
    if (regionId) {
      filteredOP5 = filteredOP5.filter(fault => fault.regionId === regionId);
      filteredControl = filteredControl.filter(outage => outage.regionId === regionId);
    }
    
    if (districtId) {
      filteredOP5 = filteredOP5.filter(fault => fault.districtId === districtId);
      filteredControl = filteredControl.filter(outage => outage.districtId === districtId);
    }
    
    return { op5Faults: filteredOP5, controlOutages: filteredControl };
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

  // Update district function
  const updateDistrict = (id: string, updates: Partial<District>) => {
    setDistricts(prev => 
      prev.map(district => 
        district.id === id
          ? { ...district, ...updates }
          : district
      )
    );
    toast.success("District information updated successfully");
  };

  // Functions for substation inspections
  const saveInspection = (data: Omit<SubstationInspection, "id">) => {
    const newInspection: SubstationInspection = {
      ...data,
      id: uuidv4()
    };
    
    setSavedInspections(prev => [...prev, newInspection]);
    toast.success("Inspection saved successfully");
    return newInspection.id;
  };

  const getSavedInspection = (id: string) => {
    return savedInspections.find(inspection => inspection.id === id);
  };

  const updateInspection = (id: string, data: Partial<SubstationInspection>) => {
    setSavedInspections(prev => 
      prev.map(item => 
        item.id === id
          ? { ...item, ...data }
          : item
      )
    );
    toast.success("Inspection updated successfully");
  };

  const deleteInspection = (id: string) => {
    setSavedInspections(prev => prev.filter(item => item.id !== id));
    toast.success("Inspection deleted successfully");
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
        savedInspections,
        addOP5Fault,
        addControlOutage,
        resolveFault,
        deleteFault,
        canEditFault,
        getFilteredFaults,
        addVITAsset,
        updateVITAsset,
        deleteVITAsset,
        addVITInspection,
        updateVITInspection,
        deleteVITInspection,
        updateDistrict,
        saveInspection,
        getSavedInspection,
        updateInspection,
        deleteInspection
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
