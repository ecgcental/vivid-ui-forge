
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings } from "lucide-react";
import { UsersList } from "@/components/user-management/UsersList";
import { DistrictPopulationForm } from "@/components/user-management/DistrictPopulationForm";

export default function UserManagementPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // District engineers can only update their district population
    if (user?.role === "district_engineer") {
      // Stay on this page, but they can only access the District Population tab
    } else if (user?.role === "regional_engineer") {
      // Regional engineers can't manage users
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);
  
  if (!isAuthenticated || user?.role === "regional_engineer") {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and district configurations
          </p>
        </div>
        
        <Tabs defaultValue={user?.role === "district_engineer" ? "population" : "users"}>
          <TabsList className="mb-6">
            {user?.role === "global_engineer" && (
              <TabsTrigger value="users" className="flex items-center">
                <Users size={16} className="mr-2" />
                Manage Users
              </TabsTrigger>
            )}
            <TabsTrigger value="population" className="flex items-center">
              <Settings size={16} className="mr-2" />
              District Population
            </TabsTrigger>
          </TabsList>
          
          {user?.role === "global_engineer" && (
            <TabsContent value="users">
              <UsersList />
            </TabsContent>
          )}
          
          <TabsContent value="population">
            <DistrictPopulationForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
