
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FaultType } from '@/lib/types';

interface ControlOutageFormContext {
  // Location
  regionId: string;
  setRegionId: (value: string) => void;
  districtId: string;
  setDistrictId: (value: string) => void;
  
  // Dates and Times
  occurrenceDate: string;
  setOccurrenceDate: (value: string) => void;
  restorationDate: string;
  setRestorationDate: (value: string) => void;
  
  // Fault Details
  faultType: FaultType;
  setFaultType: (value: FaultType) => void;
  specificFaultType: string;
  setSpecificFaultType: (value: string) => void;
  
  // Affected Population
  ruralAffected: number | null;
  setRuralAffected: (value: number | null) => void;
  urbanAffected: number | null;
  setUrbanAffected: (value: number | null) => void;
  metroAffected: number | null;
  setMetroAffected: (value: number | null) => void;
  
  // Additional Details
  reason: string;
  setReason: (value: string) => void;
  indications: string;
  setIndications: (value: string) => void;
  areaAffected: string;
  setAreaAffected: (value: string) => void;
  loadMW: number;
  setLoadMW: (value: number) => void;
  
  // Calculated Values
  durationHours: number | null;
  unservedEnergyMWh: number | null;
}

const ControlOutageFormContext = createContext<ControlOutageFormContext | undefined>(undefined);

export const ControlOutageFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Make this context available globally for components that need to check
  if (typeof window !== 'undefined') {
    (window as any).__CONTROL_OUTAGE_FORM_CONTEXT__ = ControlOutageFormContext;
  }
  
  // Location state
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  
  // Dates and Times
  const [occurrenceDate, setOccurrenceDate] = useState("");
  const [restorationDate, setRestorationDate] = useState("");
  
  // Fault Details
  const [faultType, setFaultType] = useState<FaultType>("Unplanned");
  const [specificFaultType, setSpecificFaultType] = useState("");
  
  // Affected Population
  const [ruralAffected, setRuralAffected] = useState<number | null>(null);
  const [urbanAffected, setUrbanAffected] = useState<number | null>(null);
  const [metroAffected, setMetroAffected] = useState<number | null>(null);
  
  // Additional Details
  const [reason, setReason] = useState("");
  const [indications, setIndications] = useState("");
  const [areaAffected, setAreaAffected] = useState("");
  const [loadMW, setLoadMW] = useState<number>(0);
  
  // Calculated Values
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [unservedEnergyMWh, setUnservedEnergyMWh] = useState<number | null>(null);
  
  // Calculate metrics when dates or load changes
  useEffect(() => {
    if (occurrenceDate && restorationDate && loadMW > 0) {
      const startDate = new Date(occurrenceDate);
      const endDate = new Date(restorationDate);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationHrs = durationMs / (1000 * 60 * 60);
        
        if (durationHrs >= 0) {
          setDurationHours(durationHrs);
          setUnservedEnergyMWh(loadMW * durationHrs);
        }
      }
    } else {
      setDurationHours(null);
      setUnservedEnergyMWh(null);
    }
  }, [occurrenceDate, restorationDate, loadMW]);

  const value = {
    regionId,
    setRegionId,
    districtId,
    setDistrictId,
    occurrenceDate,
    setOccurrenceDate,
    restorationDate,
    setRestorationDate,
    faultType,
    setFaultType,
    specificFaultType,
    setSpecificFaultType,
    ruralAffected,
    setRuralAffected,
    urbanAffected,
    setUrbanAffected,
    metroAffected,
    setMetroAffected,
    reason,
    setReason,
    indications,
    setIndications,
    areaAffected,
    setAreaAffected,
    loadMW,
    setLoadMW,
    durationHours,
    unservedEnergyMWh
  };

  return (
    <ControlOutageFormContext.Provider value={value}>
      {children}
    </ControlOutageFormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(ControlOutageFormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a ControlOutageFormProvider');
  }
  return context;
};
