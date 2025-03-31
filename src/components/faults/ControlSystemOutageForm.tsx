
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, InfoIcon, Users, MapPin, Calculator } from "lucide-react";
import { FaultType } from "@/lib/types";
import { 
  calculateDurationHours,
  calculateUnservedEnergy
} from "@/utils/calculations";
import { toast } from "@/components/ui/sonner";

interface ControlSystemOutageFormProps {
  defaultRegionId?: string;
  defaultDistrictId?: string;
}

export function ControlSystemOutageForm({ defaultRegionId = "", defaultDistrictId = "" }: ControlSystemOutageFormProps) {
  const { regions, districts, addControlOutage } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionId, setRegionId] = useState<string>(defaultRegionId);
  const [districtId, setDistrictId] = useState<string>(defaultDistrictId);
  const [occurrenceDate, setOccurrenceDate] = useState<string>("");
  const [faultType, setFaultType] = useState<FaultType>("Unplanned");
  const [ruralAffected, setRuralAffected] = useState<number>(0);
  const [urbanAffected, setUrbanAffected] = useState<number>(0);
  const [metroAffected, setMetroAffected] = useState<number>(0);
  const [restorationDate, setRestorationDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [indications, setIndications] = useState<string>("");
  const [areaAffected, setAreaAffected] = useState<string>("");
  const [loadMW, setLoadMW] = useState<number>(0);
  
  // Derived values
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [unservedEnergyMWh, setUnservedEnergyMWh] = useState<number | null>(null);
  
  // Update region and district when props change
  useEffect(() => {
    if (defaultRegionId) {
      setRegionId(defaultRegionId);
    }
    
    if (defaultDistrictId) {
      setDistrictId(defaultDistrictId);
    }
  }, [defaultRegionId, defaultDistrictId]);
  
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
  
  // Calculate metrics when dates or load changes
  useEffect(() => {
    if (occurrenceDate && restorationDate && loadMW > 0) {
      // Ensure restoration date is after occurrence date
      if (new Date(restorationDate) <= new Date(occurrenceDate)) {
        toast.error("Restoration date must be after occurrence date");
        return;
      }
      
      const duration = calculateDurationHours(occurrenceDate, restorationDate);
      setDurationHours(duration);
      
      const unservedEnergy = calculateUnservedEnergy(loadMW, duration);
      setUnservedEnergyMWh(unservedEnergy);
    }
  }, [occurrenceDate, restorationDate, loadMW]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!occurrenceDate || !faultType || !regionId || !districtId || !loadMW) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Validate that restoration date is after occurrence date
    if (restorationDate && new Date(restorationDate) <= new Date(occurrenceDate)) {
      toast.error("Restoration date must be after occurrence date");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addControlOutage({
        regionId,
        districtId,
        occurrenceDate,
        faultType,
        restorationDate: restorationDate || new Date().toISOString(), // Use current time if not set
        customersAffected: {
          rural: ruralAffected,
          urban: urbanAffected,
          metro: metroAffected
        },
        reason,
        controlPanelIndications: indications,
        areaAffected,
        loadMW,
        unservedEnergyMWh: unservedEnergyMWh || 0
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting control system outage:", error);
      toast.error("Failed to submit outage report");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-serif">Control System Outage Report</CardTitle>
        <CardDescription>
          Report a control system outage with detailed information
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="region" className="text-base font-medium">Region</Label>
              <Select 
                value={regionId} 
                onValueChange={setRegionId}
                disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
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
                disabled={user?.role === "district_engineer" || !regionId}
                required
              >
                <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {regionId && districts
                    .filter(d => d.regionId === regionId)
                    .map(district => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="occurrenceDate" className="text-base font-medium">Outage Occurrence Date & Time</Label>
              <Input
                id="occurrenceDate"
                type="datetime-local"
                value={occurrenceDate}
                onChange={(e) => setOccurrenceDate(e.target.value)}
                required
                className="h-12 text-base bg-background/50 border-muted"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="faultType" className="text-base font-medium">Type of Fault</Label>
              <Select value={faultType} onValueChange={(value) => setFaultType(value as FaultType)} required>
                <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
                  <SelectValue placeholder="Select fault type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Unplanned">Unplanned</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Load Shedding">Load Shedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="affected" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger value="affected" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Users className="h-4 w-4 mr-2" />
                Affected Customers
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MapPin className="h-4 w-4 mr-2" />
                Outage Details
              </TabsTrigger>
              <TabsTrigger value="calculations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Calculator className="h-4 w-4 mr-2" />
                Calculations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="affected" className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="ruralAffected" className="font-medium flex items-center">
                    Rural Customers Affected
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                  </Label>
                  <Input
                    id="ruralAffected"
                    type="number"
                    min="0"
                    value={ruralAffected}
                    onChange={(e) => setRuralAffected(parseInt(e.target.value) || 0)}
                    className="bg-background/50 border-muted"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="urbanAffected" className="font-medium flex items-center">
                    Urban Customers Affected
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                  </Label>
                  <Input
                    id="urbanAffected"
                    type="number"
                    min="0"
                    value={urbanAffected}
                    onChange={(e) => setUrbanAffected(parseInt(e.target.value) || 0)}
                    className="bg-background/50 border-muted"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="metroAffected" className="font-medium flex items-center">
                    Metro Customers Affected
                    <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                  </Label>
                  <Input
                    id="metroAffected"
                    type="number"
                    min="0"
                    value={metroAffected}
                    onChange={(e) => setMetroAffected(parseInt(e.target.value) || 0)}
                    className="bg-background/50 border-muted"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="reason" className="text-base font-medium">Reason for Outage</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe the reason for the outage"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="bg-background/50 border-muted"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="indications" className="text-base font-medium">Indications on Control Panel</Label>
                <Textarea
                  id="indications"
                  placeholder="Describe the indications observed on the control panel"
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  rows={2}
                  className="bg-background/50 border-muted"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="areaAffected" className="text-base font-medium">Area Affected</Label>
                <Input
                  id="areaAffected"
                  type="text"
                  placeholder="E.g., North Sector, Industrial Zone"
                  value={areaAffected}
                  onChange={(e) => setAreaAffected(e.target.value)}
                  className="h-12 text-base bg-background/50 border-muted"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="loadMW" className="text-base font-medium">Load in MW</Label>
                <Input
                  id="loadMW"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Load in megawatts"
                  value={loadMW}
                  onChange={(e) => setLoadMW(parseFloat(e.target.value) || 0)}
                  required
                  className="h-12 text-base bg-background/50 border-muted"
                />
              </div>

              {/* Moved Restoration Date & Time to details tab */}
              <div className="space-y-3">
                <Label htmlFor="restorationDate" className="text-base font-medium">Restoration Date & Time</Label>
                <Input
                  id="restorationDate"
                  type="datetime-local"
                  value={restorationDate}
                  onChange={(e) => setRestorationDate(e.target.value)}
                  className="h-12 text-base bg-background/50 border-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if the outage is still active
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="calculations" className="pt-6">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="durationHours" className="font-medium">Duration of Outage</Label>
                    <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted">
                      {durationHours !== null 
                        ? `${durationHours.toFixed(2)} hours` 
                        : "Not calculated yet"}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="unservedEnergyMWh" className="font-medium">Unserved Energy (MWh)</Label>
                    <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted">
                      {unservedEnergyMWh !== null 
                        ? `${unservedEnergyMWh.toFixed(2)} MWh` 
                        : "Not calculated yet"}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="px-0 pt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Outage Report"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
