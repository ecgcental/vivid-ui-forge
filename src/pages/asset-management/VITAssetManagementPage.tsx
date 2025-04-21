import React from 'react';
import { AccessControlWrapper } from '@/components/access-control/AccessControlWrapper';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { VITAssetList } from '@/components/asset-management/VITAssetList';

export function VITAssetManagementPage() {
  const { user } = useAuth();
  const { vitAssets, regions, districts } = useData();

  // Filter assets based on user's role and region/district
  const filteredAssets = vitAssets.filter(asset => {
    if (user?.role === 'global_engineer') return true;
    if (user?.role === 'regional_engineer') {
      const userRegion = regions.find(r => r.name === user.region);
      return userRegion && asset.regionId === userRegion.id;
    }
    if (user?.role === 'district_engineer' || user?.role === 'technician') {
      const userDistrict = districts.find(d => d.name === user.district);
      return userDistrict && asset.districtId === userDistrict.id;
    }
    return false;
  });

  return (
    <AccessControlWrapper type="asset">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">VIT Asset Management</h1>
          <Button asChild>
            <Link to="/asset-management/add">Add New Asset</Link>
          </Button>
        </div>
        
        <VITAssetList assets={filteredAssets} />
      </div>
    </AccessControlWrapper>
  );
} 