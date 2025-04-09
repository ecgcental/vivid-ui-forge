import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { SubstationInspectionData, ConditionStatus, InspectionItem } from "@/lib/asset-types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function SubstationInspectionPage() {
  const { user } = useAuth();
  const { saveInspection } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");

  // Initial list of inspection items without preset status
  const initialInspectionItems: InspectionItem[] = [
    // 1. GENERAL BUILDING
    { id: uuidv4(), category: "general", name: "House keeping", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Paintwork", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Roof leakage", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Doors locks/Hinges", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Washroom Cleanliness", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Toilet Facility condition", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Water flow/ availability", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "AC Unit working", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Inside Lighting", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Fire Extinguisher available/In good condition", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "general", name: "Logo and signboard available and on equipments", status: "" as ConditionStatus, remarks: "" },
    
    // 2. CONTROL EQUIPMENT
    { id: uuidv4(), category: "control", name: "Control Cabinet Clean", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "General outlook of cable termination 11KV", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "General outlook of cable termination 33KV", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Ammeters/Voltmeters functioning", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Annunciators functioning", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Heaters operation ok", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Labelling Clear", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Alarm", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "SF6 gas level", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "All closing Spring Charge motor working", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Relay flags/Indication", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Semaphore indications", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Battery bank outlook", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Battery electrolyte level", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "control", name: "Battery voltage", status: "" as ConditionStatus, remarks: "" },
    
    // 3. POWER TRANSFORMER
    { id: uuidv4(), category: "transformer", name: "General outlook, No corrosion of fans, radiators", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Transformer bushing (check for flashover or dirt)", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Oil Level gauge", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Oil leakage", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Themometer ok", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Gas presure indicator working", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Silica gel OK", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Trafo body earthed/grounded", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Neutral point earthed/grounded", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Fans operating correctly", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "OLTC Oil level", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Any leakage OLTC OK", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "transformer", name: "Heaters in OLTC, Marshalling box working", status: "" as ConditionStatus, remarks: "" },
    
    // 4. OUTDOOR EQUIPMENT
    { id: uuidv4(), category: "outdoor", name: "Disconnect switch properly closed/open", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Disconnect switch (check latching allignmet)", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Disconnect switch porcelain (check for dirt or flashover)", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Disconnect switch motor mechanism functioning", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Disconnect switch operating handle damage", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Heaters in Disconnect switch box working", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Lighting/Surge Arrestor porcelain dusty", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Lighting/Surge Arrestor counter functioning", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "CT Bushing (check for dirt or flashover)", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "VT Bushing (check for dirt or flashover)", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "CB check for SF6 gas level", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Check CB Housing for rust", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Heaters in CB Housing working", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Check all Cable termination", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Inspect all Clamps", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "Hissing Noise", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "All equipment and system earthing secured", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "General condition of the station transformer", status: "" as ConditionStatus, remarks: "" },
    { id: uuidv4(), category: "outdoor", name: "General condition of the NGR/Earthing transformer", status: "" as ConditionStatus, remarks: "" }
  ];

  const [formData, setFormData] = useState<Partial<SubstationInspectionData>>({
    region: user?.region || "",
    district: user?.district || "",
    date: new Date().toISOString().split('T')[0],
    type: "indoor",
    items: initialInspectionItems
  });

  // Handle generic form input changes
  const handleInputChange = (field: keyof SubstationInspectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update inspection item
  const updateInspectionItem = (id: string, field: keyof InspectionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Filter items by category
  const getItemsByCategory = (category: string) => {
    return formData.items?.filter(item => item.category === category) || [];
  };

  // Validate form before submission
  const validateForm = () => {
    // Basic validation for required fields
    if (!formData.region || !formData.district || !formData.date || !formData.substationNo) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    // Check if all items have a status
    const hasEmptyStatus = formData.items?.some(item => item.status === "");
    if (hasEmptyStatus) {
      toast.error("Please select a status (Good/Bad) for all inspection items");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Save the inspection data
    saveInspection(formData as Omit<SubstationInspectionData, "id" | "createdAt" | "createdBy">);
    
    // Navigate to the management page
    navigate("/asset-management/inspection-management");
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Primary Substation Inspection</h1>
            <p className="text-muted-foreground mt-2">
              Complete the inspection checklist to ensure substation safety and performance
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/asset-management/inspection-management")}
          >
            View All Inspections
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
                <CardDescription>
                  Basic information about the inspection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Label htmlFor="substationNo">Substation Number</Label>
                    <Input
                      id="substationNo"
                      type="text"
                      value={formData.substationNo || ''}
                      onChange={(e) => handleInputChange('substationNo', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="substationName">Substation Name (Optional)</Label>
                    <Input
                      id="substationName"
                      type="text"
                      value={formData.substationName || ''}
                      onChange={(e) => handleInputChange('substationName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Substation Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value as 'indoor' | 'outdoor')}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select substation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Checklist</CardTitle>
                <CardDescription>
                  Complete the inspection checklist for all substation components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="general" 
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="general">1. General Building</TabsTrigger>
                    <TabsTrigger value="control">2. Control Equipment</TabsTrigger>
                    <TabsTrigger value="transformer">3. Power Transformer</TabsTrigger>
                    <TabsTrigger value="outdoor">4. Outdoor Equipment</TabsTrigger>
                  </TabsList>
                  
                  {/* General Building */}
                  <TabsContent value="general" className="space-y-6">
                    {getItemsByCategory("general").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                          <h3 className="text-base font-medium flex-1">{item.name}</h3>
                          <div className="flex items-center space-x-6">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: ConditionStatus) => 
                                updateInspectionItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="good" 
                                  id={`good-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`good-${item.id}`}
                                  className="text-green-600"
                                >
                                  Good
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="bad" 
                                  id={`bad-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`bad-${item.id}`}
                                  className="text-red-600"
                                >
                                  Bad
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`remarks-${item.id}`} className="text-sm">
                            Remarks
                          </Label>
                          <Textarea
                            id={`remarks-${item.id}`}
                            value={item.remarks}
                            onChange={(e) => updateInspectionItem(item.id, 'remarks', e.target.value)}
                            placeholder="Add any comments or observations"
                            className="mt-1 h-20"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <div></div>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("control")}
                      >
                        Next: Control Equipment
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Control Equipment */}
                  <TabsContent value="control" className="space-y-6">
                    {getItemsByCategory("control").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                          <h3 className="text-base font-medium flex-1">{item.name}</h3>
                          <div className="flex items-center space-x-6">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: ConditionStatus) => 
                                updateInspectionItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="good" 
                                  id={`good-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`good-${item.id}`}
                                  className="text-green-600"
                                >
                                  Good
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="bad" 
                                  id={`bad-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`bad-${item.id}`}
                                  className="text-red-600"
                                >
                                  Bad
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`remarks-${item.id}`} className="text-sm">
                            Remarks
                          </Label>
                          <Textarea
                            id={`remarks-${item.id}`}
                            value={item.remarks}
                            onChange={(e) => updateInspectionItem(item.id, 'remarks', e.target.value)}
                            placeholder="Add any comments or observations"
                            className="mt-1 h-20"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("general")}
                      >
                        Previous: General Building
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("transformer")}
                      >
                        Next: Power Transformer
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Power Transformer */}
                  <TabsContent value="transformer" className="space-y-6">
                    {getItemsByCategory("transformer").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                          <h3 className="text-base font-medium flex-1">{item.name}</h3>
                          <div className="flex items-center space-x-6">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: ConditionStatus) => 
                                updateInspectionItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="good" 
                                  id={`good-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`good-${item.id}`}
                                  className="text-green-600"
                                >
                                  Good
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="bad" 
                                  id={`bad-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`bad-${item.id}`}
                                  className="text-red-600"
                                >
                                  Bad
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`remarks-${item.id}`} className="text-sm">
                            Remarks
                          </Label>
                          <Textarea
                            id={`remarks-${item.id}`}
                            value={item.remarks}
                            onChange={(e) => updateInspectionItem(item.id, 'remarks', e.target.value)}
                            placeholder="Add any comments or observations"
                            className="mt-1 h-20"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("control")}
                      >
                        Previous: Control Equipment
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab("outdoor")}
                      >
                        Next: Outdoor Equipment
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Outdoor Equipment */}
                  <TabsContent value="outdoor" className="space-y-6">
                    {getItemsByCategory("outdoor").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                          <h3 className="text-base font-medium flex-1">{item.name}</h3>
                          <div className="flex items-center space-x-6">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: ConditionStatus) => 
                                updateInspectionItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="good" 
                                  id={`good-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`good-${item.id}`}
                                  className="text-green-600"
                                >
                                  Good
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="bad" 
                                  id={`bad-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`bad-${item.id}`}
                                  className="text-red-600"
                                >
                                  Bad
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`remarks-${item.id}`} className="text-sm">
                            Remarks
                          </Label>
                          <Textarea
                            id={`remarks-${item.id}`}
                            value={item.remarks}
                            onChange={(e) => updateInspectionItem(item.id, 'remarks', e.target.value)}
                            placeholder="Add any comments or observations"
                            className="mt-1 h-20"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("transformer")}
                      >
                        Previous: Power Transformer
                      </Button>
                      <div></div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Submit Inspection Report
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
