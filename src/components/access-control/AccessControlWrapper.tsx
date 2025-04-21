import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/lib/types';
import { PermissionService } from '@/services/PermissionService';

interface AccessControlWrapperProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
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
    vitAssets,
    vitInspections,
    savedInspections,
    op5Faults,
    controlOutages,
    regions,
    districts
  } = useData();
  const navigate = useNavigate();
  const permissionService = PermissionService.getInstance();

  // Check if user has the required role
  if (requiredRole && user?.role && !permissionService.hasRequiredRole(user.role, requiredRole)) {
    toast.error("You don't have permission to access this page");
    navigate('/');
    return null;
  }

  // Check asset permissions
  if (type === 'asset') {
    // For asset list view, check if user has access to any assets
    if (!assetId) {
      if (!permissionService.canAccessFeature(user?.role || null, 'asset_management')) {
        toast.error("You don't have permission to access any assets");
        navigate('/');
        return null;
      }
    }
    // For specific asset view, check if user has access to that asset
    else {
      const asset = vitAssets.find(a => a.id === assetId);
      if (asset) {
        const region = regions.find(r => r.id === asset.regionId);
        const district = districts.find(d => d.id === asset.districtId);
        
        if (!permissionService.canViewAsset(
          user?.role || null,
          user?.region || null,
          user?.district || null,
          region?.name || '',
          district?.name || ''
        )) {
          toast.error("You don't have permission to access this asset");
          navigate('/asset-management');
          return null;
        }
      }
    }
  }

  // Check inspection permissions
  if (type === 'inspection') {
    // For inspection list view, check if user has access to any inspections
    if (!inspectionId) {
      if (!permissionService.canAccessFeature(user?.role || null, 'inspection_management')) {
        toast.error("You don't have permission to access any inspections");
        navigate('/');
        return null;
      }
    }
    // For specific inspection view, check if user has access to that inspection
    else {
      const vitInspection = vitInspections.find(i => i.id === inspectionId);
      const substationInspection = savedInspections?.find(i => i.id === inspectionId);
      
      if (vitInspection) {
        const asset = vitAssets.find(a => a.id === vitInspection.vitAssetId);
        if (asset) {
          const region = regions.find(r => r.id === asset.regionId);
          const district = districts.find(d => d.id === asset.districtId);
          
          if (!permissionService.canViewInspection(
            user?.role || null,
            user?.region || null,
            user?.district || null,
            region?.name || '',
            district?.name || ''
          )) {
            toast.error("You don't have permission to access this inspection");
            navigate('/asset-management');
            return null;
          }
        }
      }
      
      if (substationInspection) {
        if (!permissionService.canViewInspection(
          user?.role || null,
          user?.region || null,
          user?.district || null,
          substationInspection.region,
          substationInspection.district
        )) {
          toast.error("You don't have permission to access this inspection");
          navigate('/asset-management');
          return null;
        }
      }
    }
  }

  // Check load monitoring permissions
  if (type === 'load-monitoring') {
    if (!permissionService.canAccessFeature(user?.role || null, 'load_monitoring')) {
      toast.error("You don't have permission to access load monitoring data");
      navigate('/');
      return null;
    }
  }

  // Check fault permissions
  if (type === 'fault' && assetId) {
    const fault = op5Faults.find(f => f.id === assetId);
    if (fault) {
      const region = regions.find(r => r.id === fault.regionId);
      const district = districts.find(d => d.id === fault.districtId);
      
      if (!permissionService.canViewAsset(
        user?.role || null,
        user?.region || null,
        user?.district || null,
        region?.name || '',
        district?.name || ''
      )) {
        toast.error("You don't have permission to access this fault");
        navigate('/');
        return null;
      }
    }
  }

  // Check outage permissions
  if (type === 'outage' && assetId) {
    const outage = controlOutages.find(o => o.id === assetId);
    if (outage) {
      const region = regions.find(r => r.id === outage.regionId);
      const district = districts.find(d => d.id === outage.districtId);
      
      if (!permissionService.canViewAsset(
        user?.role || null,
        user?.region || null,
        user?.district || null,
        region?.name || '',
        district?.name || ''
      )) {
        toast.error("You don't have permission to access this outage");
        navigate('/');
        return null;
      }
    }
  }

  return <>{children}</>;
} 