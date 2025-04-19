import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import mockRegionsData from "@/data/regions.json";
import mockDistrictsData from "@/data/districts.json";
import mockOP5FaultsData from "@/data/op5-faults.json";
import mockControlSystemOutagesData from "@/data/control-system-outages.json";
import mockVITAssetsData from "@/data/vit-assets.json";
import mockVITInspectionsData from "@/data/vit-inspections.json";
import mockOverheadLineInspectionsData from "@/data/overhead-line-inspections.json";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/sonner";
import {
  Region,
  District,
  OP5Fault,
  ControlSystemOutage,
  VITAsset,
  VITInspectionChecklist,
  VoltageLevel,
  VITStatus,
  YesNoOption,
  GoodBadOption,
  SubstationInspection,
  FaultType,
  InspectionItem,
  Inspection,
  AffectedPopulation,
  ReliabilityIndices,
  OverheadLineInspection
} from "@/lib/types";
import { LoadMonitoringData } from "@/lib/asset-types";
import { calculateUnservedEnergy, calculateOutageDuration, calculateMTTR } from "@/utils/calculations";

export interface DataContextType {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  regions: Region[];
  districts: District[];
  setOP5Faults: React.Dispatch<React.SetStateAction<OP5Fault[]>>;
  setControlOutages: React.Dispatch<React.SetStateAction<ControlSystemOutage[]>>;
  setRegions: React.Dispatch<React.SetStateAction<Region[]>>;
  setDistricts: React.Dispatch<React.SetStateAction<District[]>>;
  resolveFault: (id: string, isOP5: boolean) => void;
  deleteFault: (id: string, isOP5: boolean) => void;
  updateOP5Fault: (id: string, data: Partial<OP5Fault>) => void;
  updateControlOutage: (id: string, data: Partial<ControlSystemOutage>) => void;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  vitAssets: VITAsset[];
  setVITAssets: React.Dispatch<React.SetStateAction<VITAsset[]>>;
  vitInspections: VITInspectionChecklist[];
  setVITInspections: React.Dispatch<React.SetStateAction<VITInspectionChecklist[]>>;
  savedInspections: SubstationInspection[];
  setSavedInspections: React.Dispatch<React.SetStateAction<SubstationInspection[]>>;
  loadMonitoringRecords?: LoadMonitoringData[];
  setLoadMonitoringRecords: React.Dispatch<React.SetStateAction<LoadMonitoringData[] | undefined>>;
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "status">) => void;
  deleteOP5Fault: (id: string) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "status">) => void;
  deleteControlOutage: (id: string) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => { op5Faults: OP5Fault[]; controlOutages: ControlSystemOutage[] };
  addVITAsset: (asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt">) => void;
  updateVITAsset: (id: string, updates: Partial<VITAsset>) => void;
  deleteVITAsset: (id: string) => void;
  addVITInspection: (inspection: Omit<VITInspectionChecklist, "id">) => void;
  updateVITInspection: (id: string, inspection: Partial<VITInspectionChecklist>) => void;
  deleteVITInspection: (id: string) => void;
  updateDistrict: (id: string, updates: Partial<District>) => void;
  saveInspection: (data: Omit<SubstationInspection, "id">) => string;
  getSavedInspection: (id: string) => SubstationInspection | undefined;
  updateSubstationInspection: (id: string, data: Partial<SubstationInspection>) => void;
  deleteInspection: (id: string) => void;
  saveLoadMonitoringRecord: (data: Omit<LoadMonitoringData, "id">) => string;
  getLoadMonitoringRecord: (id: string) => LoadMonitoringData | undefined;
  updateLoadMonitoringRecord: (id: string, data: Partial<LoadMonitoringData>) => void;
  deleteLoadMonitoringRecord: (id: string) => void;
  canEditAsset: (asset: VITAsset) => boolean;
  canEditInspection: (inspection: VITInspectionChecklist | SubstationInspection) => boolean;
  canAddAsset: (regionId: string, districtId: string) => boolean;
  canAddInspection: (assetId?: string, regionId?: string, districtId?: string) => boolean;
  canResolveFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  canEditOutage: (outage: ControlSystemOutage) => boolean;
  canDeleteFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  canDeleteOutage: (outage: ControlSystemOutage) => boolean;
  canDeleteAsset: (asset: VITAsset) => boolean;
  canDeleteInspection: (inspection: VITInspectionChecklist | SubstationInspection) => boolean;
  canEditLoadMonitoring: (record: LoadMonitoringData) => boolean;
  canDeleteLoadMonitoring: (record: LoadMonitoringData) => boolean;
  getOP5FaultById: (id: string) => OP5Fault | undefined;
  overheadLineInspections: OverheadLineInspection[];
  addOverheadLineInspection: (inspection: Omit<OverheadLineInspection, "id" | "createdAt" | "updatedAt">) => void;
  updateOverheadLineInspection: (id: string, updates: Partial<OverheadLineInspection>) => void;
  deleteOverheadLineInspection: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('regions');
    if (saved) return JSON.parse(saved);
    
    return mockRegionsData.map(region => ({
      ...region,
      districts: mockDistrictsData.filter(d => d.regionId === region.id)
    }));
  });
  
  const [districts, setDistricts] = useState<District[]>(() => {
    const saved = localStorage.getItem('districts');
    if (saved) return JSON.parse(saved);
    
    return mockDistrictsData.map(district => ({
      ...district,
      population: district.population || { rural: 10000, urban: 50000, metro: 200000 }
    }));
  });

  // Save regions and districts to localStorage
  useEffect(() => {
    localStorage.setItem('regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('districts', JSON.stringify(districts));
  }, [districts]);

  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>(() => {
    try {
      const saved = localStorage.getItem('op5Faults');
      if (saved) return JSON.parse(saved);

      // If loading from mock data, ensure all properties are present
      return mockOP5FaultsData.map(fault => ({
        id: fault.id,
        regionId: fault.regionId,
        districtId: fault.districtId,
        occurrenceDate: new Date().toISOString(), // Or use fault.occurrenceDate if valid
        restorationDate: null,
        repairDate: null, // Added missing property
        faultType: fault.faultType as FaultType,
        specificFaultType: "", // Added missing property (default empty)
        faultLocation: fault.substationNumber, // Or use fault.faultLocation if available
        status: "active",
        affectedPopulation: fault.affectedPopulation || { rural: 0, urban: 0, metro: 0 },
        mttr: 0, // Added missing property (default 0)
        reliabilityIndices: fault.reliabilityIndices || { saidi: 0, saifi: 0, caidi: 0 },
        createdBy: fault.createdBy,
        createdAt: fault.createdAt || new Date().toISOString() // Use existing or new
      }));
    } catch (error) { 
      console.error("Error loading op5Faults from localStorage:", error); 
      return []; // Return empty array on error
    }
  });
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>(() => {
    const saved = localStorage.getItem('controlOutages');
    return saved ? JSON.parse(saved) : [];
  });
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
  const [loadMonitoringRecords, setLoadMonitoringRecords] = useState<LoadMonitoringData[] | undefined>(() => {
    try {
      const saved = localStorage.getItem('loadMonitoringRecords');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error("Error loading loadMonitoringRecords from localStorage:", error);
      return [];
    }
  });
  const [overheadLineInspections, setOverheadLineInspections] = useState<OverheadLineInspection[]>(() => {
    const saved = localStorage.getItem('overheadLineInspections');
    return saved ? JSON.parse(saved) : mockOverheadLineInspectionsData;
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('op5Faults', JSON.stringify(op5Faults));
  }, [op5Faults]);

  useEffect(() => {
    localStorage.setItem('controlOutages', JSON.stringify(controlOutages));
  }, [controlOutages]);

  useEffect(() => {
    localStorage.setItem('savedInspections', JSON.stringify(savedInspections));
  }, [savedInspections]);

  useEffect(() => {
    localStorage.setItem('vitAssets', JSON.stringify(vitAssets));
  }, [vitAssets]);

  useEffect(() => {
    localStorage.setItem('vitInspections', JSON.stringify(vitInspections));
  }, [vitInspections]);

  useEffect(() => {
    localStorage.setItem('loadMonitoringRecords', JSON.stringify(loadMonitoringRecords));
  }, [loadMonitoringRecords]);

  useEffect(() => {
    localStorage.setItem('overheadLineInspections', JSON.stringify(overheadLineInspections));
  }, [overheadLineInspections]);

  // Initialize data from mock JSON only if no data exists in localStorage
  useEffect(() => {
    // Only initialize if no data exists
    if (op5Faults.length === 0 && controlOutages.length === 0) {
      // Load regions and link districts
      const loadedDistricts: District[] = mockDistrictsData.map(district => ({
        ...district,
        population: {
          rural: 10000,
          urban: 50000,
          metro: 200000
        }
      }));
      
      const loadedRegions: Region[] = mockRegionsData.map(region => ({
        ...region,
        districts: loadedDistricts.filter(d => d.regionId === region.id)
      }));
      
      setRegions(loadedRegions);
      setDistricts(loadedDistricts);
      
      // Load faults and outages with proper type casting
      setOP5Faults(mockOP5FaultsData.map(fault => ({
        id: fault.id,
        regionId: fault.regionId,
        districtId: fault.districtId,
        occurrenceDate: new Date().toISOString(),
        restorationDate: null,
        faultType: fault.faultType as FaultType,
        faultLocation: fault.substationNumber,
        status: "active",
        affectedPopulation: fault.affectedPopulation,
        reliabilityIndices: fault.reliabilityIndices,
        createdBy: fault.createdBy,
        createdAt: fault.createdAt
      })));
      
      setControlOutages(mockControlSystemOutagesData.map(outage => ({
        id: outage.id,
        regionId: outage.regionId,
        districtId: outage.districtId,
        occurrenceDate: new Date().toISOString(),
        restorationDate: null,
        faultType: outage.faultType as FaultType,
        status: "active",
        loadMW: outage.loadMW,
        unservedEnergyMWh: outage.unservedEnergyMWh,
        customersAffected: outage.customersAffected,
        createdBy: outage.createdBy,
        createdAt: outage.createdAt
      })));
    }
  }, []);

  // Function to get filtered faults
  const getFilteredFaults = (regionId?: string, districtId?: string) => {
    if (!user) {
      return { op5Faults: [], controlOutages: [] };
    }

    let filteredOP5Faults = [...op5Faults];
    let filteredControlOutages = [...controlOutages];

    // Apply role-based filtering
    if (user.role === "district_engineer") {
      // District engineers can only see faults in their district
      filteredOP5Faults = filteredOP5Faults.filter(fault => 
        fault.districtId === districts.find(d => d.name === user.district)?.id
      );
      filteredControlOutages = filteredControlOutages.filter(outage => 
        outage.districtId === districts.find(d => d.name === user.district)?.id
      );
    } else if (user.role === "regional_engineer") {
      // Regional engineers can see all faults in their region
      filteredOP5Faults = filteredOP5Faults.filter(fault => 
        fault.regionId === regions.find(r => r.name === user.region)?.id
      );
      filteredControlOutages = filteredControlOutages.filter(outage => 
        outage.regionId === regions.find(r => r.name === user.region)?.id
      );
    }
    // Global engineers can see all faults, no additional filtering needed

    // Apply additional filters if provided
    if (regionId) {
      filteredOP5Faults = filteredOP5Faults.filter(fault => fault.regionId === regionId);
      filteredControlOutages = filteredControlOutages.filter(outage => outage.regionId === regionId);
    }
    
    if (districtId) {
      filteredOP5Faults = filteredOP5Faults.filter(fault => fault.districtId === districtId);
      filteredControlOutages = filteredControlOutages.filter(outage => outage.districtId === districtId);
    }

    return {
      op5Faults: filteredOP5Faults,
      controlOutages: filteredControlOutages
    };
  };
  
  // CRUD functions for OP5 faults
  const addOP5Fault = (fault: Omit<OP5Fault, "id" | "status">) => {
    // Determine status based on restoration date
    const status = fault.restorationDate ? "resolved" : "active";
    
    const newFault: OP5Fault = {
      ...fault,
      id: `op5-${uuidv4()}`,
      status,
    };
    
    setOP5Faults(prev => [...prev, newFault]);
    toast.success("OP5 Fault report submitted successfully");
  };

  const updateOP5Fault = (id: string, updatedFault: Partial<OP5Fault>) => {
    try {
      // Find the existing fault first
      const existingFault = op5Faults.find(f => f.id === id);
      if (!existingFault) {
        throw new Error("Fault not found");
      }

      // Determine the restoration date and status
      let restorationDate = updatedFault.restorationDate;
      let status = updatedFault.status;

      // If restoration date is provided but status is not, set status to resolved
      if (typeof restorationDate === 'string' && restorationDate.trim() !== '') {
        restorationDate = new Date(restorationDate).toISOString();
        status = status || "resolved";
      } else if (!restorationDate || restorationDate.trim() === '') {
        restorationDate = null;
        status = status || "active";
      }
      
      setOP5Faults(prev => prev.map(fault => 
        fault.id === id ? { 
          ...fault, 
          ...updatedFault,
          restorationDate,
          status
        } : fault
      ));
      toast.success("Fault updated successfully");
    } catch (error) {
      console.error("Error updating OP5 fault:", error);
      toast.error("Failed to update fault");
      throw error;
    }
  };

  const deleteOP5Fault = (id: string) => {
    setOP5Faults(prev => prev.filter(fault => fault.id !== id));
  };

  // CRUD functions for Control System Outages
  const addControlOutage = (outage: Omit<ControlSystemOutage, "id" | "status">) => {
    // Simple status check - exactly like OP5
    const status = outage.restorationDate ? "resolved" : "active";
    
    const newOutage: ControlSystemOutage = {
      ...outage,
      id: `control-${uuidv4()}`,
      status,
    };
    
    setControlOutages(prev => [...prev, newOutage]);
    toast.success("Control System Outage report submitted successfully");
  };

  const updateControlOutage = (id: string, updatedOutage: Partial<ControlSystemOutage>) => {
    try {
      // Find the existing outage first
      const existingOutage = controlOutages.find(o => o.id === id);
      if (!existingOutage) {
        throw new Error("Outage not found");
      }

      // Simple status check - exactly like OP5
      const status = updatedOutage.restorationDate ? "resolved" : "active";
      
      setControlOutages(prev => prev.map(outage => 
        outage.id === id ? { 
          ...outage, 
          ...updatedOutage,
          status
        } : outage
      ));
      toast.success("Outage updated successfully");
    } catch (error) {
      console.error("Error updating control outage:", error);
      toast.error("Failed to update outage");
      throw error;
    }
  };

  const deleteControlOutage = (id: string) => {
    setControlOutages(prev => prev.filter(outage => outage.id !== id));
  };

  // Function to check if user can edit a fault
  const canEditFault = (fault: OP5Fault | ControlSystemOutage): boolean => {
    if (!user) return false;
    
    // Global engineers can edit any fault
    if (user.role === "global_engineer") return true;
    
    // Regional engineers can edit faults in their region
    if (user.role === "regional_engineer") {
      const region = regions.find(r => r.id === fault.regionId);
      return region?.name === user.region;
    }
    
    // District engineers can edit faults in their district
    if (user.role === "district_engineer") {
      const district = districts.find(d => d.id === fault.districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  // Function to check if user can resolve a fault
  const canResolveFault = (fault: OP5Fault | ControlSystemOutage): boolean => {
    if (!user) return false;
    if (fault.status === "resolved") return false;
    return canEditFault(fault);
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
  
  const updateVITAsset = (id: string, updates: Partial<VITAsset>) => {
    setVITAssets(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date().toISOString() } 
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

  const updateSubstationInspection = (id: string, data: Partial<SubstationInspection>) => {
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
  
  // --- Add CRUD functions for Load Monitoring Data ---
  const saveLoadMonitoringRecord = (data: Omit<LoadMonitoringData, "id">) => {
    const newRecord: LoadMonitoringData = {
      ...data,
      id: uuidv4()
    };
    setLoadMonitoringRecords(prev => [...prev, newRecord]);
    toast.success("Load monitoring record saved successfully");
    return newRecord.id;
  };

  const getLoadMonitoringRecord = (id: string) => {
    return loadMonitoringRecords.find(record => record.id === id);
  };

  const updateLoadMonitoringRecord = (id: string, data: Partial<LoadMonitoringData>) => {
    setLoadMonitoringRecords(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...data }
          : item
      )
    );
    toast.success("Load monitoring record updated successfully");
  };

  const deleteLoadMonitoringRecord = (id: string) => {
    setLoadMonitoringRecords(prev => prev.filter(item => item.id !== id));
    toast.success("Load monitoring record deleted successfully");
  };
  // --- End Load Monitoring Data functions ---

  // Function to check if user can edit an asset
  const canEditAsset = (asset: VITAsset): boolean => {
    if (!user) return false;
    
    // Global engineers can edit any asset
    if (user.role === "global_engineer") return true;
    
    // Regional engineers can edit assets in their region
    if (user.role === "regional_engineer") {
      const region = regions.find(r => r.id === asset.regionId);
      return region?.name === user.region;
    }
    
    // District engineers can edit assets in their district
    if (user.role === "district_engineer") {
      const district = districts.find(d => d.id === asset.districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  // Function to check if user can edit an inspection
  const canEditInspection = (inspection: VITInspectionChecklist | SubstationInspection): boolean => {
    if (!user) return false;
    
    // Global engineers can edit any inspection
    if (user.role === "global_engineer") return true;
    
    // For VIT inspections, check the associated asset's region/district
    if ('vitAssetId' in inspection) {
      const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
      if (!asset) return false;
      
      if (user.role === "regional_engineer") {
        const region = regions.find(r => r.id === asset.regionId);
        return region?.name === user.region;
      }
      
      if (user.role === "district_engineer") {
        const district = districts.find(d => d.id === asset.districtId);
        return district?.name === user.district;
      }
    }
    // For substation inspections, check the region/district directly
    else {
      if (user.role === "regional_engineer") {
        return inspection.region === user.region;
      }
      
      if (user.role === "district_engineer") {
        return inspection.district === user.district;
      }
    }
    
    return false;
  };

  // Function to check if user can delete an asset
  const canDeleteAsset = (asset: VITAsset): boolean => {
    return canEditAsset(asset);
  };

  // Function to check if user can delete an inspection
  const canDeleteInspection = (inspection: VITInspectionChecklist | SubstationInspection): boolean => {
    return canEditInspection(inspection);
  };

  // Function to check if user can add an asset
  const canAddAsset = (regionId: string, districtId: string): boolean => {
    if (!user) return false;
    
    // Global engineers can add assets anywhere
    if (user.role === "global_engineer") return true;
    
    // Regional engineers can add assets in their region
    if (user.role === "regional_engineer") {
      const region = regions.find(r => r.id === regionId);
      return region?.name === user.region;
    }
    
    // District engineers can add assets in their district
    if (user.role === "district_engineer") {
      const district = districts.find(d => d.id === districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  // Function to check if user can add an inspection
  const canAddInspection = (assetId?: string, region?: string, district?: string): boolean => {
    if (!user) return false;
    
    // Global engineers can add inspections anywhere
    if (user.role === "global_engineer") return true;
    
    // For VIT inspections, check the asset's region/district
    if (assetId) {
      const asset = vitAssets.find(a => a.id === assetId);
      if (!asset) return false;
      
      if (user.role === "regional_engineer") {
        const region = regions.find(r => r.id === asset.regionId);
        return region?.name === user.region;
      }
      
      if (user.role === "district_engineer") {
        const district = districts.find(d => d.id === asset.districtId);
        return district?.name === user.district;
      }
    }
    // For substation inspections, check the region/district directly
    else if (region && district) {
      if (user.role === "regional_engineer") {
        return region === user.region;
      }
      
      if (user.role === "district_engineer") {
        return district === user.district;
      }
    }
    
    return false;
  };

  // Function to resolve a fault
  const resolveFault = (id: string, isOP5: boolean) => {
    const now = new Date();
    const formattedDate = now.toISOString();

    if (isOP5) {
       const fault = getOP5FaultById(id);
       if (!fault) return; // Fault not found
       
       let mttr = fault.mttr; // Keep existing MTTR if already calculated
       // Calculate MTTR only if repairDate exists and restoration is happening now
       if (fault.repairDate && !fault.restorationDate) { 
           mttr = calculateMTTR(fault.occurrenceDate, formattedDate); // Calculate based on current time
       }

      updateOP5Fault(id, { 
          status: "resolved", 
          restorationDate: formattedDate,
          mttr: mttr // Update MTTR
      });
    } else {
      const outage = controlOutages.find(o => o.id === id);
      if (!outage) return;
      
      let unservedEnergy = outage.unservedEnergyMWh || 0;
      if (!outage.restorationDate) { // Calculate only if not already resolved
         const duration = calculateOutageDuration(outage.occurrenceDate, formattedDate);
         unservedEnergy = calculateUnservedEnergy(outage.loadMW, duration);
      }
      updateControlOutage(id, { 
          status: "resolved", 
          restorationDate: formattedDate, 
          unservedEnergyMWh: unservedEnergy 
      });
    }
  };

  // Function to delete a fault
  const deleteFault = (id: string, isOP5: boolean) => {
    if (isOP5) {
      deleteOP5Fault(id);
      toast.success("OP5 Fault deleted successfully");
    } else {
      deleteControlOutage(id);
      toast.success("Control System Outage deleted successfully");
    }
  };

  // Function to check if user can edit an outage
  const canEditOutage = (outage: ControlSystemOutage): boolean => {
    if (!user) return false;
    
    // Global engineers can edit any outage
    if (user.role === "global_engineer") return true;
    
    // Regional engineers can edit outages in their region
    if (user.role === "regional_engineer") {
      const region = regions.find(r => r.id === outage.regionId);
      return region?.name === user.region;
    }
    
    // District engineers can edit outages in their district
    if (user.role === "district_engineer") {
      const district = districts.find(d => d.id === outage.districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  const canEditLoadMonitoring = (record: LoadMonitoringData): boolean => {
    if (!user) return false;
    
    // Global engineers can edit any record
    if (user.role === "global_engineer") return true;
    
    // Regional engineers can edit records in their region
    if (user.role === "regional_engineer") {
      const region = regions.find(r => r.id === record.regionId);
      return region?.name === user.region;
    }
    
    // District engineers can edit records in their district
    if (user.role === "district_engineer") {
      const district = districts.find(d => d.id === record.districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  const canDeleteLoadMonitoring = (record: LoadMonitoringData): boolean => {
    return canEditLoadMonitoring(record);
  };

  // Function to get a specific OP5 Fault by ID
  const getOP5FaultById = (id: string): OP5Fault | undefined => {
    return op5Faults.find(fault => fault.id === id);
  };

  const addOverheadLineInspection = (inspection: Omit<OverheadLineInspection, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newInspection: OverheadLineInspection = {
      ...inspection,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    setOverheadLineInspections(prev => [...prev, newInspection]);
  };

  const updateOverheadLineInspection = (id: string, updates: Partial<OverheadLineInspection>) => {
    setOverheadLineInspections(prev => prev.map(inspection => {
      if (inspection.id === id) {
        return {
          ...inspection,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return inspection;
    }));
  };

  const deleteOverheadLineInspection = (id: string) => {
    setOverheadLineInspections(prev => prev.filter(inspection => inspection.id !== id));
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
        loadMonitoringRecords,
        setRegions,
        setDistricts,
        setOP5Faults,
        setControlOutages,
        setVITAssets,
        setVITInspections,
        setSavedInspections,
        setLoadMonitoringRecords,
        saveLoadMonitoringRecord,
        getLoadMonitoringRecord,
        updateLoadMonitoringRecord,
        deleteLoadMonitoringRecord,
        addOP5Fault,
        updateOP5Fault,
        deleteOP5Fault,
        deleteFault,
        addControlOutage,
        updateControlOutage,
        deleteControlOutage,
        canResolveFault,
        getFilteredFaults,
        addVITAsset,
        updateVITAsset,
        deleteVITAsset,
        addVITInspection,
        updateVITInspection,
        deleteVITInspection,
        saveInspection,
        updateDistrict,
        getSavedInspection,
        updateSubstationInspection,
        deleteInspection,
        canEditFault,
        canEditOutage,
        canEditAsset,
        canEditInspection,
        canDeleteFault: canEditFault,
        canDeleteOutage: canEditFault,
        canDeleteAsset: canDeleteAsset,
        canDeleteInspection: canDeleteInspection,
        canAddAsset: canAddAsset,
        canAddInspection: canAddInspection,
        resolveFault,
        canEditLoadMonitoring,
        canDeleteLoadMonitoring,
        getOP5FaultById,
        overheadLineInspections,
        addOverheadLineInspection,
        updateOverheadLineInspection,
        deleteOverheadLineInspection
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
