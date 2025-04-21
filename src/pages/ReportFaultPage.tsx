
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calculator } from "lucide-react";
import { OP5Form } from "@/components/faults/OP5Form";
import { ControlSystemOutageForm } from "@/components/faults/ControlSystemOutageForm";
import { Region, District } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Add missing Button import

export default function ReportFaultPage() {
  const navigate = useNavigate();
  const { regionId, districtId } = useParams<{ regionId?: string; districtId?: string }>();
  const { regions, districts } = useData();
  
  const region = regions.find((r) => r.id === regionId);
  const district = districts.find((d) => d.id === districtId);

  return (
    <div className="container max-w-4xl py-6">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl font-serif">Report a Fault or Outage</CardTitle>
          <CardDescription>
            Choose the appropriate form to report either an OP5 Fault or a Control System Outage.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Tabs defaultValue="op5" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="op5">
                <FileText className="mr-2 h-4 w-4" />
                OP5 Fault
              </TabsTrigger>
              <TabsTrigger value="control-system">
                <Calculator className="mr-2 h-4 w-4" />
                Control System Outage
              </TabsTrigger>
            </TabsList>
            <TabsContent value="op5" className="space-y-2">
              <OP5Form />
            </TabsContent>
            <TabsContent value="control-system" className="space-y-2">
              <ControlSystemOutageForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
