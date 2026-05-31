import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/models/Question';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { subtopicId } = params;

    const questions = await Question.find({ subtopicId });

    // Format IDs for compatibility with old Appwrite schema
    const formattedQuestions = questions.map((q) => {
      const qObj = q.toObject();
      let difficultyNum = 5;
      if (qObj.difficulty === 'easy') difficultyNum = 3;
      if (qObj.difficulty === 'medium') difficultyNum = 6;
      if (qObj.difficulty === 'hard') difficultyNum = 9;

      return {
        ...qObj,
        id: q._id.toString(),
        $id: q._id.toString(),
        question: qObj.questionText, // Match frontend's question field
        correctIndex: qObj.correctOption,
        difficulty: difficultyNum,
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
    const { subtopicId } = params;
    const data = await req.json();

    const question = await Question.create({
      ...data,
      subtopicId,
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating question' },
      { status: 500 }
    );
  }
}
