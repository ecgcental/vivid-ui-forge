
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { OP5FormProvider } from '@/hooks/useOP5Form';
import { LocationSection } from './form-sections/LocationSection';
import { FaultDetailsSection } from './form-sections/FaultDetailsSection';
import { AffectedCustomersSection } from './form-sections/AffectedCustomersSection';
import { ReliabilityIndicesSection } from './form-sections/ReliabilityIndicesSection';
import { MaterialsUsedSection } from './form-sections/MaterialsUsedSection';
import { showServiceWorkerNotification, showNotification } from '@/utils/notifications';
import { FaultType } from '@/lib/types';

export function OP5Form() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOP5Fault, regions, districts } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const notificationTitle = 'OP5 Fault Created';
    const notificationBody = 'New OP5 fault created';
    
    // Fix notification options by passing an object with a body property
    showServiceWorkerNotification(notificationTitle, {
      body: notificationBody,
    });
    
    showNotification(notificationTitle, notificationBody);
    
    toast.success("OP5 fault created successfully");
    navigate("/dashboard");
  };

  return (
    <OP5FormProvider>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-serif">OP5 Fault Report</CardTitle>
          <CardDescription>
            Report an OP5 fault with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            <LocationSection />
            <FaultDetailsSection />
            <AffectedCustomersSection />
            <ReliabilityIndicesSection />
            <MaterialsUsedSection />
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
              "Submit Fault Report"
            )}
          </Button>
        </CardFooter>
      </Card>
    </OP5FormProvider>
  );
}
