import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Region, District, OP5Fault, ControlSystemOutage, VITAsset, VITInspection, SubstationInspection, LoadMonitoring, Material, FaultType } from '@/lib/types';
import regionsData from '@/data/regions.json';
import districtsData from '@/data/districts.json';
import mockOP5FaultsData from '@/data/op5-faults.json';
import mockControlSystemOutagesData from '@/data/control-system-outages.json';
import mockVITAssetsData from '@/data/vit-assets.json';
import mockVITInspectionsData from '@/data/vit-inspections.json';
import mockOverheadLineInspections from '@/data/overhead-line-inspections.json';
import { useAuth } from './AuthContext';
import { calculateUnservedEnergy } from '@/utils/calculations';
import { syncDataToIDB, getDataFromIDB } from '@/utils/sync';

export interface DataContextType {
  regions: Region[];
  districts: District[];
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  vitAssets: VITAsset[];
  vitInspections: VITInspection[];
  substationInspections: SubstationInspection[];
  loadMonitoring: LoadMonitoring[];
  addOP5Fault: (fault: Partial<OP5Fault>) => Promise<OP5Fault>;
  updateOP5Fault: (id: string, fault: Partial<OP5Fault>) => Promise<OP5Fault>;
  deleteOP5Fault: (id: string) => Promise<void>;
  addControlOutage: (outage: Partial<ControlSystemOutage>) => Promise<ControlSystemOutage>;
  updateControlOutage: (id: string, outage: Partial<ControlSystemOutage>) => Promise<ControlSystemOutage>;
  deleteControlOutage: (id: string) => Promise<void>;
  addVITAsset: (asset: Partial<VITAsset>) => Promise<VITAsset>;
  updateVITAsset: (id: string, asset: Partial<VITAsset>) => Promise<VITAsset>;
  deleteVITAsset: (id: string) => Promise<void>;
  addVITInspection: (inspection: Partial<VITInspection>) => Promise<VITInspection>;
  updateVITInspection: (id: string, inspection: Partial<VITInspection>) => Promise<VITInspection>;
  deleteVITInspection: (id: string) => Promise<void>;
  addSubstationInspection: (inspection: Partial<SubstationInspection>) => Promise<SubstationInspection>;
  updateSubstationInspection: (id: string, inspection: Partial<SubstationInspection>) => Promise<SubstationInspection>;
  deleteSubstationInspection: (id: string) => Promise<void>;
  addLoadMonitoring: (data: Partial<LoadMonitoring>) => Promise<LoadMonitoring>;
  updateLoadMonitoring: (id: string, data: Partial<LoadMonitoring>) => Promise<LoadMonitoring>;
  deleteLoadMonitoring: (id: string) => Promise<void>;
  setOP5Faults: React.Dispatch<React.SetStateAction<OP5Fault[]>>;
  setControlOutages: React.Dispatch<React.SetStateAction<ControlSystemOutage[]>>;
  setVITAssets: React.Dispatch<React.SetStateAction<VITAsset[]>>;
  setVITInspections: React.Dispatch<React.SetStateAction<VITInspection[]>>;
  setSubstationInspections: React.Dispatch<React.SetStateAction<SubstationInspection[]>>;
  setLoadMonitoring: React.Dispatch<React.SetStateAction<LoadMonitoring[]>>;
  resolveFault: (id: string, isOP5: boolean) => Promise<void>;
  deleteFault: (id: string, isOP5: boolean) => Promise<void>;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>([]);
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>([]);
  const [vitAssets, setVITAssets] = useState<VITAsset[]>([]);
  const [vitInspections, setVITInspections] = useState<VITInspection[]>([]);
  const [substationInspections, setSubstationInspections] = useState<SubstationInspection[]>([]);
  const [loadMonitoring, setLoadMonitoring] = useState<LoadMonitoring[]>([]);

  useEffect(() => {
    // Load mock data
    setRegions(regionsData as Region[]);
    
    // Process districts and add population data
    const processedDistricts = districtsData.map(district => {
      return {
        ...district,
        population: (district as any).population || { rural: 10000, urban: 50000, metro: 200000 }
      };
    });
    setDistricts(processedDistricts as District[]);

    // Load data from IndexedDB or initialize with mock data
    const loadData = async () => {
      try {
        // OP5 Faults
        const cachedOP5Faults = await getDataFromIDB('op5-faults');
        if (cachedOP5Faults && cachedOP5Faults.length > 0) {
          setOP5Faults(cachedOP5Faults as OP5Fault[]);
        } else {
          // Initialize with mock data if no cached data
          setOP5Faults(mockOP5FaultsData.map(fault => ({
            id: fault.id,
            regionId: fault.regionId,
            districtId: fault.districtId,
            occurrenceDate: new Date().toISOString(),
            restorationDate: null,
            repairDate: null,
            faultType: fault.faultType as FaultType,
            specificFaultType: "",
            faultLocation: fault.substationNumber,
            status: "active",
            affectedPopulation: fault.affectedPopulation,
            mttr: 0,
            reliabilityIndices: fault.reliabilityIndices,
            createdBy: fault.createdBy,
            createdAt: fault.createdAt
          })));
        }

        // Control System Outages
        const cachedControlOutages = await getDataFromIDB('control-outages');
        if (cachedControlOutages && cachedControlOutages.length > 0) {
          setControlOutages(cachedControlOutages as ControlSystemOutage[]);
        } else {
          // Initialize with mock data
          setControlOutages(mockControlSystemOutagesData.map(outage => ({
            ...outage,
            unservedEnergyMWh: calculateUnservedEnergy(outage.loadMW, outage.restorationDate, outage.occurrenceDate)
          })) as ControlSystemOutage[]);
        }

        // VIT Assets
        const cachedVITAssets = await getDataFromIDB('vit-assets');
        if (cachedVITAssets && cachedVITAssets.length > 0) {
          setVITAssets(cachedVITAssets as VITAsset[]);
        } else {
          // Initialize with mock data
          setVITAssets(mockVITAssetsData as VITAsset[]);
        }

        // VIT Inspections
        const cachedVITInspections = await getDataFromIDB('vit-inspections');
        if (cachedVITInspections && cachedVITInspections.length > 0) {
          setVITInspections(cachedVITInspections as VITInspection[]);
        } else {
          // Initialize with mock data
          setVITInspections(mockVITInspectionsData as VITInspection[]);
        }

        // Substation Inspections
        const cachedSubstationInspections = await getDataFromIDB('substation-inspections');
        if (cachedSubstationInspections && cachedSubstationInspections.length > 0) {
          setSubstationInspections(cachedSubstationInspections as SubstationInspection[]);
        } else {
          // Initialize with mock data
          setSubstationInspections(mockOverheadLineInspections as SubstationInspection[]);
        }

        // Load Monitoring
        const cachedLoadMonitoring = await getDataFromIDB('load-monitoring');
        if (cachedLoadMonitoring && cachedLoadMonitoring.length > 0) {
          setLoadMonitoring(cachedLoadMonitoring as LoadMonitoring[]);
        } else {
          // Initialize with empty array as there's no mock data
          setLoadMonitoring([]);
        }
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        // Fall back to mock data
        setOP5Faults(mockOP5FaultsData as OP5Fault[]);
        setControlOutages(mockControlSystemOutagesData as ControlSystemOutage[]);
        setVITAssets(mockVITAssetsData as VITAsset[]);
        setVITInspections(mockVITInspectionsData as VITInspection[]);
        setSubstationInspections(mockOverheadLineInspections as SubstationInspection[]);
        setLoadMonitoring([]);
      }
    };

    loadData();
  }, []);

  const addOP5Fault = async (fault: Partial<OP5Fault>): Promise<OP5Fault> => {
    const newFault: OP5Fault = {
      id: Math.random().toString(36).substring(2, 15),
      regionId: fault.regionId || '',
      districtId: fault.districtId || '',
      occurrenceDate: fault.occurrenceDate || new Date().toISOString(),
      restorationDate: fault.restorationDate || null,
      repairDate: fault.repairDate || null,
      faultType: fault.faultType || 'Unplanned',
      specificFaultType: fault.specificFaultType || '',
      faultLocation: fault.faultLocation || '',
      status: fault.status || 'active',
      affectedPopulation: fault.affectedPopulation || { rural: 0, urban: 0, metro: 0 },
      mttr: fault.mttr || 0,
      reliabilityIndices: fault.reliabilityIndices || { saidi: 0, saifi: 0, caidi: 0 },
      materialsUsed: fault.materialsUsed || [],
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedFaults = [...op5Faults, newFault];
    setOP5Faults(updatedFaults);
    await syncDataToIDB('op5-faults', updatedFaults);
    return newFault;
  };

  const updateOP5Fault = async (id: string, fault: Partial<OP5Fault>): Promise<OP5Fault> => {
    const updatedFaults = op5Faults.map(f => (f.id === id ? { ...f, ...fault } : f));
    setOP5Faults(updatedFaults);
    await syncDataToIDB('op5-faults', updatedFaults);
    return updatedFaults.find(f => f.id === id) as OP5Fault;
  };

  const deleteOP5Fault = async (id: string): Promise<void> => {
    const updatedFaults = op5Faults.filter(f => f.id !== id);
    setOP5Faults(updatedFaults);
    await syncDataToIDB('op5-faults', updatedFaults);
  };

  const addControlOutage = async (outage: Partial<ControlSystemOutage>): Promise<ControlSystemOutage> => {
    const newOutage: ControlSystemOutage = {
      id: Math.random().toString(36).substring(2, 15),
      regionId: outage.regionId || '',
      districtId: outage.districtId || '',
      occurrenceDate: outage.occurrenceDate || new Date().toISOString(),
      restorationDate: outage.restorationDate || null,
      faultType: outage.faultType || 'Unplanned',
      specificFaultType: outage.specificFaultType || '',
      faultLocation: outage.faultLocation || '',
      status: outage.status || 'active',
      customersAffected: outage.customersAffected || { rural: 0, urban: 0, metro: 0 },
      unservedEnergyMWh: outage.unservedEnergyMWh || 0,
      loadMW: outage.loadMW || 0,
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedOutages = [...controlOutages, newOutage];
    setControlOutages(updatedOutages);
    await syncDataToIDB('control-outages', updatedOutages);
    return newOutage;
  };

  const updateControlOutage = async (id: string, outage: Partial<ControlSystemOutage>): Promise<ControlSystemOutage> => {
    const updatedOutages = controlOutages.map(o => (o.id === id ? { ...o, ...outage } : o));
    setControlOutages(updatedOutages);
    await syncDataToIDB('control-outages', updatedOutages);
    return updatedOutages.find(o => o.id === id) as ControlSystemOutage;
  };

  const deleteControlOutage = async (id: string): Promise<void> => {
    const updatedOutages = controlOutages.filter(o => o.id !== id);
    setControlOutages(updatedOutages);
    await syncDataToIDB('control-outages', updatedOutages);
  };

  const addVITAsset = async (asset: Partial<VITAsset>): Promise<VITAsset> => {
    const newAsset: VITAsset = {
      id: Math.random().toString(36).substring(2, 15),
      regionId: asset.regionId || '',
      districtId: asset.districtId || '',
      name: asset.name || '',
      type: asset.type || '',
      location: asset.location || '',
      status: asset.status || 'active',
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedAssets = [...vitAssets, newAsset];
    setVITAssets(updatedAssets);
    await syncDataToIDB('vit-assets', updatedAssets);
    return newAsset;
  };

  const updateVITAsset = async (id: string, asset: Partial<VITAsset>): Promise<VITAsset> => {
    const updatedAssets = vitAssets.map(a => (a.id === id ? { ...a, ...asset } : a));
    setVITAssets(updatedAssets);
    await syncDataToIDB('vit-assets', updatedAssets);
    return updatedAssets.find(a => a.id === id) as VITAsset;
  };

  const deleteVITAsset = async (id: string): Promise<void> => {
    const updatedAssets = vitAssets.filter(a => a.id !== id);
    setVITAssets(updatedAssets);
    await syncDataToIDB('vit-assets', updatedAssets);
  };

  const addVITInspection = async (inspection: Partial<VITInspection>): Promise<VITInspection> => {
    const newInspection: VITInspection = {
      id: Math.random().toString(36).substring(2, 15),
      assetId: inspection.assetId || '',
      inspectionDate: inspection.inspectionDate || new Date().toISOString(),
      condition: inspection.condition || '',
      notes: inspection.notes || '',
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedInspections = [...vitInspections, newInspection];
    setVITInspections(updatedInspections);
    await syncDataToIDB('vit-inspections', updatedInspections);
    return newInspection;
  };

  const updateVITInspection = async (id: string, inspection: Partial<VITInspection>): Promise<VITInspection> => {
    const updatedInspections = vitInspections.map(i => (i.id === id ? { ...i, ...inspection } : i));
    setVITInspections(updatedInspections);
    await syncDataToIDB('vit-inspections', updatedInspections);
    return updatedInspections.find(i => i.id === id) as VITInspection;
  };

  const deleteVITInspection = async (id: string): Promise<void> => {
    const updatedInspections = vitInspections.filter(i => i.id !== id);
    setVITInspections(updatedInspections);
    await syncDataToIDB('vit-inspections', updatedInspections);
  };

  const addSubstationInspection = async (inspection: Partial<SubstationInspection>): Promise<SubstationInspection> => {
    const newInspection: SubstationInspection = {
      id: Math.random().toString(36).substring(2, 15),
      region: inspection.region || '',
      district: inspection.district || '',
      substationName: inspection.substationName || '',
      inspectionDate: inspection.inspectionDate || new Date().toISOString(),
      inspectorName: inspection.inspectorName || '',
      notes: inspection.notes || '',
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedInspections = [...substationInspections, newInspection];
    setSubstationInspections(updatedInspections);
    await syncDataToIDB('substation-inspections', updatedInspections);
    return newInspection;
  };

  const updateSubstationInspection = async (id: string, inspection: Partial<SubstationInspection>): Promise<SubstationInspection> => {
    const updatedInspections = substationInspections.map(i => (i.id === id ? { ...i, ...inspection } : i));
    setSubstationInspections(updatedInspections);
    await syncDataToIDB('substation-inspections', updatedInspections);
    return updatedInspections.find(i => i.id === id) as SubstationInspection;
  };

  const deleteSubstationInspection = async (id: string): Promise<void> => {
    const updatedInspections = substationInspections.filter(i => i.id !== id);
    setSubstationInspections(updatedInspections);
    await syncDataToIDB('substation-inspections', updatedInspections);
  };

  const addLoadMonitoring = async (data: Partial<LoadMonitoring>): Promise<LoadMonitoring> => {
    const newLoadMonitoring: LoadMonitoring = {
      id: Math.random().toString(36).substring(2, 15),
      regionId: data.regionId || '',
      districtId: data.districtId || '',
      substationName: data.substationName || '',
      feeder: data.feeder || '',
      timestamp: data.timestamp || new Date().toISOString(),
      loadValue: data.loadValue || 0,
      notes: data.notes || '',
      createdBy: user?.email || 'system',
      createdAt: new Date().toISOString()
    };

    const updatedLoadMonitoring = [...loadMonitoring, newLoadMonitoring];
    setLoadMonitoring(updatedLoadMonitoring);
    await syncDataToIDB('load-monitoring', updatedLoadMonitoring);
    return newLoadMonitoring;
  };

  const updateLoadMonitoring = async (id: string, data: Partial<LoadMonitoring>): Promise<LoadMonitoring> => {
    const updatedLoadMonitoring = loadMonitoring.map(lm => (lm.id === id ? { ...lm, ...data } : lm));
    setLoadMonitoring(updatedLoadMonitoring);
    await syncDataToIDB('load-monitoring', updatedLoadMonitoring);
    return updatedLoadMonitoring.find(lm => lm.id === id) as LoadMonitoring;
  };

  const deleteLoadMonitoring = async (id: string): Promise<void> => {
    const updatedLoadMonitoring = loadMonitoring.filter(lm => lm.id !== id);
    setLoadMonitoring(updatedLoadMonitoring);
    await syncDataToIDB('load-monitoring', updatedLoadMonitoring);
  };

  const resolveFault = async (id: string, isOP5: boolean): Promise<void> => {
    if (isOP5) {
      const updatedFaults = op5Faults.map(f => 
        f.id === id ? { ...f, status: 'resolved' as const, restorationDate: new Date().toISOString() } : f
      );
      setOP5Faults(updatedFaults);
      await syncDataToIDB('op5-faults', updatedFaults);
    } else {
      const updatedOutages = controlOutages.map(o => 
        o.id === id ? { ...o, status: 'resolved' as const, restorationDate: new Date().toISOString() } : o
      );
      setControlOutages(updatedOutages);
      await syncDataToIDB('control-outages', updatedOutages);
    }
  };

  const deleteFault = async (id: string, isOP5: boolean): Promise<void> => {
    if (isOP5) {
      await deleteOP5Fault(id);
    } else {
      await deleteControlOutage(id);
    }
  };

  const canEditFault = (fault: OP5Fault | ControlSystemOutage): boolean => {
    if (!user) return false;
    
    // System admins can edit anything
    if (user.role === 'system_admin') return true;
    
    // Global engineers can edit anything
    if (user.role === 'global_engineer') return true;
    
    // Regional engineers can edit in their region
    if (user.role === 'regional_engineer') {
      const region = regions.find(r => r.id === fault.regionId);
      return region?.name === user.region;
    }
    
    // District engineers can edit in their district
    if (user.role === 'district_engineer') {
      const district = districts.find(d => d.id === fault.districtId);
      return district?.name === user.district;
    }
    
    return false;
  };

  const value = {
    regions,
    districts,
    op5Faults,
    controlOutages,
    vitAssets,
    vitInspections,
    substationInspections,
    loadMonitoring,
    addOP5Fault,
    updateOP5Fault,
    deleteOP5Fault,
    addControlOutage,
    updateControlOutage,
    deleteControlOutage,
    addVITAsset,
    updateVITAsset,
    deleteVITAsset,
    addVITInspection,
    updateVITInspection,
    deleteVITInspection,
    addSubstationInspection,
    updateSubstationInspection,
    deleteSubstationInspection,
    addLoadMonitoring,
    updateLoadMonitoring,
    deleteLoadMonitoring,
    setOP5Faults,
    setControlOutages,
    setVITAssets,
    setVITInspections,
    setSubstationInspections,
    setLoadMonitoring,
    resolveFault,
    deleteFault,
    canEditFault
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
