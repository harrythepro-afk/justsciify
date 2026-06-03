import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Subtopic from '@/models/Subtopic';
import Question from '@/models/Question';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

async function checkAdmin() {
  if (!JWT_SECRET) return null;
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user && user.email === 'admin@justsciify.com') {
      return user;
    }
  } catch {}
  return null;
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { subtopicId } = params;
    const data = await req.json();

    const subtopic = await Subtopic.findByIdAndUpdate(subtopicId, data, { new: true });
    if (!subtopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...subtopic.toObject(),
      id: subtopic._id.toString(),
      $id: subtopic._id.toString()
    }, { status: 200 });

  } catch (error) {
    console.error('Update subtopic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while updating subtopic' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { subtopicId } = params;
    const subtopic = await Subtopic.findByIdAndDelete(subtopicId);
    if (!subtopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 });
    }

    // Cascade delete questions in this subtopic
    await Question.deleteMany({ subtopicId });

    return NextResponse.json({ success: true, message: 'Subtopic and questions deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete subtopic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while deleting subtopic' },
      { status: 500 }
    );
  }
}
