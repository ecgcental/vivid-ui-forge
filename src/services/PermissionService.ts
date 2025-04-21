import { UserRole } from "@/lib/types";
import { LoadMonitoringData } from "@/lib/asset-types";

export class PermissionService {
  private static instance: PermissionService;
  private roleHierarchy: { [key in Exclude<UserRole, null>]: number } = {
    'technician': 1,
    'district_engineer': 2,
    'regional_engineer': 3,
    'global_engineer': 4,
    'system_admin': 5
  };

  private featurePermissions: { [key: string]: UserRole[] } = {
    'asset_management': ['technician', 'district_engineer', 'regional_engineer', 'global_engineer', 'system_admin'],
    'inspection_management': ['technician', 'district_engineer', 'regional_engineer', 'global_engineer', 'system_admin'],
    'load_monitoring': ['technician', 'district_engineer', 'regional_engineer', 'global_engineer', 'system_admin'],
    'user_management': ['global_engineer', 'system_admin'],
    'system_configuration': ['system_admin']
  };

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // Basic role-based access control
  public hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    if (!userRole || !requiredRole) return false;
    if (userRole === 'system_admin') return true;
    return this.roleHierarchy[userRole] >= this.roleHierarchy[requiredRole];
  }

  // Feature management methods
  public addFeature(feature: string, allowedRoles: UserRole[]): void {
    if (this.featurePermissions[feature]) {
      throw new Error('Feature already exists');
    }
    this.featurePermissions[feature] = allowedRoles;
  }

  public updateFeaturePermissions(feature: string, allowedRoles: UserRole[]): void {
    if (!this.featurePermissions[feature]) {
      throw new Error('Feature does not exist');
    }
    this.featurePermissions[feature] = allowedRoles;
  }

  public removeFeature(feature: string): void {
    if (!this.featurePermissions[feature]) {
      throw new Error('Feature does not exist');
    }
    delete this.featurePermissions[feature];
  }

  public getFeaturePermissions(): { [key: string]: UserRole[] } {
    return { ...this.featurePermissions };
  }

  // Feature access permissions
  public canAccessFeature(userRole: UserRole, feature: string): boolean {
    return this.featurePermissions[feature]?.includes(userRole) || false;
  }

  // Asset permissions
  public canViewAsset(userRole: UserRole, userRegion: string | null, userDistrict: string | null, assetRegion: string, assetDistrict: string): boolean {
    if (userRole === 'global_engineer') return true;
    if (userRole === 'regional_engineer') return userRegion === assetRegion;
    if (userRole === 'district_engineer' || userRole === 'technician') return userDistrict === assetDistrict;
    return false;
  }

  public canEditAsset(userRole: UserRole, userRegion: string | null, userDistrict: string | null, assetRegion: string, assetDistrict: string): boolean {
    if (userRole === 'global_engineer' || userRole === 'system_admin') return true;
    if (userRole === 'regional_engineer') return userRegion === assetRegion;
    if (userRole === 'district_engineer' || userRole === 'technician') return userDistrict === assetDistrict;
    return false;
  }

  public canDeleteAsset(userRole: UserRole, userRegion: string | null, userDistrict: string | null, assetRegion: string, assetDistrict: string): boolean {
    if (userRole === 'global_engineer' || userRole === 'system_admin') return true;
    if (userRole === 'regional_engineer') return userRegion === assetRegion;
    if (userRole === 'district_engineer') return userDistrict === assetDistrict;
    return false;
  }

  // Inspection permissions
  public canViewInspection(userRole: UserRole, userRegion: string | null, userDistrict: string | null, inspectionRegion: string, inspectionDistrict: string): boolean {
    if (userRole === 'global_engineer' || userRole === 'system_admin') return true;
    if (userRole === 'regional_engineer') return userRegion === inspectionRegion;
    if (userRole === 'district_engineer' || userRole === 'technician') return userDistrict === inspectionDistrict;
    return false;
  }

  public canEditInspection(userRole: UserRole, userRegion: string | null, userDistrict: string | null, inspectionRegion: string, inspectionDistrict: string): boolean {
    if (userRole === 'global_engineer') return true;
    if (userRole === 'regional_engineer') return userRegion === inspectionRegion;
    if (userRole === 'district_engineer' || userRole === 'technician') return userDistrict === inspectionDistrict;
    return false;
  }

  public canDeleteInspection(userRole: UserRole, userRegion: string | null, userDistrict: string | null, inspectionRegion: string, inspectionDistrict: string): boolean {
    if (userRole === 'global_engineer' || userRole === 'system_admin') return true;
    if (userRole === 'regional_engineer') return userRegion === inspectionRegion;
    if (userRole === 'district_engineer') return userDistrict === inspectionDistrict;
    return false;
  }

  // Load monitoring permissions
  public canViewLoadMonitoring(userRole: UserRole, userRegion: string | null, userDistrict: string | null, recordRegion: string, recordDistrict: string): boolean {
    if (userRole === 'global_engineer' || userRole === 'system_admin') return true;
    if (userRole === 'regional_engineer') return userRegion === recordRegion;
    if (userRole === 'district_engineer') return userDistrict === recordDistrict;
    return false;
  }

  public canEditLoadMonitoring(userRole: UserRole, userRegion: string | null, userDistrict: string | null, recordRegion: string, recordDistrict: string): boolean {
    return this.canViewLoadMonitoring(userRole, userRegion, userDistrict, recordRegion, recordDistrict);
  }

  public canDeleteLoadMonitoring(userRole: UserRole, userRegion: string | null, userDistrict: string | null, recordRegion: string, recordDistrict: string): boolean {
    return this.canEditLoadMonitoring(userRole, userRegion, userDistrict, recordRegion, recordDistrict);
  }

  // User management permissions
  public canManageUsers(userRole: UserRole): boolean {
    return userRole === 'system_admin' || userRole === 'global_engineer';
  }

  public canManageStaffIds(userRole: UserRole): boolean {
    return userRole === 'system_admin' || userRole === 'global_engineer';
  }

  public canManageDistrictPopulation(userRole: UserRole): boolean {
    return userRole === 'district_engineer' || userRole === 'regional_engineer' || userRole === 'global_engineer' || userRole === 'system_admin';
  }
} 