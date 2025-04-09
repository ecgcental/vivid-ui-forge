import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VITAsset, VITStatus, VoltageLevel } from "@/lib/types";
import { Loader2, MapPin } from "lucide-react";

interface VITAssetFormProps {
  asset?: VITAsset;
  onSubmit: () => void;
  onCancel: () => void;
}

export function VITAssetForm({ asset, onSubmit, onCancel }: VITAssetFormProps) {
  const { regions, districts, addVITAsset, updateVITAsset } = useData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Form fields
  const [regionId, setRegionId] = useState(asset?.regionId || "");
  const [districtId, setDistrictId] = useState(asset?.districtId || "");
  const [voltageLevel, setVoltageLevel] = useState<VoltageLevel>(asset?.voltageLevel || "11KV");
  const [typeOfUnit, setTypeOfUnit] = useState(asset?.typeOfUnit || "");
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber || "");
  const [location, setLocation] = useState(asset?.location || "");
  const [gpsCoordinates, setGpsCoordinates] = useState(asset?.gpsCoordinates || "");
  const [status, setStatus] = useState<VITStatus>(asset?.status || "Operational");
  const [protection, setProtection] = useState(asset?.protection || "");
  const [photoUrl, setPhotoUrl] = useState(asset?.photoUrl || "");

  // Initialize region and district based on user role
  useEffect(() => {
    if (!asset && user) {
      if (user.role === "district_engineer" || user.role === "regional_engineer") {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setRegionId(userRegion.id);
          
          if (user.role === "district_engineer" && user.district) {
            const userDistrict = districts.find(d => d.name === user.district);
            if (userDistrict) {
              setDistrictId(userDistrict.id);
            }
          }
        }
      }
    }
  }, [asset, user, regions, districts]);

  // Filter regions and districts based on user role
  const filteredRegions = user?.role === "global_engineer"
    ? regions
    : regions.filter(r => user?.region ? r.name === user.region : true);
  
  const filteredDistricts = regionId
    ? districts.filter(d => {
        const region = regions.find(r => r.id === regionId);
        return region?.districts.some(rd => rd.id === d.id) && (
          user?.role === "district_engineer" 
            ? user.district === d.name 
            : true
        );
      })
    : [];
  
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsCoordinates(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
          alert("Could not get your location. Please enter GPS coordinates manually.");
        }
      );
    } else {
      setIsGettingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regionId || !districtId || !serialNumber || !typeOfUnit || !location || !voltageLevel) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const assetData = {
        regionId,
        districtId,
        voltageLevel,
        typeOfUnit,
        serialNumber,
        location,
        gpsCoordinates,
        status,
        protection,
        photoUrl
      };
      
      if (asset) {
        // Update existing asset
        updateVITAsset(asset.id, assetData);
      } else {
        // Add new asset
        addVITAsset(assetData);
      }
      
      onSubmit();
    } catch (error) {
      console.error("Error submitting VIT asset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{asset ? "Edit VIT Asset" : "Add New VIT Asset"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select 
                value={regionId} 
                onValueChange={setRegionId}
                disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                required
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegions.map(region => (
                    <SelectItem key={region.id} value={region.id || "unknown-region"}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select 
                value={districtId} 
                onValueChange={setDistrictId}
                disabled={user?.role === "district_engineer" || !regionId}
                required
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map(district => (
                    <SelectItem key={district.id} value={district.id || "unknown-district"}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voltageLevel">Voltage Level *</Label>
              <Select 
                value={voltageLevel} 
                onValueChange={(val) => setVoltageLevel(val as VoltageLevel)}
                required
              >
                <SelectTrigger id="voltageLevel">
                  <SelectValue placeholder="Select voltage level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11KV">11KV</SelectItem>
                  <SelectItem value="33KV">33KV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={status} 
                onValueChange={(val) => setStatus(val as VITStatus)}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Faulty">Faulty</SelectItem>
                  <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeOfUnit">Type of Unit *</Label>
              <Input
                id="typeOfUnit"
                value={typeOfUnit}
                onChange={(e) => setTypeOfUnit(e.target.value)}
                placeholder="E.g., Ring Main Unit, Circuit Breaker"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="E.g., RMU2023-001"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="E.g., Main Street Substation"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
            <div className="flex gap-2">
              <Input
                id="gpsCoordinates"
                value={gpsCoordinates}
                onChange={(e) => setGpsCoordinates(e.target.value)}
                placeholder="Latitude, Longitude"
                className="flex-1"
              />
              <Button 
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <MapPin className="h-4 w-4 mr-1" />
                )}
                Get Location
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="protection">Protection</Label>
            <Input
              id="protection"
              value={protection}
              onChange={(e) => setProtection(e.target.value)}
              placeholder="E.g., Overcurrent, Earth Fault"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="URL to asset photo (if available)"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {asset ? "Updating..." : "Adding..."}
            </>
          ) : (
            asset ? "Update Asset" : "Add Asset"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
