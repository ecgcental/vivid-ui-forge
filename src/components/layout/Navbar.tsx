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
                            <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Monitor load distribution across the grid
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/asset-management/inspection-management"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActiveRoute("/asset-management/inspection-management") && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">Substation Inspection</div>
                            <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage and track substation inspections
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/asset-management/vit-inspection"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActiveRoute("/asset-management/vit-inspection") && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">VITs Inspection</div>
                            <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Manage and monitor VIT assets and inspections
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Only show User Management for global and regional engineers */}
          {user && (user.role === "global_engineer" || user.role === "regional_engineer") && (
            <Link to="/user-management" className="text-foreground hover:text-primary transition-colors">
              User Management
            </Link>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/ecg-logo.png" alt="ECG Logo" className="h-10 w-auto" />
            <span className="font-bold text-lg hidden md:block">ECG Fault Master</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <NavLinks />
          </nav>
          
          <div className="ml-4 flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User size={16} />
                    <span>{user?.name || "User"}</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
                
                {/* Mobile Asset Management links */}
                {isAuthenticated && (
                  <div className="space-y-3">
                    <div className="font-medium">Asset Management</div>
                    <div className="pl-4 space-y-2">
                      <Link 
                        to="/asset-management/load-monitoring" 
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        Load Monitoring
                      </Link>
                      <Link 
                        to="/asset-management/inspection-management" 
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        Substation Inspection
                      </Link>
                      <Link 
                        to="/asset-management/vit-inspection" 
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        VITs Inspection
                      </Link>
                    </div>
                  </div>
                )}
              </nav>
              
              <Separator className="my-4" />
              
              <div className="mt-auto">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-medium">{user?.name || "User"}</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Log Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
