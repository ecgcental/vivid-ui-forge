
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Database, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Check if the current path starts with a specific route
  const isActiveRoute = (route: string) => {
    return location.pathname.startsWith(route);
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/report-fault" className="text-foreground hover:text-primary transition-colors">
            Report Fault
          </Link>
          {/* Allow all engineers (including district) to access analytics */}
          <Link to="/analytics" className="text-foreground hover:text-primary transition-colors">
            Analytics
          </Link>
          
          {/* Asset Management Dropdown - Only shown in desktop navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "text-foreground hover:text-primary transition-colors",
                    isActiveRoute("/asset-management") && "bg-accent text-primary"
                  )}>
                    Asset Management
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/asset-management/load-monitoring"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActiveRoute("/asset-management/load-monitoring") && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">Load Monitoring</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Track transformer load metrics
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/asset-management/substation-inspection"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActiveRoute("/asset-management/substation-inspection") && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">Primary Substation Inspection</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Inspection checklists for substations
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {user?.role === "global_engineer" && (
            <Link to="/user-management" className="text-foreground hover:text-primary transition-colors">
              User Management
            </Link>
          )}
        </>
      )}
    </>
  );

  const MobileNavLinks = () => (
    <>
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link to="/report-fault" className="text-foreground hover:text-primary transition-colors">
            Report Fault
          </Link>
          <Link to="/analytics" className="text-foreground hover:text-primary transition-colors">
            Analytics
          </Link>
          
          {/* Asset Management for mobile */}
          <div className="font-medium">Asset Management</div>
          <div className="ml-4 flex flex-col space-y-3">
            <Link to="/asset-management/load-monitoring" className="text-foreground hover:text-primary transition-colors">
              Load Monitoring
            </Link>
            <Link to="/asset-management/substation-inspection" className="text-foreground hover:text-primary transition-colors">
              Primary Substation Inspection
            </Link>
          </div>
          
          {user?.role === "global_engineer" && (
            <Link to="/user-management" className="text-foreground hover:text-primary transition-colors">
              User Management
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/8a9a1582-1dac-407d-adcc-a9d1c6f772bc.png" 
              alt="ECG Logo" 
              className="h-12 w-auto"
            />
            <span className="font-bold text-lg">ECG Fault Master</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.role?.replace('_', ' ')}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center gap-1"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4">
                  <div className="font-bold">ECG Fault Master</div>
                </div>
                <Separator />
                <nav className="flex flex-col space-y-4 mt-4">
                  <MobileNavLinks />
                </nav>
                <div className="mt-auto">
                  <Separator className="my-4" />
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.role?.replace('_', ' ')}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-1 justify-center"
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button size="sm" asChild className="w-full">
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
