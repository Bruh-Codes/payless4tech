/**
 * Simple Admin Authentication for Railway Migration
 * Replaces Supabase auth with simple email/password system
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'payless4tech-secret-key-change-in-production';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: AdminUser): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<{ user: AdminUser; token: string } | null> {
  try {
    const result = await db.from('admin_users').select('*').eq('email', email).single();
    
    if (!result.data) {
      return null;
    }

    const user = result.data;
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    const token = generateToken(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Create admin user (for initial setup)
export async function createAdminUser(email: string, password: string, name: string): Promise<AdminUser | null> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await db.from('admin_users').insert({
      email,
      password_hash: hashedPassword,
      name,
      role: 'admin'
    }).select().single();

    if (!result.data) {
      return null;
    }

    return {
      id: result.data.id,
      email: result.data.email,
      name: result.data.name,
      role: result.data.role,
      created_at: result.data.created_at
    };
  } catch (error) {
    console.error('Create admin user error:', error);
    return null;
  }
}

// Middleware to check admin authentication
export function requireAdmin(req: Request): { user: any } | { error: string; status: number } {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  if (decoded.role !== 'admin') {
    return { error: 'Admin privileges required', status: 403 };
  }

  return { user: decoded };
}