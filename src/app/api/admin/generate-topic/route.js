import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Topic from '@/models/Topic';
import Subtopic from '@/models/Subtopic';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';

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

// POST: Handles BOTH generating the topic data (AI) AND saving it (Database commit)
export async function POST(req) {
  try {
    await dbConnect();
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    const { action, ...params } = await req.json();

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION 1: GENERATE FROM AI
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'generate') {
      const { topicQuery, classNum, provider, questionCount = 3 } = params;

      if (!topicQuery || !classNum || !provider) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      const prompt = `You are a world-class CBSE/ICSE curriculum developer designing science content for children in Grade ${classNum} (Ages 8-11).
Create a complete science syllabus topic for the idea: "${topicQuery}".
You must output a single nested JSON object matching this exact schema:
{
  "title": "Clear, exciting topic name...",
  "icon": "A single emoji matching the topic (e.g. 🪐, 🍎, ⚡)",
  "color": "A vibrant hex color matching the topic design (e.g. #38bdf8, #a855f7, #4ade80, #facc15)",
  "description": "An engaging, child-friendly description of the topic in one easy sentence.",
  "classNum": ${classNum},
  "subtopics": [
    {
      "title": "Name of Subtopic 1 (e.g. Chapter 1 title)",
      "description": "Child-friendly summary of Chapter 1.",
      "order": 1,
      "questions": [
        {
          "question": "Exciting MCQ question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0,
          "explanation": "Fun science fact explaining why the correct option is correct.",
          "difficulty": 4
        }
      ]
    },
    {
      "title": "Name of Subtopic 2 (e.g. Chapter 2 title)",
      "description": "Child-friendly summary of Chapter 2.",
      "order": 2,
      "questions": [
        {
          "question": "Exciting MCQ question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 1,
          "explanation": "Fun science fact explaining why the correct option is correct.",
          "difficulty": 6
        }
      ]
    }
  ]
}

Provide exactly 2 subtopics, and exactly ${questionCount} multiple-choice questions for EACH subtopic.
Difficulty levels must be between 2 and 10.
Return ONLY valid JSON. Output must start with { and end with }. Do not include markdown code block formatting (such as \`\`\`json) or any explanations outside the JSON.`;

      let responseText = '';

      if (provider === 'groq') {
        if (!GROQ_API_KEY) {
          return NextResponse.json({ error: 'Groq API Key (GROQ_API_KEY) is not configured' }, { status: 500 });
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
          return NextResponse.json({ error: 'OpenAI API Key (OPENAI_API_KEY) is not configured' }, { status: 500 });
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

      const parsed = JSON.parse(content);
      return NextResponse.json({ topicData: parsed }, { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACTION 2: SAVE TO DATABASE (PUBLISH)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const { topicData } = params;
      if (!topicData || !topicData.title || !topicData.subtopics) {
        return NextResponse.json({ error: 'Invalid topicData provided' }, { status: 400 });
      }

      // 1. Create Topic
      const topic = await Topic.create({
        title: topicData.title,
        description: topicData.description || 'Exploring science concepts.',
        classNum: parseInt(topicData.classNum) || 4,
        icon: topicData.icon || '🔬',
        color: topicData.color || '#38bdf8',
      });

      // 2. Loop through and create Subtopics
      for (const s of topicData.subtopics) {
        const subtopic = await Subtopic.create({
          topicId: topic._id,
          title: s.title,
          description: s.description || 'Chapter description',
          order: s.order || 1
        });

        // 3. Create Questions linked to this Subtopic
        if (s.questions && Array.isArray(s.questions)) {
          const uniqueQuestionTexts = new Set();
          for (const q of s.questions) {
            const normalizedText = (q.question || '').trim().toLowerCase();
            if (uniqueQuestionTexts.has(normalizedText)) {
              continue; // skip duplicate question in the same subtopic!
            }
            uniqueQuestionTexts.add(normalizedText);

            await Question.create({
              subtopicId: subtopic._id,
              questionText: q.question,
              options: q.options,
              correctOption: q.correctIndex,
              explanation: q.explanation || 'Science explanation.',
              difficulty: parseInt(q.difficulty) || 5
            });
          }
        }
      }

      return NextResponse.json({ success: true, topicId: topic._id }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('AI content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during AI content generation' },
      { status: 500 }
    );
  }
}
