
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ZapOff } from "lucide-react";
import { OP5Form } from "@/components/faults/OP5Form";
import { ControlSystemOutageForm } from "@/components/faults/ControlSystemOutageForm";

export default function ReportFaultPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Report Fault</h1>
          <p className="text-muted-foreground">
            Submit a new fault report or control system outage
          </p>
        </div>
        
        <Tabs defaultValue="op5">
          <TabsList className="mb-6">
            <TabsTrigger value="op5" className="flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              OP5 Fault
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center">
              <ZapOff size={16} className="mr-2" />
              Control System Outage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="op5">
            <OP5Form />
          </TabsContent>
          
          <TabsContent value="control">
            <ControlSystemOutageForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
