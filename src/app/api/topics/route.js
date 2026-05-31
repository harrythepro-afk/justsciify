import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Subtopic from '@/models/Subtopic';

export async function GET(req) {
  try {
    await dbConnect();
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
    const data = await req.json();

    const topic = await Topic.create(data);
    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating topic' },
      { status: 500 }
    );
  }
}
