import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        userName: string;
        fullName?: string;
        phoneNumber?: string;
        photoURL?: string;
        gender?: string;
        isDisabled: boolean;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify JWT token
    const secret = env.jwtSecret;
    if (!secret) {
      return res.status(500).json({ 
        message: 'JWT secret is not configured',
        code: 'SERVER_ERROR'
      });
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Get user from database
    const user = await User.findById(decoded.sub).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({ 
        message: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role || 'customer',
      email: user.email,
      userName: user.userName,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      gender: user.gender,
      isDisabled: user.isDisabled
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
};
