import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Subtopic from '@/models/Subtopic';

const JWT_SECRET = process.env.JWT_SECRET;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

export async function POST(req) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { topicId, subtopicId, topicTitle, subtopicTitle, classNum, count, provider } = await req.json();

    if (!topicTitle || !subtopicTitle || !subtopicId || !classNum || !count || !provider) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const prompt = `You are an expert CBSE/ICSE Science teacher preparing multiple-choice questions for grade ${classNum} students.
Generate exactly ${count} science questions with 4 options each, correct index, and a fun science fact explanation about the subtopic: "${subtopicTitle}" (part of topic: "${topicTitle}").
Ensure the questions are age-appropriate for Grade ${classNum} (Ages 8-11).
You must output a raw JSON array matching this schema:
[
  {
    "question": "Clear, fun question wording...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Fun fact explaining why the correct option is correct...",
    "difficulty": 4
  }
]
Difficulty should be an integer between 2 and 10.
Return ONLY valid JSON. Do not include markdown code block formatting (such as \`\`\`json) or any preamble or explanation. Output must start with [ and end with ].`;

    let responseText = '';

    if (provider === 'groq') {
      if (!GROQ_API_KEY) {
        return NextResponse.json({ error: 'Groq API Key (GROQ_API_KEY) is not configured on the server' }, { status: 500 });
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed calling Groq API');
      }

      const json = await res.json();
      responseText = json.choices[0].message.content;

    } else if (provider === 'openai') {
      if (!OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API Key (OPENAI_API_KEY) is not configured on the server' }, { status: 500 });
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed calling OpenAI API');
      }

      const json = await res.json();
      responseText = json.choices[0].message.content;

    } else {
      return NextResponse.json({ error: 'Invalid AI provider selected' }, { status: 400 });
    }

    // Clean and parse output
    let content = responseText.trim();
    if (content.startsWith('```json')) {
      content = content.substring(7);
    }
    if (content.endsWith('```')) {
      content = content.substring(0, content.length - 3);
    }
    content = content.trim();

    let parsed = JSON.parse(content);
    // Unpack if wrapped inside an object
    if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions;
    } else if (!Array.isArray(parsed) && parsed.data && Array.isArray(parsed.data)) {
      parsed = parsed.data;
    }

    if (!Array.isArray(parsed)) {
      throw new Error('AI response did not parse as a JSON array of questions');
    }

    // Resolve the subtopic to link questions properly
    const firstSubtopic = await Subtopic.findOne({ topicId }).sort({ order: 1 });
    const targetSubtopicId = subtopicId || (firstSubtopic ? firstSubtopic._id.toString() : topicId);

    // Inject classNum, topicId, and subtopicId
    const formatted = parsed.map(q => ({
      ...q,
      topicId,
      subtopicId: targetSubtopicId,
      classNum: parseInt(classNum)
    }));

    return NextResponse.json({ questions: formatted }, { status: 200 });

  } catch (error) {
    console.error('AI question generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during AI question generation' },
      { status: 500 }
    );
  }
}
