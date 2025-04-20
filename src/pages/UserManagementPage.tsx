import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, IdCard } from "lucide-react";
import { UsersList } from "@/components/user-management/UsersList";
import { DistrictPopulationForm } from "@/components/user-management/DistrictPopulationForm";
import { StaffIdManagement } from "@/components/user-management/StaffIdManagement";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";

export default function UserManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDistrictPopulationRoute = location.pathname === "/district-population";
  const isStaffIdsRoute = location.pathname === "/staff-ids";
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // District engineers can only update their district population
    if (user?.role === "district_engineer") {
      if (!isDistrictPopulationRoute) {
        navigate("/district-population");
      }
    } else if (user?.role === "regional_engineer") {
      if (!isDistrictPopulationRoute) {
        navigate("/dashboard");
      }
    } else if (user?.role !== "system_admin" && user?.role !== "global_engineer") {
      navigate("/dashboard");
    }

    // Redirect non-system admins from staff IDs page
    if (isStaffIdsRoute && user?.role !== "system_admin") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate, isDistrictPopulationRoute, isStaffIdsRoute]);
  
  if (!isAuthenticated) {
    return null;
  }

  // Set default tab based on user role
  const defaultTab = user?.role === "global_engineer" ? "district-population" : "users";

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList>
            {(user?.role === "system_admin" || user?.role === "global_engineer") && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            )}
            <TabsTrigger value="district-population" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              District Population
            </TabsTrigger>
            {user?.role === "system_admin" && (
              <TabsTrigger value="staff-ids" className="flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                Staff IDs
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="users">
            <AccessControlWrapper requiredRole="global_engineer">
              <UsersList />
            </AccessControlWrapper>
          </TabsContent>
          
          <TabsContent value="district-population">
            <AccessControlWrapper type="asset">
              <DistrictPopulationForm />
            </AccessControlWrapper>
          </TabsContent>
          
          <TabsContent value="staff-ids">
            <AccessControlWrapper requiredRole="system_admin">
              <StaffIdManagement />
            </AccessControlWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
