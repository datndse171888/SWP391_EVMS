import { Request, Response, NextFunction } from 'express';

// Role hierarchy: admin > staff > technician > customer
const ROLE_HIERARCHY = {
  admin: 4,
  staff: 3,
  technician: 2,
  customer: 1
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const userRole = req.user.role;
      
      if (!userRole) {
        return res.status(403).json({ 
          message: 'User role not defined',
          code: 'ROLE_NOT_DEFINED'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRole
        });
      }

      // Additional check: admin can access everything
      if (userRole === 'admin') {
        return next();
      }

      // For other roles, check if they have minimum required level
      const userRoleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
      const requiredLevel = Math.min(...allowedRoles.map(role => 
        ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] || 0
      ));

      if (userRoleLevel < requiredLevel) {
        return res.status(403).json({ 
          message: 'Insufficient role level',
          code: 'INSUFFICIENT_ROLE_LEVEL',
          required: allowedRoles,
          current: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  };
};

// Convenience middleware for specific roles
export const adminOnly = roleMiddleware(['admin']);
export const staffOnly = roleMiddleware(['admin', 'staff']);
export const technicianOnly = roleMiddleware(['admin', 'staff', 'technician']);
export const customerOnly = roleMiddleware(['customer']);
export const authenticatedOnly = roleMiddleware(['admin', 'staff', 'technician', 'customer']);
