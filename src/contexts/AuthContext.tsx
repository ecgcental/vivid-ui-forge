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
import { SHA256 } from "crypto-js";

// Export the interface
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, region?: string, district?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  resetUserPassword: (email: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users with hashed passwords
const INITIAL_MOCK_USERS: User[] = [
  {
    id: "1",
    email: "district@ecg.com",
    name: "District Engineer",
    role: "district_engineer",
    region: "ACCRA EAST REGION",
    district: "MAKOLA",
    password: SHA256("password").toString()
  },
  {
    id: "2",
    email: "regional@ecg.com",
    name: "Regional Engineer",
    role: "regional_engineer",
    region: "ACCRA EAST REGION",
    password: SHA256("password").toString()
  },
  {
    id: "3",
    email: "global@ecg.com",
    name: "Global Engineer",
    role: "global_engineer",
    password: SHA256("password").toString()
  },
  {
    id: "4",
    email: "district2@ecg.com",
    name: "Tema District Engineer",
    role: "district_engineer",
    region: "TEMA REGION",
    district: "TEMA NORTH",
    password: SHA256("password").toString()
  },
  {
    id: "5",
    email: "district3@ecg.com",
    name: "Kumasi District Engineer",
    role: "district_engineer",
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST",
    password: SHA256("password").toString()
  },
  {
    id: "6",
    email: "regional2@ecg.com",
    name: "Ashanti Regional Engineer",
    role: "regional_engineer",
    region: "ASHANTI EAST REGION",
    password: SHA256("password").toString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginAttempts, setLoginAttempts] = useState<{ [key: string]: { count: number; lastAttempt: number } }>({});
  const [users, setUsers] = useState<User[]>(() => {
    // Try to load users from localStorage
    const storedUsers = localStorage.getItem("ecg_users");
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error("Error parsing stored users:", error);
        return INITIAL_MOCK_USERS;
      }
    }
    return INITIAL_MOCK_USERS;
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ecg_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Check if session is valid
    const sessionData = localStorage.getItem("ecg_session");
    if (sessionData) {
      try {
        const session: SessionToken = JSON.parse(sessionData);
        if (validateSessionToken(session)) {
          const storedUser = users.find(u => u.id === session.userId);
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
  }, [users]);

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
      console.log("Attempting login for email:", sanitizedEmail);
      console.log("Input password:", password);
      
      // Check login attempts
      if (!checkLoginAttempts(sanitizedEmail)) {
        throw new Error("Too many login attempts. Please try again in 15 minutes.");
      }

      // Find user
      const foundUser = users.find(u => u.email === sanitizedEmail);
      console.log("Found user:", foundUser ? { 
        ...foundUser, 
        password: "***", 
        tempPassword: "***",
        hashedInputPassword: hashPassword(password)
      } : "Not found");
      
      if (!foundUser) {
        console.log("User not found");
        throw new Error("Invalid email or password");
      }

      // First check temporary password if it exists
      if (foundUser.tempPassword && password === foundUser.tempPassword) {
        console.log("Login successful with temporary password");
        // Create session
        const session = generateSessionToken(foundUser.id);
        storeSession(session);
        localStorage.setItem("ecg_session", JSON.stringify(session));
        
        // Set user without password
        const { password: _, tempPassword: __, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        toast.success("Login successful! Please change your password.");
        return;
      }

      // Check regular password
      const hashedPassword = hashPassword(password);
      console.log("Hashed input password:", hashedPassword);
      console.log("Stored hashed password:", foundUser.password);
      
      if (hashedPassword === foundUser.password) {
        console.log("Login successful with regular password");
        // Create session
        const session = generateSessionToken(foundUser.id);
        storeSession(session);
        localStorage.setItem("ecg_session", JSON.stringify(session));
        
        // Set user without password
        const { password: _, tempPassword: __, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        toast.success("Login successful!");
      } else {
        console.log("Password mismatch");
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
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
      if (users.some(u => u.email === sanitizedInput.email)) {
        throw new Error("User already exists");
      }
      
      // Create new user with hashed password
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...sanitizedInput,
        password: hashPassword(sanitizedInput.password)
      };
      
      // Add new user to state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
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

  const resetUserPassword = (email: string, newPassword: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.email === email) {
          return {
            ...user,
            password: hashPassword(newPassword),
            tempPassword: undefined,
            mustChangePassword: false
          };
        }
        return user;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        users,
        setUsers,
        resetUserPassword
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
