import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: {
    resource: string;
    action: string;
  }[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      // Redirect to unauthorized page or home
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(({ resource, action }) => {
      // This would need to be implemented in the useAuth hook
      // For now, we'll use role-based checking
      return checkPermission(user.role, resource, action);
    });

    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to check permissions based on role
const checkPermission = (role: string, resource: string, action: string): boolean => {
  const rolePermissions: Record<string, Record<string, string[]>> = {
    admin: {
      users: ['create', 'read', 'update', 'delete'],
      services: ['create', 'read', 'update', 'delete'],
      appointments: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      system: ['read', 'update']
    },
    staff: {
      users: ['read', 'update'],
      services: ['create', 'read', 'update'],
      appointments: ['create', 'read', 'update'],
      reports: ['read']
    },
    technician: {
      services: ['read', 'update'],
      appointments: ['read', 'update'],
      profile: ['read', 'update']
    },
    customer: {
      profile: ['read', 'update'],
      appointments: ['create', 'read'],
      services: ['read']
    }
  };

  const userPermissions = rolePermissions[role];
  if (!userPermissions) return false;

  const resourcePermissions = userPermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};

// Convenience components for specific roles
export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const StaffRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'staff']}>
    {children}
  </ProtectedRoute>
);

export const TechnicianRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'staff', 'technician']}>
    {children}
  </ProtectedRoute>
);

export const CustomerRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['customer']}>
    {children}
  </ProtectedRoute>
);

export const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['admin', 'staff', 'technician', 'customer']}>
    {children}
  </ProtectedRoute>
);
