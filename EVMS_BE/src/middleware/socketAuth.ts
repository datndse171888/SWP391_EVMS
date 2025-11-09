import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Socket } from 'socket.io';
import { User } from '../models/User.js';

// Extend Socket interface
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const socketAuth = async (socket: AuthenticatedSocket, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }
    
    // Verify JWT token
    const secret = env.jwtSecret;
    if (!secret) {
      return next(new Error('Authentication error: JWT secret not configured'));
    }

    const decoded = jwt.verify(token, secret) as { sub: string };
    
    // Get user from database
    const user = await User.findById(decoded.sub).select('-passwordHash');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (user.isDisabled) {
      return next(new Error('Authentication error: Account is disabled'));
    }

    // Attach user info to socket
    socket.userId = user._id.toString();
    socket.userRole = user.role || 'customer';
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
    
    console.error('Socket auth error:', error);
    return next(new Error('Authentication error'));
  }
};

