import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import QuizResult from '@/models/QuizResult';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
}

const BELT_THRESHOLDS = [
  { belt: 'white',  min: 0 },
  { belt: 'yellow', min: 100 },
  { belt: 'green',  min: 300 },
  { belt: 'blue',   min: 600 },
  { belt: 'red',    min: 1000 },
  { belt: 'black',  min: 1500 },
];

function getBeltForXP(xp) {
  let belt = 'white';
  for (const t of BELT_THRESHOLDS) {
    if (xp >= t.min) belt = t.belt;
  }
  return belt;
}

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch quiz results for the user without populating subtopicId immediately
    const results = await QuizResult.find({ userId: decoded.userId })
      .sort({ date: -1 })
      .limit(limit);

    // Filter results to separate those with valid ObjectId subtopicId
    const toPopulate = [];
    const noPopulate = [];

    for (const r of results) {
      if (mongoose.Types.ObjectId.isValid(r.subtopicId)) {
        toPopulate.push(r);
      } else {
        noPopulate.push(r);
      }
    }

    // Populate only the valid ObjectIds
    if (toPopulate.length > 0) {
      await QuizResult.populate(toPopulate, {
        path: 'subtopicId',
        select: 'title topicId',
        populate: {
          path: 'topicId',
          select: 'title icon',
        },
      });
    }

    // Merge them back and sort by date descending
    const allResults = [...toPopulate, ...noPopulate].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const formattedResults = allResults.map(r => ({
      ...r.toObject(),
      id: r._id.toString(),
      $id: r._id.toString(),
    }));

    return NextResponse.json({ results: formattedResults }, { status: 200 });
  } catch (error) {
    console.error('Fetch quiz results error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching quiz results' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const { subtopicId, score, total, xpEarned, duration } = await req.json();

    if (!subtopicId || score === undefined || total === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate/Verify XP server-side to prevent client manipulation
    let validatedXp = 0;
    if (subtopicId === 'National Science Olympiad (NSO) Mock' || subtopicId === 'NSO_mock') {
      validatedXp = score * 20 + (score === total ? 50 : 0);
    } else {
      // Standard adaptive quiz: max possible is 30 XP per correct answer (difficulty 10 * 3)
      const maxAllowedXp = score * 30;
      const proposedXp = xpEarned || 0;
      validatedXp = Math.max(0, Math.min(proposedXp, maxAllowedXp));
    }

    // Save result
    const result = await QuizResult.create({
      userId: decoded.userId,
      subtopicId,
      score,
      total,
      xpEarned: validatedXp,
      duration: duration ? parseInt(duration) : 0,
      date: new Date(),
    });

    // Update User Profile gamification (XP, belt levels, streaks)
    const user = await User.findById(decoded.userId);
    if (user) {
      const prevXP = user.xp || 0;
      const newXP = prevXP + validatedXp;
      const newBelt = getBeltForXP(newXP);

      // Streak logic
      const now = new Date();
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      let newStreak = user.streak || 0;

      if (lastActiveDate) {
        const diffTime = Math.abs(now - lastActiveDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // reset streak if skipped a day
        }
      } else {
        newStreak = 1;
      }

      // Add subtopicId to completedTopics if not already completed
      const updatedCompleted = user.completedTopics.includes(subtopicId)
        ? user.completedTopics
        : [...user.completedTopics, subtopicId];

      await User.findByIdAndUpdate(decoded.userId, {
        xp: newXP,
        beltLevel: newBelt,
        streak: newStreak,
        lastActive: now,
        completedTopics: updatedCompleted,
      });
    }

    return NextResponse.json(
      {
        result: {
          ...result.toObject(),
          id: result._id.toString(),
          $id: result._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Save quiz result error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while saving quiz result' },
      { status: 500 }
    );
  }
}
