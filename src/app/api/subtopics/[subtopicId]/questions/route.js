import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
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

    const { subtopicId } = params;
    const questions = await Question.find({ subtopicId });

    // Format IDs for compatibility with old Appwrite schema
    const formattedQuestions = questions.map((q) => {
      const qObj = q.toObject();
      return {
        ...qObj,
        id: q._id.toString(),
        $id: q._id.toString(),
        question: qObj.questionText, // Match frontend's question field
        correctIndex: qObj.correctOption,
        difficulty: qObj.difficulty, // Natively returns numeric difficulty
      };
    });

    // Shuffle questions
    for (let i = formattedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [formattedQuestions[i], formattedQuestions[j]] = [formattedQuestions[j], formattedQuestions[i]];
    }

    return NextResponse.json({ questions: formattedQuestions }, { status: 200 });
  } catch (error) {
    console.error('Fetch questions error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching questions' },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
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

    const { subtopicId } = params;
    const data = await req.json();

    const questionData = {
      subtopicId,
      questionText: data.questionText || data.question,
      options: data.options,
      correctOption: data.correctOption !== undefined ? data.correctOption : data.correctIndex,
      explanation: data.explanation,
      difficulty: typeof data.difficulty === 'string' ? 
        (data.difficulty === 'easy' ? 3 : data.difficulty === 'medium' ? 6 : 9) :
        (parseInt(data.difficulty) || 5),
    };

    const question = await Question.create(questionData);

    return NextResponse.json({
      ...question.toObject(),
      id: question._id.toString(),
      $id: question._id.toString(),
      question: question.questionText,
      correctIndex: question.correctOption,
      difficulty: question.difficulty
    }, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating question' },
      { status: 500 }
    );
  }
}
