import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser } from '@/lib/simple-auth';
import { query } from '@/lib/db-server';

export async function POST(request: NextRequest) {
  try {
    // Check if any admin users already exist
    const existingAdmins = await query('SELECT id FROM admin_users LIMIT 1');
    
    if (existingAdmins.data && existingAdmins.data.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. This endpoint can only be used once.' },
        { status: 400 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const adminUser = await createAdminUser(email, password, name);

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error: any) {
    console.error('Setup admin API error:', error);
    
    if (error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'An admin user with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}