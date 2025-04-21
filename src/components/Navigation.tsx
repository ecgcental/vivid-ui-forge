
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Make sure Button is imported

export function Navigation() {
  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          ECG App
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/asset-management" className="text-gray-600 hover:text-gray-900">
                Assets
              </Link>
            </li>
          </ul>
        </nav>
        
        <Button variant="outline" size="sm">
          Login
        </Button>
      </div>
    </header>
  );
}
