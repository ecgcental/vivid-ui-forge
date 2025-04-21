
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from '@/hooks/useControlOutageForm';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export const LocationSection = () => {
  const { user } = useAuth();
  const { regions, districts } = useData();
  const { regionId, districtId, setRegionId, setDistrictId } = useFormContext();
  
  const filteredRegions = user?.role === "global_engineer" 
    ? regions 
    : regions.filter(r => user?.region ? r.name === user.region : true);
    
  const filteredDistricts = regionId
    ? districts.filter(d => {
        if (d.regionId !== regionId) return false;
        if (user?.role === "district_engineer" || user?.role === "technician") {
          return d.name === user.district;
        }
        return true;
      })
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <Label htmlFor="region" className="text-base font-medium">Region</Label>
        <Select 
          value={regionId} 
          onValueChange={setRegionId}
          disabled={user?.role === "district_engineer" || user?.role === "regional_engineer" || user?.role === "technician"}
          required
        >
          <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {filteredRegions.map(region => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="district" className="text-base font-medium">District</Label>
        <Select 
          value={districtId} 
          onValueChange={setDistrictId}
          disabled={user?.role === "district_engineer" || user?.role === "technician" || !regionId}
          required
        >
          <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {filteredDistricts.map(district => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
