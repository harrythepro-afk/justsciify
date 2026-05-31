import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Subtopic from '@/models/Subtopic';

export async function GET(req, { params }) {
  try {
    await dbConnect();
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
