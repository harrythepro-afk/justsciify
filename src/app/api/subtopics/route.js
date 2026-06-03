import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Subtopic from '@/models/Subtopic';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    await dbConnect();
    
    // Admin check
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

    const user = await User.findById(decoded.userId);
    if (!user || user.email !== 'admin@justsciify.com') {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { topicId, title, description, order } = await req.json();

    if (!topicId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subtopic = await Subtopic.create({
      topicId,
      title,
      description,
      order: order !== undefined ? parseInt(order) : 0,
    });

    return NextResponse.json({
      ...subtopic.toObject(),
      id: subtopic._id.toString(),
      $id: subtopic._id.toString()
    }, { status: 201 });

  } catch (error) {
    console.error('Create subtopic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating subtopic' },
      { status: 500 }
    );
  }
}
