import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubstationInspection } from "@/lib/types";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { ChevronLeft, Pencil } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function InspectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSavedInspection } = useData();
  const [inspection, setInspection] = useState<SubstationInspection | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (id) {
      const loadedInspection = getSavedInspection(id);
      if (loadedInspection) {
        setInspection(loadedInspection);
      } else {
        toast.error("Inspection not found");
        navigate("/asset-management/inspection-management");
      }
    }
  }, [id, getSavedInspection, navigate]);

  if (!inspection) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p>Loading inspection details...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getItemsByCategory = (categoryName: string) => {
    const category = inspection.items.find(cat => cat.category === categoryName);
    return category ? category.items : [];
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/asset-management/inspection-management")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Inspections
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Inspection: {inspection.substationNo}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/asset-management/edit-inspection/${id}`)}
                className="flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Inspection
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
            <CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p><strong>Substation:</strong> {inspection.substationNo}</p>
                  <p><strong>Region:</strong> {inspection.region}</p>
                  <p><strong>District:</strong> {inspection.district}</p>
                  <p><strong>Date:</strong> {inspection.date ? format(new Date(inspection.date), "PPP") : "N/A"}</p>
                  <p><strong>Type:</strong> {inspection.type}</p>
                </div>
                <div>
                  <p><strong>Created By:</strong> {inspection.createdBy || "N/A"}</p>
                  <p><strong>Created At:</strong> {inspection.createdAt ? format(new Date(inspection.createdAt), "PPP") : "N/A"}</p>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p className="text-lg">{inspection.region}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">District</p>
                <p className="text-lg">{inspection.district}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Number</p>
                <p className="text-lg">{inspection.substationNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-lg capitalize">{inspection.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status Summary</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {inspection.items.flatMap(category => category.items).filter(item => item.status === "good").length} good
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {inspection.items.flatMap(category => category.items).filter(item => item.status === "bad").length} bad
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Checklist Results</CardTitle>
            <CardDescription>
              Detailed results of the inspection checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General Building</TabsTrigger>
                <TabsTrigger value="control">Control Equipment</TabsTrigger>
                <TabsTrigger value="transformer">Power Transformer</TabsTrigger>
                <TabsTrigger value="outdoor">Outdoor Equipment</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <div className="space-y-4">
                  {getItemsByCategory("general building").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.remarks || "No remarks"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "good" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "good" ? "Good" : "Bad"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="control">
                <div className="space-y-4">
                  {getItemsByCategory("control equipment").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.remarks || "No remarks"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "good" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "good" ? "Good" : "Bad"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transformer">
                <div className="space-y-4">
                  {getItemsByCategory("power transformer").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.remarks || "No remarks"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "good" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "good" ? "Good" : "Bad"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="outdoor">
                <div className="space-y-4">
                  {getItemsByCategory("outdoor equipment").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.remarks || "No remarks"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "good" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "good" ? "Good" : "Bad"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
