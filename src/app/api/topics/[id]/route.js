import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Subtopic from '@/models/Subtopic';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
}

async function checkAdmin() {
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

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    // Auth check
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const topic = await Topic.findById(id);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const subtopics = await Subtopic.find({ topicId: topic._id }).sort({ order: 1 });

    const topicObj = {
      ...topic.toObject(),
      id: topic._id.toString(),
      $id: topic._id.toString(),
      subtopics: subtopics.map(s => ({
        ...s.toObject(),
        id: s._id.toString(),
        $id: s._id.toString(),
      })),
    };

    return NextResponse.json({ topic: topicObj }, { status: 200 });
  } catch (error) {
    console.error('Fetch single topic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching the topic' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { id } = params;
    const data = await req.json();

    const topic = await Topic.findByIdAndUpdate(id, data, { new: true });
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...topic.toObject(),
      id: topic._id.toString(),
      $id: topic._id.toString()
    }, { status: 200 });
  } catch (error) {
    console.error('Update topic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while updating topic' },
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

    const { id } = params;
    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Optionally orphan or clean up subtopics
    await Subtopic.deleteMany({ topicId: id });

    return NextResponse.json({ success: true, message: 'Topic and its subtopics successfully deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while deleting topic' },
      { status: 500 }
    );
  }
}
