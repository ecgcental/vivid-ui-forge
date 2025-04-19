import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";
import { toast } from "@/components/ui/sonner";

// Export the interface
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, region?: string, district?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "district@ecg.com",
    name: "District Engineer",
    role: "district_engineer",
    region: "ACCRA EAST REGION",
    district: "MAKOLA",
    password: "password"
  },
  {
    id: "2",
    email: "regional@ecg.com",
    name: "Regional Engineer",
    role: "regional_engineer",
    region: "ACCRA EAST REGION",
    password: "password"
  },
  {
    id: "3",
    email: "global@ecg.com",
    name: "Global Engineer",
    role: "global_engineer",
    password: "password"
  },
  {
    id: "4",
    email: "district2@ecg.com",
    name: "Tema District Engineer",
    role: "district_engineer",
    region: "TEMA REGION",
    district: "TEMA NORTH",
    password: "password"
  },
  {
    id: "5",
    email: "district3@ecg.com",
    name: "Kumasi District Engineer",
    role: "district_engineer",
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST",
    password: "password"
  },
  {
    id: "6",
    email: "regional2@ecg.com",
    name: "Ashanti Regional Engineer",
    role: "regional_engineer",
    region: "ASHANTI EAST REGION",
    password: "password"
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("ecg_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (foundUser) {
        // Check if using temporary password
        if (foundUser.tempPassword && foundUser.tempPassword === password) {
          if (foundUser.mustChangePassword) {
            // Store user info for password change
            localStorage.setItem("temp_user", JSON.stringify(foundUser));
            throw new Error("password_change_required");
          }
        } else if (foundUser.password && foundUser.password === password) {
          // Regular password login
          setUser(foundUser);
          localStorage.setItem("ecg_user", JSON.stringify(foundUser));
          toast.success("Login successful!");
        } else {
          throw new Error("Invalid email or password");
        }
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      if ((error as Error).message === "password_change_required") {
        throw error; // Let the login page handle the password change flow
      } else {
        toast.error("Login failed: " + (error as Error).message);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, region?: string, district?: string) => {
    setLoading(true);
    try {
      // Validate role assignment
      if (role === "district_engineer") {
        if (!region || !district) {
          throw new Error("District engineers must have both region and district assigned");
        }
      } else if (role === "regional_engineer") {
        if (!region) {
          throw new Error("Regional engineers must have a region assigned");
        }
      }

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error("User already exists");
      }
      
      // Create new user with role-based access control
      const newUser: User = {
        id: (MOCK_USERS.length + 1).toString(),
        email,
        name,
        role,
        region,
        district,
        tempPassword: password,
        mustChangePassword: true
      };
      
      // In a real app, we would add to database
      // For demo, we'll just add to our mock array and localStorage
      MOCK_USERS.push(newUser);
      setUser(newUser);
      localStorage.setItem("ecg_user", JSON.stringify(newUser));
      
      // Apply role-based access control immediately
      if (role === "district_engineer") {
        // District engineers can only access their district
        localStorage.setItem("user_access_scope", JSON.stringify({
          region: region,
          district: district
        }));
      } else if (role === "regional_engineer") {
        // Regional engineers can access their entire region
        localStorage.setItem("user_access_scope", JSON.stringify({
          region: region
        }));
      } else if (role === "global_engineer") {
        // Global engineers have full access
        localStorage.setItem("user_access_scope", JSON.stringify({
          global: true
        }));
      }

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Signup failed: " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ecg_user");
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
