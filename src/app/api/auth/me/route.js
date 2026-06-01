import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
}

export async function GET() {
  try {
    await dbConnect();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while validating session' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // We only update clean updatable fields like classNum, name, xp, beltLevel, completedTopics, streak, lastActive
    const updatableFields = ['name', 'classNum', 'xp', 'beltLevel', 'completedTopics', 'streak', 'lastActive', 'unlockedAvatars', 'avatarId'];
    const updateData = {};
    for (const key of updatableFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while updating profile' },
      { status: 500 }
    );
  }
}
