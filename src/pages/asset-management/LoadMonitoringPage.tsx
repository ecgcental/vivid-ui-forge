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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { FeederLeg, LoadMonitoringData } from "@/lib/asset-types";
import { useAuth } from "@/contexts/AuthContext";

export default function LoadMonitoringPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<LoadMonitoringData>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    region: user?.region || "",
    district: user?.district || "",
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

  // Add a new feeder leg
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

  // Remove a feeder leg
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

  // Update feeder leg values
  const updateFeederLeg = (id: string, field: keyof FeederLeg, value: number) => {
    setFormData(prev => ({
      ...prev,
      feederLegs: prev.feederLegs?.map(leg => 
        leg.id === id ? { ...leg, [field]: value } : leg
      ) || []
    }));
  };

  // Handle generic form input changes
  const handleInputChange = (field: keyof LoadMonitoringData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate load information
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

  // Update calculations whenever relevant form data changes
  useEffect(() => {
    if (!formData.rating || !formData.feederLegs?.length) return;

    const rating = Number(formData.rating);
    const feederLegs = formData.feederLegs || [];
    
    // Calculate bulk loads for each phase
    const redPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.redPhaseCurrent || 0), 0);
    const yellowPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.yellowPhaseCurrent || 0), 0);
    const bluePhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + Number(leg.bluePhaseCurrent || 0), 0);
    
    // Average current
    const averageCurrent = (redPhaseBulkLoad + yellowPhaseBulkLoad + bluePhaseBulkLoad) / 3;
    
    // Other calculations
    const ratedLoad = rating * 1.334;
    const percentageLoad = rating > 0 ? (averageCurrent * 100) / rating : 0;
    const tenPercentFullLoadNeutral = 0.1 * rating;
    
    // Calculate imbalance neutral current (using phase currents as vectors with 120° phase displacement)
    // This is a simplified calculation - in reality, you'd need to consider phase angles
    const redPhaseVector = redPhaseBulkLoad;
    const yellowPhaseVector = yellowPhaseBulkLoad * Math.cos(120 * Math.PI / 180);
    const bluePhaseVector = bluePhaseBulkLoad * Math.cos(240 * Math.PI / 180);
    const calculatedNeutral = Math.sqrt(
      Math.pow(redPhaseVector, 2) + 
      Math.pow(yellowPhaseVector, 2) + 
      Math.pow(bluePhaseVector, 2) +
      2 * redPhaseVector * yellowPhaseVector * Math.cos(120 * Math.PI / 180) +
      2 * redPhaseVector * bluePhaseVector * Math.cos(240 * Math.PI / 180) +
      2 * yellowPhaseVector * bluePhaseVector * Math.cos(120 * Math.PI / 180)
    );
    
    setLoadInfo({
      ratedLoad,
      redPhaseBulkLoad,
      yellowPhaseBulkLoad,
      bluePhaseBulkLoad,
      averageCurrent,
      percentageLoad,
      tenPercentFullLoadNeutral,
      calculatedNeutral
    });
  }, [formData.rating, formData.feederLegs]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine form data with calculated values
    const completeData: LoadMonitoringData = {
      ...(formData as Required<LoadMonitoringData>),
      ratedLoad: loadInfo.ratedLoad,
      redPhaseBulkLoad: loadInfo.redPhaseBulkLoad,
      yellowPhaseBulkLoad: loadInfo.yellowPhaseBulkLoad,
      bluePhaseBulkLoad: loadInfo.bluePhaseBulkLoad,
      averageCurrent: loadInfo.averageCurrent,
      percentageLoad: loadInfo.percentageLoad,
      tenPercentFullLoadNeutral: loadInfo.tenPercentFullLoadNeutral,
      calculatedNeutral: loadInfo.calculatedNeutral
    };
    
    // Log the data (would typically be sent to an API)
    console.log("Form submitted:", completeData);
    
    toast.success("Load monitoring data submitted successfully");
    
    // Reset form (except region/district which should stay the same for the user)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      region: user?.region || "",
      district: user?.district || "",
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
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Transformer Load Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Record and analyze transformer load metrics to ensure optimal performance
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Record when and where the load monitoring is taking place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      type="text"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Substation Information */}
            <Card>
              <CardHeader>
                <CardTitle>Substation Information</CardTitle>
                <CardDescription>
                  Enter details about the substation and transformer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Label htmlFor="rating">Rating (Amps)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rating || ''}
                      onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peakLoadStatus">Peak Load Status</Label>
                    <Select
                      value={formData.peakLoadStatus}
                      onValueChange={(value) => handleInputChange('peakLoadStatus', value as 'day' | 'night')}
                    >
                      <SelectTrigger id="peakLoadStatus">
                        <SelectValue placeholder="Select peak load status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feeder Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Feeder Information</CardTitle>
                  <CardDescription>
                    Record current readings for each feeder leg
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addFeederLeg}
                  disabled={(formData.feederLegs?.length || 0) >= 8}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Leg
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="legs" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="legs">
                      Feeder Legs ({formData.feederLegs?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="legs" className="space-y-4">
                    {formData.feederLegs?.map((leg, index) => (
                      <div key={leg.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">Leg {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeederLeg(leg.id)}
                            disabled={(formData.feederLegs?.length || 0) <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`red-${leg.id}`}>Red Phase Current (A)</Label>
                            <Input
                              id={`red-${leg.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={leg.redPhaseCurrent || ''}
                              onChange={(e) => updateFeederLeg(leg.id, 'redPhaseCurrent', Number(e.target.value))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`yellow-${leg.id}`}>Yellow Phase Current (A)</Label>
                            <Input
                              id={`yellow-${leg.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={leg.yellowPhaseCurrent || ''}
                              onChange={(e) => updateFeederLeg(leg.id, 'yellowPhaseCurrent', Number(e.target.value))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`blue-${leg.id}`}>Blue Phase Current (A)</Label>
                            <Input
                              id={`blue-${leg.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={leg.bluePhaseCurrent || ''}
                              onChange={(e) => updateFeederLeg(leg.id, 'bluePhaseCurrent', Number(e.target.value))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`neutral-${leg.id}`}>Neutral Current (A)</Label>
                            <Input
                              id={`neutral-${leg.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={leg.neutralCurrent || ''}
                              onChange={(e) => updateFeederLeg(leg.id, 'neutralCurrent', Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Load Information (Calculated) */}
            <Card>
              <CardHeader>
                <CardTitle>Load Information</CardTitle>
                <CardDescription>
                  Calculated load metrics based on input data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Calculations</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rated Load:</span>
                        <span className="font-medium">{loadInfo.ratedLoad.toFixed(2)} A</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bulk Load - Red Phase:</span>
                        <span className="font-medium">{loadInfo.redPhaseBulkLoad.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bulk Load - Yellow Phase:</span>
                        <span className="font-medium">{loadInfo.yellowPhaseBulkLoad.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bulk Load - Blue Phase:</span>
                        <span className="font-medium">{loadInfo.bluePhaseBulkLoad.toFixed(2)} A</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Current:</span>
                        <span className="font-medium">{loadInfo.averageCurrent.toFixed(2)} A</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Advanced Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Percentage Load on Transformer:</span>
                        <span className="font-medium">{loadInfo.percentageLoad.toFixed(2)}%</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">10% Full Load on Neutral:</span>
                        <span className="font-medium">{loadInfo.tenPercentFullLoadNeutral.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calculated Neutral (Imbalance):</span>
                        <span className="font-medium">{loadInfo.calculatedNeutral.toFixed(2)} A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Submit Load Monitoring Data
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
