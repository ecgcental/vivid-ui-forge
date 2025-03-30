
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import { useData } from "@/contexts/DataContext";

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getFilteredFaults } = useData();
  const [filteredFaults, setFilteredFaults] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Only regional and global engineers can access analytics
    if (user?.role === "district_engineer") {
      navigate("/dashboard");
    }

    // Get all faults for analytics
    const { op5Faults, controlOutages } = getFilteredFaults();
    setFilteredFaults([...op5Faults, ...controlOutages]);
  }, [isAuthenticated, user, navigate, getFilteredFaults]);
  
  if (!isAuthenticated || user?.role === "district_engineer") {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Analyze fault patterns and generate insights
          </p>
        </div>
        
        <AnalyticsCharts filteredFaults={filteredFaults} />
      </div>
    </Layout>
  );
}
