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

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { id } = params;
    const data = await req.json();

    // Map fields from frontend names to Mongoose schema names if necessary
    const updateData = {
      questionText: data.questionText || data.question,
      options: data.options,
      correctOption: data.correctOption !== undefined ? data.correctOption : data.correctIndex,
      explanation: data.explanation,
      difficulty: typeof data.difficulty === 'string' ? 
        (data.difficulty === 'easy' ? 3 : data.difficulty === 'medium' ? 6 : 9) :
        (parseInt(data.difficulty) || 5),
    };

    // Remove undefined values to avoid overwriting existing properties with undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const question = await Question.findByIdAndUpdate(id, updateData, { new: true });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const qObj = question.toObject();
    return NextResponse.json({
      ...qObj,
      id: question._id.toString(),
      $id: question._id.toString(),
      question: qObj.questionText,
      correctIndex: qObj.correctOption,
      difficulty: qObj.difficulty,
    }, { status: 200 });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while updating question' },
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
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question successfully deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while deleting question' },
      { status: 500 }
    );
  }
}
