import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';

interface AccessControlWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'global_engineer' | 'regional_engineer' | 'district_engineer';
  regionId?: string;
  districtId?: string;
  assetId?: string;
  inspectionId?: string;
  type?: 'asset' | 'inspection' | 'fault' | 'outage' | 'load-monitoring';
}

export function AccessControlWrapper({
  children,
  requiredRole,
  regionId,
  districtId,
  assetId,
  inspectionId,
  type
}: AccessControlWrapperProps) {
  const { user } = useAuth();
  const { 
    canEditAsset, 
    canEditInspection, 
    canEditFault,
    canAddAsset,
    canAddInspection,
    vitAssets,
    vitInspections,
    savedInspections,
    op5Faults,
    controlOutages,
    regions,
    districts
  } = useData();
  const navigate = useNavigate();

  // Check if user has the required role
  if (requiredRole && user?.role !== requiredRole) {
    toast.error("You don't have permission to access this page");
    navigate('/');
    return null;
  }

  // Check asset permissions
  if (type === 'asset') {
    // For asset list view, check if user has access to any assets
    if (!assetId) {
      if (user?.role === 'district_engineer') {
        const userDistrict = districts.find(d => d.name === user.district);
        if (!userDistrict) {
          toast.error("You don't have permission to access any assets");
          navigate('/');
          return null;
        }
      } else if (user?.role === 'regional_engineer') {
        const userRegion = regions.find(r => r.name === user.region);
        if (!userRegion) {
          toast.error("You don't have permission to access any assets");
          navigate('/');
          return null;
        }
      }
    }
    // For specific asset view, check if user has access to that asset
    else {
      const asset = vitAssets.find(a => a.id === assetId);
      if (asset && !canEditAsset(asset)) {
        toast.error("You don't have permission to access this asset");
        navigate('/asset-management');
        return null;
      }
    }
  }

  // Check inspection permissions
  if (type === 'inspection') {
    // For inspection list view, check if user has access to any inspections
    if (!inspectionId) {
      if (user?.role === 'district_engineer') {
        const userDistrict = districts.find(d => d.name === user.district);
        if (!userDistrict) {
          toast.error("You don't have permission to access any inspections");
          navigate('/');
          return null;
        }
      } else if (user?.role === 'regional_engineer') {
        const userRegion = regions.find(r => r.name === user.region);
        if (!userRegion) {
          toast.error("You don't have permission to access any inspections");
          navigate('/');
          return null;
        }
      }
    }
    // For specific inspection view, check if user has access to that inspection
    else {
      const vitInspection = vitInspections.find(i => i.id === inspectionId);
      const substationInspection = savedInspections?.find(i => i.id === inspectionId);
      
      if (vitInspection && !canEditInspection(vitInspection)) {
        toast.error("You don't have permission to access this inspection");
        navigate('/asset-management');
        return null;
      }
      
      if (substationInspection && !canEditInspection(substationInspection)) {
        toast.error("You don't have permission to access this inspection");
        navigate('/asset-management');
        return null;
      }
    }
  }

  // Check load monitoring permissions
  if (type === 'load-monitoring') {
    if (user?.role === 'district_engineer') {
      const userDistrict = districts.find(d => d.name === user.district);
      if (!userDistrict) {
        toast.error("You don't have permission to access load monitoring data");
        navigate('/');
        return null;
      }
    } else if (user?.role === 'regional_engineer') {
      const userRegion = regions.find(r => r.name === user.region);
      if (!userRegion) {
        toast.error("You don't have permission to access load monitoring data");
        navigate('/');
        return null;
      }
    }
  }

  // Check fault permissions
  if (type === 'fault' && assetId) {
    const fault = op5Faults.find(f => f.id === assetId);
    if (fault && !canEditFault(fault)) {
      toast.error("You don't have permission to access this fault");
      navigate('/');
      return null;
    }
  }

  // Check outage permissions
  if (type === 'outage' && assetId) {
    const outage = controlOutages.find(o => o.id === assetId);
    if (outage && !canEditFault(outage)) {
      toast.error("You don't have permission to access this outage");
      navigate('/');
      return null;
    }
  }

  // Check add permissions
  if (type === 'asset' && regionId && districtId && !canAddAsset(regionId, districtId)) {
    toast.error("You don't have permission to add assets in this location");
    navigate('/asset-management');
    return null;
  }

  if (type === 'inspection' && !canAddInspection(assetId, regionId, districtId)) {
    toast.error("You don't have permission to add inspections in this location");
    navigate('/asset-management');
    return null;
  }

  return <>{children}</>;
} 