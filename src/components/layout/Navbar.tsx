
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
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
          {(user?.role === "regional_engineer" || user?.role === "global_engineer") && (
            <Link to="/analytics" className="text-foreground hover:text-primary transition-colors">
              Analytics
            </Link>
          )}
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
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAwUExURUdwTAWr8gOq8QCs8gCr8QGr8QSr8QCr8QCr8QCr8QCq8QSr8AKr8QKq8QKr8QGr8atTvxUAAAAPdFJOUwAQcJ/f7yBgzzDPr0CA329g2T4AAAFdSURBVDjLnZQxS8NAGIZfY5Ka1MHF4GBR0KWgBQcRdHDrocVJGhScXFxb/ANdHBTETVFwKQ7FH6A4OjnUTRAnQUEcBDdxUJDqGJOc33c5uEu/Ie/z3iUNAP9RyUWR5VrQY7IWkOGnBjqMrAQk9U7AQo+ScZBXPQmcYshJHQPRryR+Fz3/WJFoFMDkEVXhoffLOliGT4xo4qhp8OEvJt4MsI3zkAZIGHDPNHlQGTRkQTUYIuDQCmOZZiA6CEh5YL0yBTVgglQYYJO2UXWA0IcAGsUJHYB2CyM6uaIADG+OKKXhfAp8QM90QkZJJgWeYTqkY5lLwRuKYwbIZARSYL9YbvyLLVewAVrDFTygAC7+a1aCK8QprDB7c4UO8NlZx1GZrFtVJj6AOm2isBw0Bi6Zp+EA3yRRD0ioM3WZ1QO8d+Yhm3oAL9fcnTLWAwQjFJqG0Pg30GiVF98pWvIB5ew7LSFT6mkAAAAASUVORK5CYII=" 
              alt="ECG Logo" 
              className="h-8 w-8"
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
              <div className="flex items-center gap-2">
                <User size={18} />
                <span className="text-sm font-medium">{user?.name}</span>
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
                  <NavLinks />
                </nav>
                <div className="mt-auto">
                  <Separator className="my-4" />
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User size={18} />
                        <span className="text-sm font-medium">{user?.name}</span>
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
