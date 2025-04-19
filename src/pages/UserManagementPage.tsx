import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings } from "lucide-react";
import { UsersList } from "@/components/user-management/UsersList";
import { DistrictPopulationForm } from "@/components/user-management/DistrictPopulationForm";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";

export default function UserManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDistrictPopulationRoute = location.pathname === "/district-population";
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // District engineers can only update their district population
    if (user?.role === "district_engineer") {
      // Stay on this page, but they can only access the District Population tab
    } else if (user?.role === "regional_engineer" && !isDistrictPopulationRoute) {
      // Regional engineers can't manage users, but can access district population
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate, isDistrictPopulationRoute]);
  
  if (!isAuthenticated) {
    return null;
  }

  // Only block regional engineers from the user management tab, not the district population tab
  if (user?.role === "regional_engineer" && !isDistrictPopulationRoute) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">
          {isDistrictPopulationRoute ? "District Population" : "User Management"}
        </h1>
        
        <Tabs defaultValue={isDistrictPopulationRoute ? "district-population" : "users"} className="space-y-4">
          <TabsList>
            {!isDistrictPopulationRoute && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </TabsTrigger>
            )}
            <TabsTrigger value="district-population" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              District Population
            </TabsTrigger>
          </TabsList>
          
          {!isDistrictPopulationRoute && (
            <TabsContent value="users">
              <UsersList />
            </TabsContent>
          )}
          
          <TabsContent value="district-population">
            {isDistrictPopulationRoute ? (
              <AccessControlWrapper type="asset">
                <DistrictPopulationForm />
              </AccessControlWrapper>
            ) : (
              <DistrictPopulationForm />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
