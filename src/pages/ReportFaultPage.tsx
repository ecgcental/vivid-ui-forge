
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ZapOff, ClipboardList } from "lucide-react";
import { OP5Form } from "@/components/faults/OP5Form";
import { ControlSystemOutageForm } from "@/components/faults/ControlSystemOutageForm";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";

export default function ReportFaultPage() {
  const { isAuthenticated, user } = useAuth();
  const { regions, districts } = useData();
  const navigate = useNavigate();
  
  // Store the default region and district IDs based on user role
  const [defaultRegionId, setDefaultRegionId] = useState<string>("");
  const [defaultDistrictId, setDefaultDistrictId] = useState<string>("");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    
    // Set default values based on user role
    if (user) {
      if (user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) setDefaultRegionId(userRegion.id);
      }
      
      if (user.district) {
        const userDistrict = districts.find(d => d.name === user.district);
        if (userDistrict) setDefaultDistrictId(userDistrict.id);
      }
    }
  }, [isAuthenticated, navigate, user, regions, districts]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-muted rounded-full mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Report Fault</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Submit a detailed fault report to notify the technical team and track resolution progress
          </p>
        </div>
        
        <Card className="border-2 border-muted bg-card/50 shadow-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="op5" className="w-full">
              <TabsList className="mb-8 w-full justify-start bg-muted/50 p-1 rounded-md">
                <TabsTrigger value="op5" className="flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <AlertTriangle size={16} className="mr-2 text-destructive" />
                  OP5 Fault
                </TabsTrigger>
                <TabsTrigger value="control" className="flex items-center data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ZapOff size={16} className="mr-2 text-amber-500" />
                  Control System Outage
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="op5" className="mt-0">
                <OP5Form defaultRegionId={defaultRegionId} defaultDistrictId={defaultDistrictId} />
              </TabsContent>
              
              <TabsContent value="control" className="mt-0">
                <ControlSystemOutageForm defaultRegionId={defaultRegionId} defaultDistrictId={defaultDistrictId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
