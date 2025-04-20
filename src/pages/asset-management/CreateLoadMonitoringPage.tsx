import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { FeederLeg, LoadMonitoringData } from "@/lib/asset-types";
import { Region, District } from "@/lib/types"; // Import Region and District types
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";

export default function CreateLoadMonitoringPage() {
  const { user } = useAuth();
  const { saveLoadMonitoringRecord, regions, districts } = useData(); // Get regions & districts
  const navigate = useNavigate();

  // State for filtered districts based on selected region
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  const [formData, setFormData] = useState<Partial<LoadMonitoringData>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    regionId: "", // Add regionId
    districtId: "", // Add districtId
    region: "", // Keep region name
    district: "", // Keep district name
    substationName: "",
    substationNumber: "",
    location: "",
    rating: undefined,
    peakLoadStatus: "day",
    feederLegs: [
      {
        id: uuidv4(),
        redPhaseCurrent: 0,
        yellowPhaseCurrent: 0,
        bluePhaseCurrent: 0,
        neutralCurrent: 0
      }
    ]
  });

  // Pre-fill region/district if available from user context, and filter districts initially
  useEffect(() => {
    if (user?.region && regions) {
      const userRegion = regions.find(r => r.name === user.region);
      if (userRegion) {
        handleRegionChange(userRegion.id); // Use ID to trigger filtering
        setFormData(prev => ({ 
          ...prev, 
          regionId: userRegion.id,
          region: user.region 
        }));
        if (user?.district) {
          const userDistrict = districts.find(d => d.name === user.district && d.regionId === userRegion.id);
          if (userDistrict) {
            setFormData(prev => ({ 
              ...prev, 
              districtId: userDistrict.id,
              district: user.district 
            }));
          }
        }
      } else {
        setFilteredDistricts([]);
      }
    } else {
      setFilteredDistricts([]);
    }
  }, [user, regions, districts]);

  const [loadInfo, setLoadInfo] = useState({
    ratedLoad: 0,
    redPhaseBulkLoad: 0,
    yellowPhaseBulkLoad: 0,
    bluePhaseBulkLoad: 0,
    averageCurrent: 0,
    percentageLoad: 0,
    tenPercentFullLoadNeutral: 0,
    calculatedNeutral: 0
  });

  // --- Form Handling Functions ---
  const addFeederLeg = () => {
    if ((formData.feederLegs?.length || 0) >= 8) {
      toast.warning("Maximum of 8 feeder legs allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      feederLegs: [
        ...(prev.feederLegs || []),
        {
          id: uuidv4(),
          redPhaseCurrent: 0,
          yellowPhaseCurrent: 0,
          bluePhaseCurrent: 0,
          neutralCurrent: 0
        }
      ]
    }));
  };

  const removeFeederLeg = (id: string) => {
    if ((formData.feederLegs?.length || 0) <= 1) {
      toast.warning("At least one feeder leg is required");
      return;
    }
    setFormData(prev => ({
      ...prev,
      feederLegs: prev.feederLegs?.filter(leg => leg.id !== id) || []
    }));
  };

  const updateFeederLeg = (id: string, field: keyof FeederLeg, value: string) => {
    // Allow empty string temporarily, parse to number later or keep as 0 if empty
    const numericValue = value === '' ? 0 : parseFloat(value);
     // We might allow temporary NaN if user is typing, handle validation on submit

    setFormData(prev => ({
      ...prev,
      feederLegs: prev.feederLegs?.map(leg =>
        leg.id === id ? { ...leg, [field]: isNaN(numericValue) ? value : numericValue } : leg // Store string if NaN for typing
      ) || []
    }));
  };

  // Updated handleInputChange to ignore region/district (handled by selects)
  const handleInputChange = (field: keyof LoadMonitoringData, value: any) => {
    if (field === 'region' || field === 'district') return; // Ignore, handled by selects
    
    if (field === 'rating') {
       setFormData(prev => ({ ...prev, [field]: value === '' ? undefined : Number(value) }));
    } else {
       setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle Region Change - Filter Districts and Update Form Data
  const handleRegionChange = (regionId: string) => {
    const selectedRegion = regions?.find(r => r.id === regionId);
    if (selectedRegion && districts) {
      const regionDistricts = districts.filter(d => d.regionId === regionId);
      setFilteredDistricts(regionDistricts);
      setFormData(prev => ({
        ...prev,
        regionId: regionId, // Store region ID
        region: selectedRegion.name, // Store region name
        districtId: "", // Reset district ID
        district: "" // Reset district name
      }));
    } else {
      setFilteredDistricts([]);
    }
  };

  // Handle District Change
  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = districts?.find(d => d.id === districtId);
    if (selectedDistrict) {
      setFormData(prev => ({
        ...prev,
        districtId: districtId, // Store district ID
        district: selectedDistrict.name // Store district name
      }));
    }
  };

  // --- Load Calculation Logic ---
   useEffect(() => {
    const rating = Number(formData.rating); // Will be NaN if formData.rating is undefined
    const feederLegs = formData.feederLegs || [];

    // Ensure all feeder leg currents are valid numbers before calculating
    const areFeederCurrentsValid = feederLegs.every(leg =>
        typeof leg.redPhaseCurrent === 'number' && !isNaN(leg.redPhaseCurrent) &&
        typeof leg.yellowPhaseCurrent === 'number' && !isNaN(leg.yellowPhaseCurrent) &&
        typeof leg.bluePhaseCurrent === 'number' && !isNaN(leg.bluePhaseCurrent) &&
        typeof leg.neutralCurrent === 'number' && !isNaN(leg.neutralCurrent)
    );


    if (isNaN(rating) || rating <= 0 || feederLegs.length === 0 || !areFeederCurrentsValid) {
      // Reset calculations if rating is invalid, 0, or no feeder legs or currents are invalid
      setLoadInfo({
        ratedLoad: 0,
        redPhaseBulkLoad: 0,
        yellowPhaseBulkLoad: 0,
        bluePhaseBulkLoad: 0,
        averageCurrent: 0,
        percentageLoad: 0,
        tenPercentFullLoadNeutral: 0,
        calculatedNeutral: 0
      });
      return;
    }

    // Proceed with calculations only if inputs are valid
    const redPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.redPhaseCurrent), 0);
    const yellowPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.yellowPhaseCurrent), 0);
    const bluePhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.bluePhaseCurrent), 0);

    const averageCurrent = (redPhaseBulkLoad + yellowPhaseBulkLoad + bluePhaseBulkLoad) / 3;
    const ratedLoad = rating * 1.334;
    const percentageLoad = ratedLoad > 0 ? (averageCurrent * 100) / ratedLoad : 0;
    const tenPercentFullLoadNeutral = 0.1 * ratedLoad;

    // Simplified neutral calculation
    const calculatedNeutral = Math.sqrt(
       Math.max(0, // Ensure result is not negative
          Math.pow(redPhaseBulkLoad, 2) +
          Math.pow(yellowPhaseBulkLoad, 2) +
          Math.pow(bluePhaseBulkLoad, 2) -
          (redPhaseBulkLoad * yellowPhaseBulkLoad) -
          (redPhaseBulkLoad * bluePhaseBulkLoad) -
          (yellowPhaseBulkLoad * bluePhaseBulkLoad)
       )
    );

    setLoadInfo({
      ratedLoad,
      redPhaseBulkLoad,
      yellowPhaseBulkLoad,
      bluePhaseBulkLoad,
      averageCurrent,
      percentageLoad,
      tenPercentFullLoadNeutral,
      calculatedNeutral: isNaN(calculatedNeutral) ? 0 : calculatedNeutral
    });
  }, [formData.rating, formData.feederLegs]);


  // --- Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

     // Validate all feeder leg currents are numbers
    const invalidFeeder = formData.feederLegs?.find(leg =>
        isNaN(Number(leg.redPhaseCurrent)) || isNaN(Number(leg.yellowPhaseCurrent)) ||
        isNaN(Number(leg.bluePhaseCurrent)) || isNaN(Number(leg.neutralCurrent))
    );

    if (invalidFeeder) {
        toast.error("Please ensure all feeder leg currents are valid numbers.");
        return;
    }


    if (!formData.date || !formData.time || !formData.regionId || !formData.districtId || !formData.region || !formData.district || !formData.substationName || !formData.substationNumber || formData.rating === undefined || formData.rating <= 0 || !formData.feederLegs) {
      toast.error("Please fill all required fields, including a valid rating (KVA > 0).");
      return;
    }


    // Ensure feeder legs currents are numbers before saving
    const processedFeederLegs = formData.feederLegs.map(leg => ({
        ...leg,
        redPhaseCurrent: Number(leg.redPhaseCurrent),
        yellowPhaseCurrent: Number(leg.yellowPhaseCurrent),
        bluePhaseCurrent: Number(leg.bluePhaseCurrent),
        neutralCurrent: Number(leg.neutralCurrent),
    }));


    // Construct the data object to save, ensuring all required fields are present and correctly typed
    const completeData: Omit<LoadMonitoringData, 'id'> = {
      date: formData.date,
      time: formData.time,
      regionId: formData.regionId, // Add regionId
      districtId: formData.districtId, // Add districtId
      region: formData.region,
      district: formData.district,
      substationName: formData.substationName,
      substationNumber: formData.substationNumber,
      location: formData.location || "", // Ensure location is string
      rating: formData.rating, // Already validated as number > 0
      peakLoadStatus: formData.peakLoadStatus || "day", // Default if somehow missing
      feederLegs: processedFeederLegs, // Use processed legs
      // Add calculated fields
      ratedLoad: loadInfo.ratedLoad,
      redPhaseBulkLoad: loadInfo.redPhaseBulkLoad,
      yellowPhaseBulkLoad: loadInfo.yellowPhaseBulkLoad,
      bluePhaseBulkLoad: loadInfo.bluePhaseBulkLoad,
      averageCurrent: loadInfo.averageCurrent,
      percentageLoad: loadInfo.percentageLoad,
      tenPercentFullLoadNeutral: loadInfo.tenPercentFullLoadNeutral,
      calculatedNeutral: loadInfo.calculatedNeutral
    };


    if (saveLoadMonitoringRecord) {
      saveLoadMonitoringRecord(completeData);
      // Toast is handled in DataContext
      navigate("/asset-management/load-monitoring"); // Navigate back to list after save
    } else {
      toast.error("Failed to save data. Context function not available.");
    }
  };

 return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Load Record</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to record transformer load metrics.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Record when and where the load monitoring is taking place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Date, Time Inputs */}
                   <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                    />
                  </div>
                  {/* Region Select */}
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={formData.regionId || ""}
                      onValueChange={handleRegionChange}
                      required
                      disabled={user?.role === "district_engineer" || user?.role === "regional_engineer" || user?.role === "technician"}
                    >
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions?.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* District Select */}
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select
                      value={formData.districtId || ""} // Use ID for value
                      onValueChange={handleDistrictChange} // Use custom handler
                      required
                      disabled={user?.role === "district_engineer" || user?.role === "technician" || !formData.regionId || filteredDistricts.length === 0} // Disable for district engineers or if no region/districts
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDistricts.map((district) => (
                          <SelectItem key={district.id} value={district.id}> {/* Use id for value */} 
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   {/* Substation Name, Number, Location, Rating Inputs */}
                  <div className="space-y-2">
                    <Label htmlFor="substationName">Substation Name</Label>
                    <Input
                      id="substationName"
                      type="text"
                      value={formData.substationName || ''}
                      onChange={(e) => handleInputChange('substationName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="substationNumber">Substation Number</Label>
                    <Input
                      id="substationNumber"
                      type="text"
                      value={formData.substationNumber || ''}
                      onChange={(e) => handleInputChange('substationNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (KVA)</Label>
                    <Input
                      id="rating"
                      type="number"
                      value={formData.rating ?? ''} // Use ?? to handle undefined for controlled input
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                      min="0"
                      placeholder="Enter KVA rating"
                      required
                    />
                  </div>
                   {/* Peak Load Status Select */}
                   <div className="space-y-2">
                    <Label htmlFor="peakLoadStatus">Peak Load Status</Label>
                    <Select
                      value={formData.peakLoadStatus}
                      onValueChange={(value) => handleInputChange('peakLoadStatus', value as 'day' | 'night')}
                    >
                      <SelectTrigger id="peakLoadStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day Peak</SelectItem>
                        <SelectItem value="night">Night Peak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feeder Legs Card */}
             <Card>
              <CardHeader>
                <CardTitle>Feeder Legs Current (Amps)</CardTitle>
                <CardDescription>Enter current readings for each feeder leg. Maximum 8 legs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.feederLegs?.map((leg, index) => (
                    <div key={leg.id} className="grid grid-cols-5 gap-4 items-center border p-4 rounded-md">
                      <Label className="col-span-5 font-medium">Feeder Leg {index + 1}</Label>
                      <div className="space-y-1">
                        <Label htmlFor={`red-${leg.id}`}>Red Phase</Label>
                        <Input
                          id={`red-${leg.id}`}
                          type="number"
                          value={leg.redPhaseCurrent}
                          onChange={(e) => updateFeederLeg(leg.id, 'redPhaseCurrent', e.target.value)}
                          placeholder="Amps"
                          min="0"
                          step="any" // Allow decimals
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`yellow-${leg.id}`}>Yellow Phase</Label>
                        <Input
                          id={`yellow-${leg.id}`}
                          type="number"
                          value={leg.yellowPhaseCurrent}
                          onChange={(e) => updateFeederLeg(leg.id, 'yellowPhaseCurrent', e.target.value)}
                          placeholder="Amps"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`blue-${leg.id}`}>Blue Phase</Label>
                        <Input
                          id={`blue-${leg.id}`}
                          type="number"
                          value={leg.bluePhaseCurrent}
                          onChange={(e) => updateFeederLeg(leg.id, 'bluePhaseCurrent', e.target.value)}
                          placeholder="Amps"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`neutral-${leg.id}`}>Neutral</Label>
                        <Input
                          id={`neutral-${leg.id}`}
                          type="number"
                          value={leg.neutralCurrent}
                          onChange={(e) => updateFeederLeg(leg.id, 'neutralCurrent', e.target.value)}
                          placeholder="Amps"
                          min="0"
                          step="any"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeederLeg(leg.id)}
                        disabled={(formData.feederLegs?.length || 0) <= 1}
                        className="justify-self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeederLeg}
                  className="mt-4"
                  disabled={(formData.feederLegs?.length || 0) >= 8}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Feeder Leg
                </Button>
              </CardContent>
            </Card>

            {/* Calculated Load Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Calculated Load Information</CardTitle>
                <CardDescription>Automatically calculated based on your inputs.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {/* Display calculated values */}
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Rated Load (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.ratedLoad.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Avg. Current (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.averageCurrent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">% Load</Label>
                  <p className="text-lg font-semibold">{loadInfo.percentageLoad.toFixed(2)} %</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Calculated Neutral (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.calculatedNeutral.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">10% Rated Neutral (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.tenPercentFullLoadNeutral.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Red Phase Bulk (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.redPhaseBulkLoad.toFixed(2)}</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Yellow Phase Bulk (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.yellowPhaseBulkLoad.toFixed(2)}</p>
                </div>
                 <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium text-muted-foreground">Blue Phase Bulk (A)</Label>
                  <p className="text-lg font-semibold">{loadInfo.bluePhaseBulkLoad.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/asset-management/load-monitoring")}>
                    Cancel
                </Button>
                <Button type="submit">
                    Save Record
                </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
