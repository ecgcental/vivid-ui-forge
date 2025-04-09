import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { FaultCard } from "@/components/dashboard/FaultCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, ZapOff, RefreshCw, Filter } from "lucide-react";
import { OP5Fault, ControlSystemOutage } from "@/lib/types";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { getFilteredFaults, regions, districts } = useData();
  const navigate = useNavigate();
  
  const [filterRegion, setFilterRegion] = useState<string | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "resolved">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [faults, setFaults] = useState<{op5Faults: OP5Fault[], controlOutages: ControlSystemOutage[]}>({
    op5Faults: [],
    controlOutages: []
  });
  
  // Set initial filter values based on user role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user) {
      // For district engineer, set both region and district filters
      if (user.role === "district_engineer" && user.region && user.district) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setFilterRegion(userRegion.id);
          
          const userDistrict = districts.find(d => d.name === user.district);
          if (userDistrict) {
            setFilterDistrict(userDistrict.id);
          }
        }
      } 
      // For regional engineer, set only region filter
      else if (user.role === "regional_engineer" && user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setFilterRegion(userRegion.id);
        }
      }
    }
  }, [isAuthenticated, navigate, user, regions, districts]);
  
  useEffect(() => {
    loadFaults();
  }, [filterRegion, filterDistrict, filterStatus]);
  
  const loadFaults = () => {
    const filteredFaults = getFilteredFaults(filterRegion, filterDistrict);
    
    // Filter by status if needed
    if (filterStatus !== "all") {
      const filteredOP5 = filteredFaults.op5Faults.filter(f => f.status === filterStatus);
      const filteredControl = filteredFaults.controlOutages.filter(f => f.status === filterStatus);
      
      setFaults({
        op5Faults: filteredOP5,
        controlOutages: filteredControl
      });
    } else {
      setFaults(filteredFaults);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadFaults();
      setIsRefreshing(false);
    }, 1000);
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage power distribution faults
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
            <Button asChild>
              <Link to="/report-fault" className="flex items-center">
                <PlusCircle size={16} className="mr-2" />
                Report New Fault
              </Link>
            </Button>
          </div>
        </div>
        
        <StatsOverview 
          op5Faults={faults.op5Faults} 
          controlOutages={faults.controlOutages} 
        />
        
        <FilterBar 
          setFilterRegion={setFilterRegion}
          setFilterDistrict={setFilterDistrict}
          setFilterStatus={setFilterStatus}
          filterStatus={filterStatus}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <Tabs defaultValue="all" className="mt-8">
          <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="all">All Faults</TabsTrigger>
            <TabsTrigger value="op5" className="flex items-center justify-center">
              <AlertTriangle size={16} className="mr-2" />
              OP5 Faults
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center justify-center">
              <ZapOff size={16} className="mr-2" />
              Control System
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {faults.op5Faults.length === 0 && faults.controlOutages.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20 shadow-sm">
                <p className="text-muted-foreground">No faults found with the current filters</p>
                <Button variant="link" onClick={() => {
                  if (user?.role === "global_engineer") {
                    setFilterRegion(undefined);
                    setFilterDistrict(undefined);
                  } else if (user?.role === "regional_engineer") {
                    setFilterDistrict(undefined);
                  }
                  setFilterStatus("all");
                }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...faults.op5Faults, ...faults.controlOutages]
                  .sort((a, b) => {
                    // Sort by status (active first) then by date (newest first)
                    if (a.status === "active" && b.status !== "active") return -1;
                    if (a.status !== "active" && b.status === "active") return 1;
                    return new Date(b.occurrenceDate).getTime() - new Date(a.occurrenceDate).getTime();
                  })
                  .map(fault => (
                    <FaultCard 
                      key={fault.id} 
                      fault={fault} 
                      type={fault.id.startsWith("op5") ? "op5" : "control"} 
                    />
                  ))
                }
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="op5">
            {faults.op5Faults.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20 shadow-sm">
                <p className="text-muted-foreground">No OP5 faults found with the current filters</p>
                <Button variant="link" onClick={() => {
                  setFilterRegion(undefined);
                  setFilterDistrict(undefined);
                  setFilterStatus("all");
                }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faults.op5Faults
                  .sort((a, b) => {
                    // Sort by status (active first) then by date (newest first)
                    if (a.status === "active" && b.status !== "active") return -1;
                    if (a.status !== "active" && b.status === "active") return 1;
                    return new Date(b.occurrenceDate).getTime() - new Date(a.occurrenceDate).getTime();
                  })
                  .map(fault => (
                    <FaultCard key={fault.id} fault={fault} type="op5" />
                  ))
                }
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="control">
            {faults.controlOutages.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20 shadow-sm">
                <p className="text-muted-foreground">No control system outages found with the current filters</p>
                <Button variant="link" onClick={() => {
                  setFilterRegion(undefined);
                  setFilterDistrict(undefined);
                  setFilterStatus("all");
                }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faults.controlOutages
                  .sort((a, b) => {
                    // Sort by status (active first) then by date (newest first)
                    if (a.status === "active" && b.status !== "active") return -1;
                    if (a.status !== "active" && b.status === "active") return 1;
                    return new Date(b.occurrenceDate).getTime() - new Date(a.occurrenceDate).getTime();
                  })
                  .map(fault => (
                    <FaultCard key={fault.id} fault={fault} type="control" />
                  ))
                }
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
