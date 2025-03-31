
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ZapOff, ClipboardList, User } from "lucide-react";
import { OP5Form } from "@/components/faults/OP5Form";
import { ControlSystemOutageForm } from "@/components/faults/ControlSystemOutageForm";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
      return;
    }
    
    // Set default values based on user role
    if (user) {
      // For district engineers, find and set their district ID
      if (user.role === "district_engineer" && user.district) {
        const userDistrict = districts.find(d => d.name === user.district);
        if (userDistrict) {
          setDefaultDistrictId(userDistrict.id);
          setDefaultRegionId(userDistrict.regionId);
          console.log("Setting district ID:", userDistrict.id, "for district:", user.district);
        }
      }
      // For regional engineers, find and set their region ID
      else if (user.role === "regional_engineer" && user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setDefaultRegionId(userRegion.id);
          console.log("Setting region ID:", userRegion.id, "for region:", user.region);
        }
      }
    }
  }, [isAuthenticated, navigate, user, regions, districts]);
  
  if (!isAuthenticated) {
    return null;
  }

  // Get user's role display name for badge
  const getRoleDisplay = () => {
    switch (user?.role) {
      case "district_engineer":
        return "District Engineer";
      case "regional_engineer":
        return "Regional Engineer";
      case "global_engineer":
        return "Global Engineer";
      default:
        return "Engineer";
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Report Fault</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Submit a detailed fault report to notify the technical team and track resolution progress
          </p>
        </div>

        {/* User information section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <Avatar className="h-16 w-16 border-2 border-primary/20 mb-3">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <Badge variant="outline" className="mt-1 font-normal">
              <User className="mr-1 h-3 w-3" />
              {getRoleDisplay()}
              {user?.district && ` - ${user.district}`}
              {!user?.district && user?.region && ` - ${user.region}`}
            </Badge>
          </div>
        </div>
        
        <Card className="border border-border/50 bg-card/50 shadow-sm">
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
