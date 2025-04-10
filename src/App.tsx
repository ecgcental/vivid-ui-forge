import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ReportFaultPage from "./pages/ReportFaultPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UserManagementPage from "./pages/UserManagementPage";
import LoadMonitoringPage from "./pages/asset-management/LoadMonitoringPage";
import SubstationInspectionPage from "./pages/asset-management/SubstationInspectionPage";
import InspectionManagementPage from "./pages/asset-management/InspectionManagementPage";
import InspectionDetailsPage from "./pages/asset-management/InspectionDetailsPage";
import EditInspectionPage from "./pages/asset-management/EditInspectionPage";
import VITInspectionPage from "./pages/asset-management/VITInspectionPage";
import VITInspectionManagementPage from "./pages/asset-management/VITInspectionManagementPage";
import VITInspectionDetailsPage from "./pages/asset-management/VITInspectionDetailsPage";
import EditVITInspectionPage from "./pages/asset-management/EditVITInspectionPage";
import VITInspectionFormPage from "./pages/asset-management/VITInspectionFormPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/report-fault" element={<ReportFaultPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/asset-management/load-monitoring" element={<LoadMonitoringPage />} />
              <Route path="/asset-management/substation-inspection" element={<SubstationInspectionPage />} />
              <Route path="/asset-management/inspection-management" element={<InspectionManagementPage />} />
              <Route path="/asset-management/inspection-details/:id" element={<InspectionDetailsPage />} />
              <Route path="/asset-management/edit-inspection/:id" element={<EditInspectionPage />} />
              <Route path="/asset-management/vit-inspection" element={<VITInspectionPage />} />
              <Route path="/asset-management/vit-inspection-management" element={<VITInspectionManagementPage />} />
              <Route path="/asset-management/vit-inspection-details/:id" element={<VITInspectionDetailsPage />} />
              <Route path="/asset-management/edit-vit-inspection/:id" element={<EditVITInspectionPage />} />
              <Route path="/asset-management/vit-inspection-form/:id" element={<VITInspectionFormPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
