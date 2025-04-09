
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart2, Bell, Users, Box } from "lucide-react";

export function NavLinks() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link to="/dashboard">
        <Button variant="ghost" className="text-sm font-medium transition-colors">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link to="/report-fault">
        <Button variant="ghost" className="text-sm font-medium transition-colors">
          <Bell className="h-4 w-4 mr-2" />
          Report Faults
        </Button>
      </Link>
      <Link to="/analytics">
        <Button variant="ghost" className="text-sm font-medium transition-colors">
          <BarChart2 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </Link>
      <Link to="/user-management">
        <Button variant="ghost" className="text-sm font-medium transition-colors">
          <Users className="h-4 w-4 mr-2" />
          User Management
        </Button>
      </Link>
      <Link to="/asset-management/load-monitoring">
        <Button variant="ghost" className="text-sm font-medium transition-colors">
          <Box className="h-4 w-4 mr-2" />
          Asset Management
        </Button>
      </Link>
    </nav>
  );
}
