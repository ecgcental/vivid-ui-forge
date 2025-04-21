
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { ControlOutageFormProvider } from '@/hooks/useControlOutageForm';
import { LocationSection } from './form-sections/LocationSection';
import { OutageDetailsSection } from './form-sections/OutageDetailsSection';
import { AffectedCustomersSection } from './form-sections/AffectedCustomersSection';
import { showServiceWorkerNotification, showNotification } from '@/utils/notifications';
import { FaultType } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calculator, Users, InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ControlSystemOutageForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addControlOutage, regions, districts } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const notificationTitle = 'Control System Outage Created';
    const notificationBody = 'New outage created';
    
    // Show both types of notifications
    showServiceWorkerNotification(notificationTitle, {
      body: notificationBody,
      data: { url: window.location.href }
    });
    
    showNotification(notificationTitle, notificationBody);
    
    toast.success("Control system outage created successfully");
    navigate("/dashboard");
  };

  return (
    <ControlOutageFormProvider>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-serif">Control System Outage Report</CardTitle>
          <CardDescription>
            Report a control system outage with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            <LocationSection />
            <OutageDetailsSection />
            <AffectedCustomersSection />
            
          </form>
        </CardContent>
        <CardFooter className="px-0 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Outage Report"
            )}
          </Button>
        </CardFooter>
      </Card>
    </ControlOutageFormProvider>
  );
}
