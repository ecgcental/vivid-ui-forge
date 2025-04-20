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
import { StaffIdEntry } from "@/components/user-management/StaffIdManagement";

// Export the interface
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, region?: string, district?: string, staffId?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  resetUserPassword: (email: string, newPassword: string) => void;
  verifyStaffId: (staffId: string) => { isValid: boolean; staffInfo?: { name: string; role: UserRole; region?: string; district?: string } };
  staffIds: StaffIdEntry[];
  addStaffId: (entry: Omit<StaffIdEntry, "id"> & { customId?: string }) => void;
  updateStaffId: (id: string, entry: Omit<StaffIdEntry, "id">) => void;
  deleteStaffId: (id: string) => void;
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
    password: SHA256("password").toString(),
    staffId: "ECG001"
  },
  {
    id: "2",
    email: "regional@ecg.com",
    name: "Regional Engineer",
    role: "regional_engineer",
    region: "ACCRA EAST REGION",
    password: SHA256("password").toString(),
    staffId: "ECG002"
  },
  {
    id: "3",
    email: "global@ecg.com",
    name: "Global Engineer",
    role: "global_engineer",
    password: SHA256("password").toString(),
    staffId: "ECG003"
  },
  {
    id: "4",
    email: "district2@ecg.com",
    name: "Tema District Engineer",
    role: "district_engineer",
    region: "TEMA REGION",
    district: "TEMA NORTH",
    password: SHA256("password").toString(),
    staffId: "ECG004"
  },
  {
    id: "5",
    email: "district3@ecg.com",
    name: "Kumasi District Engineer",
    role: "district_engineer",
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST",
    password: SHA256("password").toString(),
    staffId: "ECG005"
  },
  {
    id: "6",
    email: "regional2@ecg.com",
    name: "Ashanti Regional Engineer",
    role: "regional_engineer",
    region: "ASHANTI EAST REGION",
    password: SHA256("password").toString(),
    staffId: "ECG006"
  },
  {
    id: "7",
    email: "technician@ecg.com",
    name: "Accra Technician",
    role: "technician",
    region: "ACCRA EAST REGION",
    district: "MAKOLA",
    password: SHA256("password").toString(),
    staffId: "ECG007"
  }
];

// Mock staff ID database for verification
const STAFF_ID_DATABASE = [
  {
    id: "ECG001",
    name: "District Engineer 1",
    role: "district_engineer" as UserRole,
    region: "ACCRA EAST REGION",
    district: "MAKOLA"
  },
  {
    id: "ECG002",
    name: "Regional Engineer 1",
    role: "regional_engineer" as UserRole,
    region: "ACCRA EAST REGION"
  },
  {
    id: "ECG003",
    name: "Global Engineer 1",
    role: "global_engineer" as UserRole
  },
  {
    id: "ECG004",
    name: "District Engineer 2",
    role: "district_engineer" as UserRole,
    region: "TEMA REGION",
    district: "TEMA NORTH"
  },
  {
    id: "ECG005",
    name: "District Engineer 3",
    role: "district_engineer" as UserRole,
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST"
  },
  {
    id: "ECG006",
    name: "Regional Engineer 2",
    role: "regional_engineer" as UserRole,
    region: "ASHANTI EAST REGION"
  },
  {
    id: "ECG007",
    name: "Technician 1",
    role: "technician" as UserRole,
    region: "ACCRA EAST REGION",
    district: "MAKOLA"
  },
  {
    id: "ECG008",
    name: "Technician 2",
    role: "technician" as UserRole,
    region: "TEMA REGION",
    district: "TEMA NORTH"
  },
  {
    id: "ECG009",
    name: "Technician 3",
    role: "technician" as UserRole,
    region: "ASHANTI EAST REGION",
    district: "KUMASI EAST"
  },
  {
    id: "ECG010",
    name: "Technician 4",
    role: "technician" as UserRole,
    region: "CAPE COAST REGION",
    district: "CAPE COAST"
  },
  {
    id: "ECGADMIN",
    name: "System Administrator",
    role: "system_admin" as UserRole
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
  const [staffIds, setStaffIds] = useState<StaffIdEntry[]>(() => {
    // Try to load staff IDs from localStorage
    const storedStaffIds = localStorage.getItem("ecg_staff_ids");
    if (storedStaffIds) {
      try {
        return JSON.parse(storedStaffIds);
      } catch (error) {
        console.error("Error parsing stored staff IDs:", error);
        return STAFF_ID_DATABASE;
      }
    }
    return STAFF_ID_DATABASE;
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

  // Save staff IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("ecg_staff_ids", JSON.stringify(staffIds));
  }, [staffIds]);

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

      // Check if user is disabled
      if (foundUser.disabled) {
        throw new Error("Your account has been disabled. Please contact your system administrator.");
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

  const verifyStaffId = (staffId: string) => {
    // First check if it's a custom staff ID (not in the format ECGXXX)
    if (!/^ECG\d{3}$/.test(staffId)) {
      // Check if it exists in the staff ID management system
      const customStaff = staffIds.find(s => s.id === staffId);
      if (customStaff) {
        return {
          isValid: true,
          staffInfo: {
            name: customStaff.name,
            role: customStaff.role,
            region: customStaff.region,
            district: customStaff.district
          }
        };
      }
      
      // For new custom staff IDs, we'll still validate the format
      if (!/^[A-Z0-9]{6,10}$/.test(staffId)) {
        return { isValid: false };
      }
      
      // For new custom staff IDs, we'll return a valid response but without auto-populated info
      return {
        isValid: true,
        staffInfo: {
          name: "", // Will be filled by the user
          role: "technician" as UserRole, // Default role
          region: undefined,
          district: undefined
        }
      };
    }
    
    // For ECGXXX format staff IDs, use the existing database
    const staff = staffIds.find(s => s.id === staffId);
    if (!staff) {
      return { isValid: false };
    }
    
    return {
      isValid: true,
      staffInfo: {
        name: staff.name,
        role: staff.role,
        region: staff.region,
        district: staff.district
      }
    };
  };

  const signup = async (email: string, password: string, name: string, role: UserRole, region?: string, district?: string, staffId?: string) => {
    setLoading(true);
    try {
      // Validate and sanitize inputs
      const sanitizedInput = {
        email: sanitizeInput(email),
        password,
        name: sanitizeInput(name),
        role,
        region: region ? sanitizeInput(region) : undefined,
        district: district ? sanitizeInput(district) : undefined,
        staffId: staffId ? sanitizeInput(staffId) : undefined
      };
      
      validateUserInput(sanitizedInput);

      // Password validation
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error("Password must contain at least one uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        throw new Error("Password must contain at least one lowercase letter");
      }
      if (!/[0-9]/.test(password)) {
        throw new Error("Password must contain at least one number");
      }
      if (!/^[a-zA-Z0-9]+$/.test(password)) {
        throw new Error("Password can only contain letters and numbers");
      }

      // Verify staff ID if provided
      if (staffId) {
        const { isValid, staffInfo } = verifyStaffId(staffId);
        
        if (!isValid) {
          throw new Error("Invalid staff ID. Please check and try again.");
        }
        
        // If staff info exists, verify that the provided role, region, and district match
        if (staffInfo) {
          if (staffInfo.role !== role) {
            throw new Error(`Staff ID is assigned to a ${staffInfo.role.replace('_', ' ')} role, not ${role.replace('_', ' ')}`);
          }
          
          if (staffInfo.region && staffInfo.region !== region) {
            throw new Error(`Staff ID is assigned to ${staffInfo.region} region, not ${region}`);
          }
          
          if (staffInfo.district && staffInfo.district !== district) {
            throw new Error(`Staff ID is assigned to ${staffInfo.district} district, not ${district}`);
          }
          
          // Use the name from staff database if it doesn't match
          if (staffInfo.name !== name) {
            console.warn(`Name provided (${name}) doesn't match staff database (${staffInfo.name}). Using staff database name.`);
            sanitizedInput.name = staffInfo.name;
          }
        }
      } else {
        // If no staff ID is provided, only allow global engineers to sign up
        if (role !== "global_engineer") {
          throw new Error("Staff ID is required for all roles except global engineer");
        }
      }

      // Validate role assignment
      if (role === "district_engineer" && (!region || !district)) {
        throw new Error("District engineers must have both region and district assigned");
      }
      if (role === "regional_engineer" && !region) {
        throw new Error("Regional engineers must have a region assigned");
      }
      if (role === "technician" && (!region || !district)) {
        throw new Error("Technicians must have both region and district assigned");
      }

      // Check if user exists
      if (users.some(u => u.email === sanitizedInput.email)) {
        throw new Error("User already exists");
      }
      
      // Check if staff ID is already used
      if (staffId && users.some(u => u.staffId === staffId)) {
        throw new Error("Staff ID is already registered");
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

  const addStaffId = (entry: Omit<StaffIdEntry, "id"> & { customId?: string }) => {
    // Check if a custom ID is provided
    if (entry.customId) {
      // Validate custom ID format
      if (!/^[A-Z0-9]{6,10}$/.test(entry.customId)) {
        throw new Error("Custom staff ID must be 6-10 alphanumeric characters");
      }
      
      // Check if ID already exists
      if (staffIds.some(s => s.id === entry.customId)) {
        throw new Error("Staff ID already exists");
      }
      
      const newEntry: StaffIdEntry = {
        id: entry.customId,
        name: entry.name,
        role: entry.role,
        region: entry.region,
        district: entry.district
      };
      setStaffIds(prev => [...prev, newEntry]);
    } else {
      // Generate ECGXXX format ID
      const newEntry: StaffIdEntry = {
        id: `ECG${String(staffIds.length + 1).padStart(3, '0')}`,
        name: entry.name,
        role: entry.role,
        region: entry.region,
        district: entry.district
      };
      setStaffIds(prev => [...prev, newEntry]);
    }
  };

  const updateStaffId = (id: string, entry: Omit<StaffIdEntry, "id">) => {
    setStaffIds(prev => prev.map(item => item.id === id ? { ...entry, id } : item));
  };

  const deleteStaffId = (id: string) => {
    // Check if the staff ID is in use by any user
    const isInUse = users.some(user => user.staffId === id);
    if (isInUse) {
      throw new Error("Cannot delete staff ID that is in use by a user");
    }
    setStaffIds(prev => prev.filter(item => item.id !== id));
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
        resetUserPassword,
        verifyStaffId,
        staffIds,
        addStaffId,
        updateStaffId,
        deleteStaffId
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
