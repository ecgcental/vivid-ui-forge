import { useState, useEffect } from "react";
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
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { SubstationInspection, ConditionStatus, InspectionItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    status: ConditionStatus;
    remarks: string;
  }[];
}

export default function SubstationInspectionPage() {
  const { user } = useAuth();
  const { regions, districts, saveInspection } = useData();
  const navigate = useNavigate();
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [formData, setFormData] = useState<Partial<SubstationInspection>>({
    date: new Date().toISOString().split('T')[0],
    type: "indoor",
  });
  const [categories, setCategories] = useState<Category[]>([
    {
      id: uuidv4(),
      name: "General Building",
      items: [
        { id: uuidv4(), name: "Building Structure", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Cleanliness", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Lighting", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Ventilation", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Fire Safety", status: "" as ConditionStatus, remarks: "" },
      ],
    },
    {
      id: uuidv4(),
      name: "Control Equipment",
      items: [
        { id: uuidv4(), name: "Control Panels", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Wiring", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Relays", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Batteries", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Communication Systems", status: "" as ConditionStatus, remarks: "" },
      ],
    },
    {
      id: uuidv4(),
      name: "Power Transformer",
      items: [
        { id: uuidv4(), name: "Oil Level", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Bushings", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Cooling System", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Insulation", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Load Tap Changer", status: "" as ConditionStatus, remarks: "" },
      ],
    },
    {
      id: uuidv4(),
      name: "Outdoor Equipment",
      items: [
        { id: uuidv4(), name: "Circuit Breakers", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Disconnect Switches", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Surge Arresters", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Grounding System", status: "" as ConditionStatus, remarks: "" },
        { id: uuidv4(), name: "Fencing", status: "" as ConditionStatus, remarks: "" },
      ],
    },
  ]);

  // Initialize region and district based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "district_engineer" || user.role === "regional_engineer") {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setRegionId(userRegion.id);
          setFormData(prev => ({ ...prev, region: userRegion.name }));
          
          if (user.role === "district_engineer" && user.district) {
            const userDistrict = districts.find(d => d.name === user.district);
            if (userDistrict) {
              setDistrictId(userDistrict.id);
              setFormData(prev => ({ ...prev, district: userDistrict.name }));
            }
          }
        }
      }
    }
  }, [user, regions, districts]);

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

  // Handle region change
  const handleRegionChange = (value: string) => {
    setRegionId(value);
    const region = regions.find(r => r.id === value);
    setFormData(prev => ({ ...prev, region: region?.name || "" }));
    setDistrictId("");
    setFormData(prev => ({ ...prev, district: "" }));
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    setDistrictId(value);
    const district = districts.find(d => d.id === value);
    setFormData(prev => ({ ...prev, district: district?.name || "" }));
  };

  // Handle generic form input changes
  const handleInputChange = (field: keyof SubstationInspection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update item status
  const updateItemStatus = (categoryIndex: number, itemIndex: number, status: ConditionStatus) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: newCategories[categoryIndex].items.map((item, index) =>
          index === itemIndex ? { ...item, status } : item
        ),
      };
      return newCategories;
    });
  };

  // Update item remarks
  const updateItemRemarks = (categoryIndex: number, itemIndex: number, remarks: string) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: newCategories[categoryIndex].items.map((item, index) =>
          index === itemIndex ? { ...item, remarks } : item
        ),
      };
      return newCategories;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const region = user?.region || formData.region || "";
    const district = user?.district || formData.district || "";
    
    // Find the region and district IDs from the names
    const regionFound = regions.find(r => r.name === region);
    const districtFound = districts.find(d => d.name === district);
    
    const regionId = regionFound?.id || "";
    const districtId = districtFound?.id || "";
    
    const inspectionItems: InspectionItem[] = categories.flatMap(category =>
      category.items
        .filter(item => item.status) // Only include items that have a status selected
        .map(item => ({
          id: item.id,
          category: category.name.toLowerCase(),
          name: item.name,
          status: item.status,
          remarks: item.remarks || "",
        }))
    );
    
    const inspectionData: Omit<SubstationInspection, "id"> = {
      regionId,
      districtId,
      region: region,
      district: district,
      date: formData.date || new Date().toISOString().split('T')[0],
      substationNo: formData.substationNo || "",
      substationName: formData.substationName || "",
      type: formData.type || "indoor",
      items: inspectionItems,
      createdBy: user?.name || "Unknown",
      createdAt: new Date().toISOString(),
    };
    
    const id = saveInspection(inspectionData);
    toast.success("Inspection saved successfully");
    navigate("/asset-management/inspection-management");
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Substation Inspection</h1>
            <p className="text-muted-foreground mt-1">
              Record a new inspection for a substation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
              <CardDescription>Enter the basic information about the inspection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={regionId}
                    onValueChange={handleRegionChange}
                    disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRegions.map((region) => (
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
                    onValueChange={handleDistrictChange}
                    disabled={user?.role === "district_engineer" || !regionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDistricts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
          {categories.map((category, categoryIndex) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>
                  Record the condition of each item in this category
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                      <h3 className="text-base font-medium flex-1">{item.name}</h3>
                      <div className="flex items-center space-x-6">
                        <RadioGroup
                          value={item.status}
                          onValueChange={(value) => updateItemStatus(categoryIndex, itemIndex, value as "good" | "bad")}
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
                        onChange={(e) => updateItemRemarks(categoryIndex, itemIndex, e.target.value)}
                        placeholder="Add any comments or observations"
                        className="mt-1 h-20"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              Save Inspection
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
