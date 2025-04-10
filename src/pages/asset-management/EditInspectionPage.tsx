import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { SubstationInspection, ConditionStatus, InspectionItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { ChevronLeft } from "lucide-react";

export default function EditInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getSavedInspection, updateInspection, regions, districts } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Partial<SubstationInspection>>({
    region: user?.region || "",
    district: user?.district || "",
    date: new Date().toISOString().split('T')[0],
    type: "indoor",
    items: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const inspection = getSavedInspection(id);
      if (inspection) {
        setFormData(inspection);
        setLoading(false);
      } else {
        toast.error("Inspection not found");
        navigate("/asset-management/inspection-management");
      }
    }
  }, [id, getSavedInspection, navigate]);

  // Handle generic form input changes
  const handleInputChange = (field: keyof SubstationInspection, value: any) => {
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
    const categoryMap: { [key: string]: string } = {
      "general": "general building",
      "control": "control equipment",
      "transformer": "power transformer",
      "outdoor": "outdoor equipment"
    };
    return formData.items?.filter(item => item.category === categoryMap[category]) || [];
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.region || !formData.district || !formData.date || !formData.substationNo) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (id) {
      // Update the region and district IDs based on their names
      const regionId = regions.find(r => r.name === formData.region)?.id || formData.regionId;
      const districtId = districts.find(d => d.name === formData.district)?.id || formData.districtId;
      
      const updatedData: Partial<SubstationInspection> = {
        ...formData,
        regionId,
        districtId
      };
      
      // Update the inspection data
      updateInspection(id, updatedData);
      
      // Navigate to the details page
      navigate(`/asset-management/inspection-details/${id}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p>Loading inspection data...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/asset-management/inspection-details/${id}`)}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Inspection Details
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Inspection</h1>
          <p className="text-muted-foreground mt-2">
            Update the inspection data for Substation {formData.substationNo}
          </p>
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
                  Update the inspection checklist for all substation components
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
                  <TabsContent value="general" className="space-y-4">
                    {getItemsByCategory("general").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value) => updateInspectionItem(item.id, 'status', value as ConditionStatus)}
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
                  <TabsContent value="control" className="space-y-4">
                    {getItemsByCategory("control").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value) => updateInspectionItem(item.id, 'status', value as ConditionStatus)}
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
                  <TabsContent value="transformer" className="space-y-4">
                    {getItemsByCategory("transformer").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value) => updateInspectionItem(item.id, 'status', value as ConditionStatus)}
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
                  <TabsContent value="outdoor" className="space-y-4">
                    {getItemsByCategory("outdoor").map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value) => updateInspectionItem(item.id, 'status', value as ConditionStatus)}
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

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/asset-management/inspection-details/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
