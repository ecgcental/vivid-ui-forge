import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/access-control/ProtectedRoute";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";

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
import OverheadLineInspectionPage from "./pages/asset-management/OverheadLineInspectionPage";
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import CreateLoadMonitoringPage from "./pages/asset-management/CreateLoadMonitoringPage";
import EditLoadMonitoringPage from "./pages/asset-management/EditLoadMonitoringPage";
import LoadMonitoringDetailsPage from "./pages/asset-management/LoadMonitoringDetailsPage";
import EditOP5FaultPage from "@/pages/EditOP5FaultPage";
import EditControlOutagePage from "@/pages/EditControlOutagePage";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/report-fault" element={
                  <ProtectedRoute>
                    <ReportFaultPage />
                  </ProtectedRoute>
                } />

                <Route path="/analytics" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />

                <Route path="/user-management" element={
                  <ProtectedRoute requiredRole="system_admin">
                    <UserManagementPage />
                  </ProtectedRoute>
                } />

                <Route path="/district-population" element={
                  <ProtectedRoute>
                    <AccessControlWrapper type="asset">
                      <UserManagementPage />
                    </AccessControlWrapper>
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/load-monitoring" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <LoadMonitoringPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/load-monitoring-details/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <LoadMonitoringDetailsPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/edit-load-monitoring/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <EditLoadMonitoringPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/create-load-monitoring" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <CreateLoadMonitoringPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/inspection-management" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <InspectionManagementPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/inspection-details/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <InspectionDetailsPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/substation-inspection" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <SubstationInspectionPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/edit-inspection/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <EditInspectionPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/vit-inspection" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <VITInspectionPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/vit-inspection-management" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <VITInspectionManagementPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/vit-inspection-details/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <VITInspectionDetailsPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/edit-vit-inspection/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <EditVITInspectionPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/vit-inspection-form/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <VITInspectionFormPage />
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/overhead-line" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <AccessControlWrapper type="inspection">
                      <OverheadLineInspectionPage />
                    </AccessControlWrapper>
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/overhead-line/details/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <AccessControlWrapper type="inspection">
                      <InspectionDetailsPage />
                    </AccessControlWrapper>
                  </ProtectedRoute>
                } />

                <Route path="/asset-management/overhead-line/edit/:id" element={
                  <ProtectedRoute requiredRole="district_engineer">
                    <AccessControlWrapper type="inspection">
                      <EditInspectionPage />
                    </AccessControlWrapper>
                  </ProtectedRoute>
                } />

                <Route path="/edit-op5-fault/:id" element={<EditOP5FaultPage />} />
                <Route path="/edit-control-outage/:id" element={<EditControlOutagePage />} />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
