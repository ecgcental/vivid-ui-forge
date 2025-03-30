
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";
import { FaultType } from "@/lib/types";
import { 
  calculateOutageDuration, 
  calculateMTTR, 
  calculateSAIDI,
  calculateSAIFI,
  calculateCAIDI
} from "@/utils/calculations";
import { toast } from "@/components/ui/sonner";

export function OP5Form() {
  const { regions, districts, addOP5Fault } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionId, setRegionId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [occurrenceDate, setOccurrenceDate] = useState<string>("");
  const [faultType, setFaultType] = useState<FaultType>("Unplanned");
  const [faultLocation, setFaultLocation] = useState<string>("");
  const [restorationDate, setRestorationDate] = useState<string>("");
  const [ruralAffected, setRuralAffected] = useState<number>(0);
  const [urbanAffected, setUrbanAffected] = useState<number>(0);
  const [metroAffected, setMetroAffected] = useState<number>(0);
  
  // Derived values
  const [outageDuration, setOutageDuration] = useState<number | null>(null);
  const [mttr, setMttr] = useState<number | null>(null);
  const [saidi, setSaidi] = useState<number | null>(null);
  const [saifi, setSaifi] = useState<number | null>(null);
  const [caidi, setCaidi] = useState<number | null>(null);
  
  // Filter regions and districts based on user role
  const filteredRegions = user?.role === "global_engineer" 
    ? regions 
    : regions.filter(r => user?.region ? r.name === user.region : true);
  
  const filteredDistricts = regionId
    ? districts.filter(d => d.regionId === regionId && (
        user?.role === "district_engineer" 
          ? user.district === d.name 
          : true
      ))
    : [];
  
  // Set default values based on user
  useEffect(() => {
    if (user) {
      if (user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) setRegionId(userRegion.id);
      }
      
      if (user.district) {
        const userDistrict = districts.find(d => d.name === user.district);
        if (userDistrict) setDistrictId(userDistrict.id);
      }
    }
  }, [user, regions, districts]);
  
  // Calculate metrics when dates change
  useEffect(() => {
    if (occurrenceDate && restorationDate) {
      // Ensure restoration date is after occurrence date
      if (new Date(restorationDate) <= new Date(occurrenceDate)) {
        toast.error("Restoration date must be after occurrence date");
        return;
      }
      
      const duration = calculateOutageDuration(occurrenceDate, restorationDate);
      setOutageDuration(duration);
      
      // Mock calculation for demo
      setMttr(duration * 0.95);
      
      const totalAffected = ruralAffected + urbanAffected + metroAffected;
      const district = districts.find(d => d.id === districtId);
      if (district) {
        const totalPopulation = district.population.rural + district.population.urban + district.population.metro;
        
        // For demo we'll use simplified calculation
        const calculatedSaidi = calculateSAIDI(
          [{ occurrenceDate, restorationDate, affectedCustomers: totalAffected }],
          totalPopulation
        );
        setSaidi(calculatedSaidi);
        
        const calculatedSaifi = calculateSAIFI(
          [{ affectedCustomers: totalAffected }],
          totalPopulation
        );
        setSaifi(calculatedSaifi);
        
        setCaidi(calculateCAIDI(calculatedSaidi, calculatedSaifi));
      }
    }
  }, [occurrenceDate, restorationDate, ruralAffected, urbanAffected, metroAffected, districtId, districts]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!occurrenceDate || !faultType || !faultLocation || !regionId || !districtId) {
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
      addOP5Fault({
        regionId,
        districtId,
        occurrenceDate,
        faultType,
        faultLocation,
        restorationDate: restorationDate || new Date().toISOString(), // Use current time if not set
        affectedPopulation: {
          rural: ruralAffected,
          urban: urbanAffected,
          metro: metroAffected
        },
        outrageDuration: outageDuration || 0,
        mttr: mttr || 0,
        reliabilityIndices: {
          saidi: saidi || 0,
          saifi: saifi || 0,
          caidi: caidi || 0
        }
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting OP5 fault:", error);
      toast.error("Failed to submit fault report");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>OP5 Fault Report</CardTitle>
        <CardDescription>
          Report a fault in the OP5 system with detailed information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select 
                value={regionId} 
                onValueChange={setRegionId}
                disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                required
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select 
                value={districtId} 
                onValueChange={setDistrictId}
                disabled={user?.role === "district_engineer" || !regionId}
                required
              >
                <SelectTrigger>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="occurrenceDate">Fault Occurrence Date & Time</Label>
              <Input
                id="occurrenceDate"
                type="datetime-local"
                value={occurrenceDate}
                onChange={(e) => setOccurrenceDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faultType">Type of Fault</Label>
              <Select value={faultType} onValueChange={(value) => setFaultType(value as FaultType)} required>
                <SelectTrigger>
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
          
          <div className="space-y-2">
            <Label htmlFor="faultLocation">Fault Location</Label>
            <Input
              id="faultLocation"
              type="text"
              placeholder="E.g., Transformer T5 on Main Street"
              value={faultLocation}
              onChange={(e) => setFaultLocation(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="restorationDate">Fault Restoration Date & Time</Label>
            <Input
              id="restorationDate"
              type="datetime-local"
              value={restorationDate}
              onChange={(e) => setRestorationDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if the fault is still active
            </p>
          </div>
          
          <Tabs defaultValue="affected">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="affected">Affected Population</TabsTrigger>
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
            </TabsList>
            <TabsContent value="affected" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ruralAffected">Rural Population Affected</Label>
                  <Input
                    id="ruralAffected"
                    type="number"
                    min="0"
                    value={ruralAffected}
                    onChange={(e) => setRuralAffected(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urbanAffected">Urban Population Affected</Label>
                  <Input
                    id="urbanAffected"
                    type="number"
                    min="0"
                    value={urbanAffected}
                    onChange={(e) => setUrbanAffected(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metroAffected">Metro Population Affected</Label>
                  <Input
                    id="metroAffected"
                    type="number"
                    min="0"
                    value={metroAffected}
                    onChange={(e) => setMetroAffected(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calculations" className="pt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="outageDuration">Outage Duration</Label>
                    <div className="bg-muted rounded-md p-2 text-sm">
                      {outageDuration !== null 
                        ? `${Math.floor(outageDuration / 60)} hours ${outageDuration % 60} minutes` 
                        : "Not calculated yet"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mttr">MTTR (Mean Time To Repair)</Label>
                    <div className="bg-muted rounded-md p-2 text-sm">
                      {mttr !== null 
                        ? `${Math.floor(mttr / 60)} hours ${Math.round(mttr % 60)} minutes` 
                        : "Not calculated yet"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Reliability Indices</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-muted rounded-md p-2 text-sm">
                      <div className="font-medium">SAIDI</div>
                      <div>{saidi !== null ? saidi.toFixed(2) : "Not calculated yet"}</div>
                    </div>
                    
                    <div className="bg-muted rounded-md p-2 text-sm">
                      <div className="font-medium">SAIFI</div>
                      <div>{saifi !== null ? saifi.toFixed(2) : "Not calculated yet"}</div>
                    </div>
                    
                    <div className="bg-muted rounded-md p-2 text-sm">
                      <div className="font-medium">CAIDI</div>
                      <div>{caidi !== null ? caidi.toFixed(2) : "Not calculated yet"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Fault Report"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
