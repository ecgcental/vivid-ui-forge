
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter } from "lucide-react";
import { useState, useEffect } from "react";

type FilterBarProps = {
  setFilterRegion: (id: string | undefined) => void;
  setFilterDistrict: (id: string | undefined) => void;
  setFilterStatus: (status: "all" | "active" | "resolved") => void;
  filterStatus: "all" | "active" | "resolved";
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function FilterBar({ 
  setFilterRegion, 
  setFilterDistrict, 
  setFilterStatus,
  filterStatus,
  onRefresh,
  isRefreshing
}: FilterBarProps) {
  const { regions, districts } = useData();
  const { user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined);
  
  // Set initial filter based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "district_engineer" && user.district && user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setSelectedRegion(userRegion.id);
          setFilterRegion(userRegion.id);
          
          const userDistrict = districts.find(d => d.name === user.district);
          if (userDistrict) {
            setSelectedDistrict(userDistrict.id);
            setFilterDistrict(userDistrict.id);
          }
        }
      } else if (user.role === "regional_engineer" && user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setSelectedRegion(userRegion.id);
          setFilterRegion(userRegion.id);
        }
      }
    }
  }, [user, regions, districts, setFilterRegion, setFilterDistrict]);
  
  const handleRegionChange = (value: string) => {
    if (value === "all") {
      setSelectedRegion(undefined);
      setFilterRegion(undefined);
      setSelectedDistrict(undefined);
      setFilterDistrict(undefined);
    } else {
      setSelectedRegion(value);
      setFilterRegion(value);
      setSelectedDistrict(undefined);
      setFilterDistrict(undefined);
    }
  };
  
  const handleDistrictChange = (value: string) => {
    if (value === "all") {
      setSelectedDistrict(undefined);
      setFilterDistrict(undefined);
    } else {
      setSelectedDistrict(value);
      setFilterDistrict(value);
    }
  };
  
  const filteredDistricts = selectedRegion 
    ? districts.filter(d => d.regionId === selectedRegion)
    : [];
  
  return (
    <div className="bg-white p-4 rounded-lg border mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter size={18} className="mr-2" />
          Filter Faults
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region-filter">Region</Label>
          <Select 
            value={selectedRegion} 
            onValueChange={handleRegionChange}
            disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
          >
            <SelectTrigger id="region-filter">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem 
                  key={region.id} 
                  value={region.id}
                  disabled={user?.role === "regional_engineer" && user.region !== region.name}
                >
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="district-filter">District</Label>
          <Select 
            value={selectedDistrict} 
            onValueChange={handleDistrictChange}
            disabled={!selectedRegion || user?.role === "district_engineer"}
          >
            <SelectTrigger id="district-filter">
              <SelectValue placeholder={selectedRegion ? "All Districts" : "Select Region First"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {filteredDistricts.map(district => (
                <SelectItem 
                  key={district.id} 
                  value={district.id}
                  disabled={user?.role === "district_engineer" && user.district !== district.name}
                >
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "all" | "active" | "resolved")}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="resolved">Resolved Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
