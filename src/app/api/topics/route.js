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

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const classNum = searchParams.get('classNum');

    const query = {};
    if (classNum) {
      query.classNum = parseInt(classNum);
    }

    const topics = await Topic.find(query).sort({ classNum: 1, title: 1 });

    // For each topic, fetch its subtopics and nest them
    const populatedTopics = await Promise.all(
      topics.map(async (topic) => {
        const subtopics = await Subtopic.find({ topicId: topic._id }).sort({ order: 1 });
        return {
          ...topic.toObject(),
          id: topic._id.toString(), // For compatibility with existing front-end which uses Appwrite's $id
          $id: topic._id.toString(),
          subtopics: subtopics.map(s => ({
            ...s.toObject(),
            id: s._id.toString(),
            $id: s._id.toString(),
          })),
        };
      })
    );

    return NextResponse.json({ topics: populatedTopics }, { status: 200 });
  } catch (error) {
    console.error('Fetch topics error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching topics' },
      { status: 500 }
    );
  }
}

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

    const data = await req.json();
    const topic = await Topic.create(data);
    
    return NextResponse.json({
      ...topic.toObject(),
      id: topic._id.toString(),
      $id: topic._id.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating topic' },
      { status: 500 }
    );
  }
}
