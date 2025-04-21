
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FaultType } from '@/lib/types';
import { Material } from '@/types/faults';

interface OP5FormContextType {
  regionId: string;
  districtId: string;
  setRegionId: (id: string) => void;
  setDistrictId: (id: string) => void;
  faultType: FaultType;
  setFaultType: (type: FaultType) => void;
  specificFaultType: string;
  setSpecificFaultType: (type: string) => void;
  faultLocation: string;
  setFaultLocation: (location: string) => void;
  occurrenceDate: string;
  setOccurrenceDate: (date: string) => void;
  restorationDate: string | null;
  setRestorationDate: (date: string | null) => void;
  ruralAffected: number | null;
  setRuralAffected: (value: number | null) => void;
  urbanAffected: number | null;
  setUrbanAffected: (value: number | null) => void;
  metroAffected: number | null;
  setMetroAffected: (value: number | null) => void;
  saidi: number;
  setSaidi: (value: number) => void;
  saifi: number;
  setSaifi: (value: number) => void;
  caidi: number;
  setCaidi: (value: number) => void;
  materials: Material[];
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  removeMaterial: (index: number) => void;
}

const OP5FormContext = createContext<OP5FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(OP5FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within an OP5FormProvider');
  }
  return context;
};

interface OP5FormProviderProps {
  children: ReactNode;
}

export const OP5FormProvider: React.FC<OP5FormProviderProps> = ({ children }) => {
  const [regionId, setRegionId] = useState<string>('');
  const [districtId, setDistrictId] = useState<string>('');
  const [faultType, setFaultType] = useState<FaultType>('Unplanned');
  const [specificFaultType, setSpecificFaultType] = useState<string>('');
  const [faultLocation, setFaultLocation] = useState<string>('');
  const [occurrenceDate, setOccurrenceDate] = useState<string>(new Date().toISOString());
  const [restorationDate, setRestorationDate] = useState<string | null>(null);
  const [ruralAffected, setRuralAffected] = useState<number | null>(0);
  const [urbanAffected, setUrbanAffected] = useState<number | null>(0);
  const [metroAffected, setMetroAffected] = useState<number | null>(0);
  const [saidi, setSaidi] = useState<number>(0);
  const [saifi, setSaifi] = useState<number>(0);
  const [caidi, setCaidi] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>([]);

  const addMaterial = (material: Material) => {
    setMaterials([...materials, material]);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    setMaterials(newMaterials);
  };

  const value = {
    regionId,
    setRegionId,
    districtId,
    setDistrictId,
    faultType,
    setFaultType,
    specificFaultType,
    setSpecificFaultType,
    faultLocation,
    setFaultLocation,
    occurrenceDate,
    setOccurrenceDate,
    restorationDate,
    setRestorationDate,
    ruralAffected,
    setRuralAffected,
    urbanAffected,
    setUrbanAffected,
    metroAffected,
    setMetroAffected,
    saidi,
    setSaidi,
    saifi,
    setSaifi,
    caidi,
    setCaidi,
    materials,
    setMaterials,
    addMaterial,
    removeMaterial
  };

  return <OP5FormContext.Provider value={value}>{children}</OP5FormContext.Provider>;
};
