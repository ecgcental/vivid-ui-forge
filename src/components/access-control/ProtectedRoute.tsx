import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { hasRequiredRole } from '@/utils/security';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRegion?: string;
  allowedDistrict?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  allowedRegion, 
  allowedDistrict 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role) {
    if (!hasRequiredRole(user.role, requiredRole)) {
      // Allow technicians to access asset management pages
      if (location.pathname.startsWith('/asset-management') && user.role === 'technician') {
        return <>{children}</>;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check region-based access
  if (allowedRegion && user?.role !== 'global_engineer') {
    if (user?.region !== allowedRegion) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check district-based access
  if (allowedDistrict && user?.role === 'district_engineer') {
    if (user?.district !== allowedDistrict) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
} 