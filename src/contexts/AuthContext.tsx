import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";
import { toast } from "@/components/ui/sonner";
import {
  hashPassword,
  generateSessionToken,
  validateSessionToken,
  storeSession,
  sanitizeInput,
  validateUserInput,
  SessionToken
} from "@/utils/security";

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

// Mock users with hashed passwords
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "district@ecg.com",
    name: "District Engineer",
    role: "district_engineer",
    region: "ACCRA EAST REGION",
    district: "MAKOLA",
    password: hashPassword("password")
  },
  {
    id: "2",
    email: "regional@ecg.com",
    name: "Regional Engineer",
    role: "regional_engineer",
    region: "ACCRA EAST REGION",
    password: hashPassword("password")
  },
  {
    id: "3",
    email: "global@ecg.com",
    name: "Global Engineer",
    role: "global_engineer",
    password: hashPassword("password")
  },
  {
    id: "4",
    email: "district2@ecg.com",
    name: "Tema District Engineer",
    role: "district_engineer",
    region: "TEMA REGION",
    district: "TEMA NORTH",
    password: hashPassword("password")
  },
  {
    id: "5",
    email: "district3@ecg.com",
    name: "Kumasi District Engineer",
    role: "district_engineer",
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST",
    password: hashPassword("password")
  },
  {
    id: "6",
    email: "regional2@ecg.com",
    name: "Ashanti Regional Engineer",
    role: "regional_engineer",
    region: "ASHANTI EAST REGION",
    password: hashPassword("password")
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginAttempts, setLoginAttempts] = useState<{ [key: string]: { count: number; lastAttempt: number } }>({});

  useEffect(() => {
    // Check if session is valid
    const sessionData = localStorage.getItem("ecg_session");
    if (sessionData) {
      try {
        const session: SessionToken = JSON.parse(sessionData);
        if (validateSessionToken(session)) {
          const storedUser = MOCK_USERS.find(u => u.id === session.userId);
          if (storedUser) {
            const { password, ...userWithoutPassword } = storedUser;
            setUser(userWithoutPassword);
          }
        } else {
          // Clear invalid session
          localStorage.removeItem("ecg_session");
        }
      } catch (error) {
        // Handle invalid session data
        localStorage.removeItem("ecg_session");
      }
    }
    setLoading(false);
  }, []);

  const checkLoginAttempts = (email: string): boolean => {
    const now = Date.now();
    const attempts = loginAttempts[email];
    
    if (attempts) {
      // Reset attempts after 15 minutes
      if (now - attempts.lastAttempt > 15 * 60 * 1000) {
        setLoginAttempts(prev => ({ ...prev, [email]: { count: 1, lastAttempt: now } }));
        return true;
      }
      
      // Block after 5 attempts
      if (attempts.count >= 5) {
        return false;
      }
      
      setLoginAttempts(prev => ({
        ...prev,
        [email]: { count: attempts.count + 1, lastAttempt: now }
      }));
    } else {
      setLoginAttempts(prev => ({ ...prev, [email]: { count: 1, lastAttempt: now } }));
    }
    
    return true;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email);
      
      // Check login attempts
      if (!checkLoginAttempts(sanitizedEmail)) {
        throw new Error("Too many login attempts. Please try again in 15 minutes.");
      }

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user and verify password
      const foundUser = MOCK_USERS.find(u => u.email === sanitizedEmail);
      
      if (foundUser) {
        const hashedPassword = hashPassword(password);
        if (hashedPassword === foundUser.password) {
          // Create session
          const session = generateSessionToken(foundUser.id);
          storeSession(session);
          localStorage.setItem("ecg_session", JSON.stringify(session));
          
          // Set user without password
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          toast.success("Login successful!");
        } else {
          throw new Error("Invalid email or password");
        }
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, region?: string, district?: string) => {
    setLoading(true);
    try {
      // Validate and sanitize inputs
      const sanitizedInput = {
        email: sanitizeInput(email),
        password,
        name: sanitizeInput(name),
        role,
        region: region ? sanitizeInput(region) : undefined,
        district: district ? sanitizeInput(district) : undefined
      };
      
      validateUserInput(sanitizedInput);

      // Validate role assignment
      if (role === "district_engineer" && (!region || !district)) {
        throw new Error("District engineers must have both region and district assigned");
      }
      if (role === "regional_engineer" && !region) {
        throw new Error("Regional engineers must have a region assigned");
      }

      // Check if user exists
      if (MOCK_USERS.some(u => u.email === sanitizedInput.email)) {
        throw new Error("User already exists");
      }
      
      // Create new user with hashed password
      const newUser: User = {
        id: crypto.randomUUID(),
        ...sanitizedInput,
        password: hashPassword(sanitizedInput.password)
      };
      
      // In a real app, we would add to database
      MOCK_USERS.push(newUser);
      
      // Create session
      const session = generateSessionToken(newUser.id);
      storeSession(session);
      localStorage.setItem("ecg_session", JSON.stringify(session));
      
      // Set user without password
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
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
    localStorage.removeItem("ecg_session");
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
