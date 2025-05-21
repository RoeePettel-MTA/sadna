/**
 * User Roles and Permissions Model
 * 
 * This module defines the role-based access control (RBAC) system for the application.
 */

// Available user roles
export enum UserRole {
  ADMIN = 'admin',
  FARM_WORKER = 'farm_worker',
  SEISMOLOGIST = 'seismologist',
  OBSERVER = 'observer'
}

// Permission types
export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Cow management permissions
  VIEW_COWS = 'view_cows',
  ADD_COW = 'add_cow',
  EDIT_COW = 'edit_cow',
  DELETE_COW = 'delete_cow',
  
  // Sensor management permissions
  VIEW_SENSORS = 'view_sensors',
  ADD_SENSOR = 'add_sensor',
  EDIT_SENSOR = 'edit_sensor',
  DELETE_SENSOR = 'delete_sensor',
  CALIBRATE_SENSOR = 'calibrate_sensor',
  
  // Location management permissions
  VIEW_LOCATIONS = 'view_locations',
  ADD_LOCATION = 'add_location',
  EDIT_LOCATION = 'edit_location',
  DELETE_LOCATION = 'delete_location',
  
  // Alert permissions
  VIEW_ALERTS = 'view_alerts',
  ACKNOWLEDGE_ALERTS = 'acknowledge_alerts',
  DELETE_ALERTS = 'delete_alerts',
  EXPORT_ALERTS = 'export_alerts',
  
  // Anomaly detection permissions
  VIEW_ANOMALIES = 'view_anomalies',
  CONFIGURE_DETECTION = 'configure_detection',
  TRAIN_MODELS = 'train_models',
  
  // User management permissions
  VIEW_USERS = 'view_users',
  ADD_USER = 'add_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  
  // System configuration permissions
  VIEW_SYSTEM_CONFIG = 'view_system_config',
  EDIT_SYSTEM_CONFIG = 'edit_system_config'
}

// Role-permission mappings
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission)
  ],
  
  [UserRole.FARM_WORKER]: [
    // Dashboard access
    Permission.VIEW_DASHBOARD,
    
    // Cow management
    Permission.VIEW_COWS,
    Permission.ADD_COW,
    Permission.EDIT_COW,
    
    // Sensor management
    Permission.VIEW_SENSORS,
    Permission.CALIBRATE_SENSOR,
    
    // Location management
    Permission.VIEW_LOCATIONS,
    
    // Alert handling
    Permission.VIEW_ALERTS,
    Permission.ACKNOWLEDGE_ALERTS,
    
    // Anomaly viewing
    Permission.VIEW_ANOMALIES
  ],
  
  [UserRole.SEISMOLOGIST]: [
    // Dashboard access
    Permission.VIEW_DASHBOARD,
    
    // Limited cow access
    Permission.VIEW_COWS,
    
    // Alert handling
    Permission.VIEW_ALERTS,
    Permission.ACKNOWLEDGE_ALERTS,
    Permission.EXPORT_ALERTS,
    
    // Anomaly detection
    Permission.VIEW_ANOMALIES,
    Permission.CONFIGURE_DETECTION,
    Permission.TRAIN_MODELS
  ],
  
  [UserRole.OBSERVER]: [
    // Read-only permissions
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_COWS,
    Permission.VIEW_SENSORS,
    Permission.VIEW_LOCATIONS,
    Permission.VIEW_ALERTS,
    Permission.VIEW_ANOMALIES
  ]
};

/**
 * Check if a user with the given role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Get all permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Get a human-readable description of a role
 */
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Full system access with all permissions';
    case UserRole.FARM_WORKER:
      return 'Manages cows and responds to alerts';
    case UserRole.SEISMOLOGIST:
      return 'Analyzes earthquake anomalies and configures detection models';
    case UserRole.OBSERVER:
      return 'Read-only access to system data';
    default:
      return 'Unknown role';
  }
}

/**
 * User model interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  lastLogin?: string;
  isActive: boolean;
}

// Mock users for development
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'admin',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    isActive: true
  },
  {
    id: 'user2',
    username: 'farmer',
    email: 'farmer@example.com',
    role: UserRole.FARM_WORKER,
    firstName: 'Farm',
    lastName: 'Worker',
    phoneNumber: '555-123-4567',
    isActive: true
  },
  {
    id: 'user3',
    username: 'scientist',
    email: 'scientist@example.com',
    role: UserRole.SEISMOLOGIST,
    firstName: 'Seismic',
    lastName: 'Scientist',
    isActive: true
  },
  {
    id: 'user4',
    username: 'observer',
    email: 'observer@example.com',
    role: UserRole.OBSERVER,
    firstName: 'Read',
    lastName: 'Only',
    isActive: true
  }
];