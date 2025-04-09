
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutGrid, ClipboardCheck, FileSpreadsheet, Database } from "lucide-react";

export const AssetManagementNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white shadow-sm mb-6 border-b">
      <div className="container mx-auto">
        <div className="flex items-center overflow-x-auto py-2 gap-2">
          <Link to="/asset-management/load-monitoring">
            <Button 
              variant={isActive("/asset-management/load-monitoring") ? "default" : "ghost"} 
              size="sm"
              className="whitespace-nowrap"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Load Monitoring
            </Button>
          </Link>
          
          <Link to="/asset-management/substation-inspection">
            <Button 
              variant={isActive("/asset-management/substation-inspection") ? "default" : "ghost"} 
              size="sm"
              className="whitespace-nowrap"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Substation Inspection
            </Button>
          </Link>
          
          <Link to="/asset-management/inspection-management">
            <Button 
              variant={isActive("/asset-management/inspection-management") ? "default" : "ghost"} 
              size="sm"
              className="whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Inspection Management
            </Button>
          </Link>
          
          <Link to="/asset-management/vit-inspection">
            <Button 
              variant={isActive("/asset-management/vit-inspection") ? "default" : "ghost"} 
              size="sm"
              className="whitespace-nowrap"
            >
              <Database className="h-4 w-4 mr-2" />
              VIT Inspection
            </Button>
          </Link>
          
          <Link to="/asset-management/vit-inspection-management">
            <Button 
              variant={isActive("/asset-management/vit-inspection-management") ? "default" : "ghost"} 
              size="sm"
              className="whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              VIT Management
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
