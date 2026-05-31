import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch top users sorted by XP in descending order
    const topUsers = await User.find({})
      .select('name xp beltLevel streak classNum')
      .sort({ xp: -1 })
      .limit(limit);

    const formattedUsers = topUsers.map((u) => ({
      ...u.toObject(),
      id: u._id.toString(),
      $id: u._id.toString(),
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching the leaderboard' },
      { status: 500 }
    );
  }
}
