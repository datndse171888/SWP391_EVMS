import { Request } from 'express';

// User interface for authentication
export interface IUser {
  id: string;
  role: 'admin' | 'staff' | 'technician' | 'customer';
  email: string;
  userName: string;
  fullName?: string;
  phoneNumber?: string;
  photoURL?: string;
  gender?: string;
  isDisabled: boolean;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Role types
export type UserRole = 'admin' | 'staff' | 'technician' | 'customer';

// Permission types
export interface IPermission {
  resource: string;
  actions: string[];
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, IPermission[]> = {
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'services', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'system', actions: ['read', 'update'] }
  ],
  staff: [
    { resource: 'users', actions: ['read', 'update'] },
    { resource: 'services', actions: ['create', 'read', 'update'] },
    { resource: 'appointments', actions: ['create', 'read', 'update'] },
    { resource: 'reports', actions: ['read'] }
  ],
  technician: [
    { resource: 'services', actions: ['read', 'update'] },
    { resource: 'appointments', actions: ['read', 'update'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ],
  customer: [
    { resource: 'profile', actions: ['read', 'update'] },
    { resource: 'appointments', actions: ['create', 'read'] },
    { resource: 'services', actions: ['read'] }
  ]
};
