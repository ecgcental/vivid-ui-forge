import { Layout } from "@/components/layout/Layout";
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, MapPin } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { SubstationInspectionData, InspectionItem, ConditionStatus } from "@/lib/asset-types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function SubstationInspectionPage() {
  const { user } = useAuth();
  const { saveSubstationInspection } = useData();
  const navigate = useNavigate();
  
  // Initial list of inspection items
  const initialInspectionItems: InspectionItem[] = [
    // Transformer
    { id: uuidv4(), category: "Transformer", name: "Oil level", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Oil leakage", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Silica gel", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Buchholz relay", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Temperature gauge", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Pressure relief device", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Transformer", name: "Cooling system", status: "unset", remarks: "" },
    
    // Circuit Breaker
    { id: uuidv4(), category: "Circuit Breaker", name: "SF6 gas pressure", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Circuit Breaker", name: "Oil level", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Circuit Breaker", name: "Operating mechanism", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Circuit Breaker", name: "Control circuit", status: "unset", remarks: "" },
    
    // Disconnector
    { id: uuidv4(), category: "Disconnector", name: "Contact alignment", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Disconnector", name: "Operating mechanism", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Disconnector", name: "Interlocking", status: "unset", remarks: "" },
    
    // Earthing Switch
    { id: uuidv4(), category: "Earthing Switch", name: "Contact condition", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Earthing Switch", name: "Operating mechanism", status: "unset", remarks: "" },
    
    // Insulators
    { id: uuidv4(), category: "Insulators", name: "Cleanliness", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Insulators", name: "Cracks/Damage", status: "unset", remarks: "" },
    
    // Busbars
    { id: uuidv4(), category: "Busbars", name: "Connections", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Busbars", name: "Insulation", status: "unset", remarks: "" },
    
    // Protection & Control
    { id: uuidv4(), category: "Protection & Control", name: "Relay operation", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Protection & Control", name: "Battery system", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Protection & Control", name: "Alarms", status: "unset", remarks: "" },
    { id: uuidv4(), category: "Protection & Control", name: "Meters", status: "unset", remarks: "" },
    
    // General
    { id: uuidv4(), category: "General", name: "Fencing", status: "unset", remarks: "" },
    { id: uuidv4(), category: "General", name: "Lighting", status: "unset", remarks: "" },
    { id: uuidv4(), category: "General", name: "Fire extinguishers", status: "unset", remarks: "" },
    { id: uuidv4(), category: "General", name: "Warning signs", status: "unset", remarks: "" },
    { id: uuidv4(), category: "General", name: "Cleanliness", status: "unset", remarks: "" },
    { id: uuidv4(), category: "General", name: "Drainage", status: "unset", remarks: "" }
  ];

  const [formData, setFormData] = useState<Partial<SubstationInspectionData>>({
    region: user?.region || "",
    district: user?.district || "",
    date: new Date().toISOString().split('T')[0],
    substationNo: "",
    substationName: "",
    type: "outdoor",
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

  // Get current GPS location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const gpsString = `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°W`;
          // Add GPS location to form data if needed
          toast.success("GPS location captured successfully");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  // Validate form before submission
  const validateForm = () => {
    // Basic validation for required fields
    if (!formData.region || !formData.district || !formData.date || !formData.substationNo) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    // Check if all items have a status
    const hasEmptyStatus = formData.items?.some(item => item.status === "unset");
    if (hasEmptyStatus) {
      toast.error("Please select Good/Bad for all inspection items");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Save the substation inspection data
    saveSubstationInspection(formData as Omit<SubstationInspectionData, "id" | "createdAt" | "createdBy">);
    
    // Navigate to the management page
    navigate("/asset-management/inspection-management");
  };

  // Group inspection items by category
  const groupedItems = formData.items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>) || {};

  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Substation Inspection</h1>
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
                <CardTitle>Substation Information</CardTitle>
                <CardDescription>
                  Basic information about the substation
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
                      value={formData.substationNo}
                      onChange={(e) => handleInputChange('substationNo', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="substationName">Substation Name (Optional)</Label>
                    <Input
                      id="substationName"
                      type="text"
                      value={formData.substationName}
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
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        onClick={getCurrentLocation}
                        variant="outline"
                        className="flex-shrink-0 w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Capture GPS Location
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload Photo</p>
                      <p className="text-xs text-gray-400 mt-1">(Feature coming soon)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Checklist</CardTitle>
                <CardDescription>
                  Complete the inspection checklist for the substation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-semibold">{category}</h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                              <h4 className="text-base font-medium flex-1">{item.name}</h4>
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
                      </div>
                    </div>
                  ))}
                </div>
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
