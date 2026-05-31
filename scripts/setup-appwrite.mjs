import { Client, Databases, Permission, Role } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = '6a1bbec7000c4c660a17';
const DB_ID = '6a1bc2040017374a7f4a';
let API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/APPWRITE_API_KEY\s*=\s*(.+)/);
      if (match) {
        API_KEY = match[1].trim();
      }
    }
  } catch (err) {
    console.error('Failed to read .env.local file:', err.message);
  }
}

if (!API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY is not defined.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Define collections and their attributes
const SCHEMA = [
  {
    id: 'users',
    name: 'Users',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'classNum', type: 'integer', required: true },
      { key: 'beltLevel', type: 'string', size: 50, required: false, default: 'white' },
      { key: 'xp', type: 'integer', required: false, default: 0 },
      { key: 'streak', type: 'integer', required: false, default: 0 },
      { key: 'lastActive', type: 'string', size: 100, required: true },
      { key: 'completedTopics', type: 'string', size: 255, required: false, array: true },
    ]
  },
  {
    id: 'topics',
    name: 'Topics',
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'icon', type: 'string', size: 50, required: true },
      { key: 'classNum', type: 'integer', required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'color', type: 'string', size: 20, required: true },
      { key: 'questionCount', type: 'integer', required: false, default: 0 },
    ]
  },
  {
    id: 'questions',
    name: 'Questions',
    attributes: [
      { key: 'topicId', type: 'string', size: 255, required: true },
      { key: 'classNum', type: 'integer', required: true },
      { key: 'question', type: 'string', size: 2000, required: true },
      { key: 'options', type: 'string', size: 500, required: true, array: true },
      { key: 'correctIndex', type: 'integer', required: true },
      { key: 'explanation', type: 'string', size: 3000, required: true },
      { key: 'difficulty', type: 'string', size: 50, required: false, default: 'easy' },
    ]
  },
  {
    id: 'quiz_results',
    name: 'Quiz Results',
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'topicId', type: 'string', size: 255, required: true },
      { key: 'score', type: 'integer', required: true },
      { key: 'total', type: 'integer', required: true },
      { key: 'xpEarned', type: 'integer', required: true },
      { key: 'date', type: 'string', size: 100, required: true },
    ]
  }
];

// Helper to wait until collection is active and attributes are created
async function waitForAttributes(collectionId) {
  console.log(`⏳ Waiting for attributes in collection "${collectionId}" to be ready...`);
  while (true) {
    const col = await databases.getCollection(DB_ID, collectionId);
    const allAvailable = col.attributes.every(attr => attr.status === 'available');
    if (allAvailable && col.attributes.length > 0) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function run() {
  console.log('🚀 Starting Appwrite Database Setup for JustSciify...');

  // Reset collections for a clean run
  for (const c of SCHEMA) {
    try {
      await databases.deleteCollection(DB_ID, c.id);
      console.log(`🗑️ Deleted existing collection "${c.id}" for a fresh reset.`);
      // Small pause to let Appwrite delete the collection asynchronously
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      // Ignore if collection doesn't exist
    }
  }

  for (const c of SCHEMA) {
    try {

      console.log(`📦 Creating collection "${c.name}" (${c.id})...`);
      // Allow any authenticated user or role to read/write as configured in frontend
      await databases.createCollection(
        DB_ID,
        c.id,
        c.name,
        [
          Permission.read(Role.any()),
          Permission.write(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );

      // Create attributes
      for (const attr of c.attributes) {
        console.log(`   └─ Creating attribute "${attr.key}" (${attr.type})...`);
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DB_ID,
            c.id,
            attr.key,
            attr.size,
            attr.required,
            attr.default || null,
            attr.array || false
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DB_ID,
            c.id,
            attr.key,
            attr.required,
            attr.min || null,
            attr.max || null,
            attr.default !== undefined ? attr.default : null,
            attr.array || false
          );
        } else if (attr.type === 'datetime') {
          await databases.createDatetimeAttribute(
            DB_ID,
            c.id,
            attr.key,
            attr.required,
            attr.default || null,
            attr.array || false
          );
        }
      }

      await waitForAttributes(c.id);
      console.log(`🎉 Collection "${c.name}" fully set up!`);
    } catch (err) {
      console.error(`❌ Error setting up collection "${c.id}":`, err.message);
      process.exit(1);
    }
  }

  // ─── Seed Data ──────────────────────────────────────────────────────────────
  console.log('\n🌱 Seeding initial Topics and Questions...');

  const SEED_TOPICS = [
    {
      $id: 't_living_things',
      title: 'Living vs Non-Living Things',
      icon: '🌿',
      classNum: 3,
      description: 'Discover how living things grow, breathe, and feel compared to non-living things!',
      color: '#4ade80',
      questionCount: 4
    },
    {
      $id: 't_water_cycle',
      title: 'The Magical Water Cycle',
      icon: '💧',
      classNum: 4,
      description: 'Follow a water droplet as it evaporates into clouds and rains down again!',
      color: '#38bdf8',
      questionCount: 4
    },
    {
      $id: 't_gravity_force',
      title: 'Gravity & Simple Forces',
      icon: '🍎',
      classNum: 5,
      description: 'Why do things fall down? Learn about gravity, friction, and magnetic pushes and pulls!',
      color: '#a855f7',
      questionCount: 4
    }
  ];

  const SEED_QUESTIONS = [
    // Class 3 - Living vs Non-Living
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Which of the following is a living thing because it can breathe, grow, and reproduce?',
      options: ['A wooden table', 'A sunflower plant', 'A plastic toy car', 'A shiny pebble'],
      correctIndex: 1,
      explanation: 'Plants are living things! They breathe carbon dioxide, grow towards sunlight, and reproduce by making seeds.',
      difficulty: 'easy'
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'How do fish breathe underwater?',
      options: ['Using their lungs like humans', 'Through their skin', 'Using gills to take in oxygen from water', 'They do not breathe'],
      correctIndex: 2,
      explanation: 'Fish use special organs called gills to filter oxygen from the water as it passes through their mouths!',
      difficulty: 'medium'
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'What is the main source of energy for all living things on Earth?',
      options: ['The Moon', 'Wind energy', 'The Sun', 'Electricity'],
      correctIndex: 2,
      explanation: 'The Sun gives light and heat! Plants use sunlight to make food, and animals eat plants for energy.',
      difficulty: 'easy'
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Which of these is a unique feature of living things?',
      options: ['They can make loud noises', 'They grow and change over time', 'They are made of metal', 'They can slide on ice'],
      correctIndex: 1,
      explanation: 'All living things grow and change! A tiny seed grows into a giant tree, and a small puppy grows into a dog.',
      difficulty: 'easy'
    },

    // Class 4 - Water Cycle
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'What is it called when water heats up and turns into an invisible gas called water vapor?',
      options: ['Condensation', 'Evaporation', 'Precipitation', 'Freezing'],
      correctIndex: 1,
      explanation: 'Evaporation happens when the Sun heats up water in puddles, lakes, and oceans, turning it into gas that floats up into the sky!',
      difficulty: 'easy'
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'How are clouds formed in the water cycle?',
      options: ['By smoke from factories', 'Water vapor cools down and turns back into tiny water droplets (Condensation)', 'By wind gathering dust', 'By water freezing into giant ice cubes in the air'],
      correctIndex: 1,
      explanation: 'Condensation! When warm water vapor rises high in the sky, it cools down and clumps together with dust particles to form clouds.',
      difficulty: 'medium'
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'Rain, snow, sleet, and hail are all examples of what?',
      options: ['Transpiration', 'Precipitation', 'Runoff', 'Collection'],
      correctIndex: 1,
      explanation: 'Precipitation is any form of water falling from clouds back to the Earth\'s surface!',
      difficulty: 'easy'
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'Why does the Earth never run out of fresh water?',
      options: ['We make new water in factories', 'The water cycle continuously recycles water over and over', 'Rains come from other planets', 'Deep ocean water is always fresh'],
      correctIndex: 1,
      explanation: 'The water cycle is a massive natural recycling system. The same water dinosaurs drank is still being recycled today!',
      difficulty: 'medium'
    },

    // Class 5 - Gravity & Forces
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Who discovered gravity when he saw an apple fall from a tree?',
      options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
      correctIndex: 1,
      explanation: 'Sir Isaac Newton formulated the theory of universal gravity after watching an apple fall straight to the ground from a tree!',
      difficulty: 'easy'
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'What force slows down a rolling ball on a grassy field?',
      options: ['Gravity', 'Friction', 'Magnetic Force', 'Electrostatic Force'],
      correctIndex: 1,
      explanation: 'Friction! Friction is a rubbing force that acts in the opposite direction of motion, slowing down objects that slide or roll against each other.',
      difficulty: 'medium'
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'If you travel to the Moon, what happens to your mass and weight?',
      options: ['Your weight changes, but your mass remains the same', 'Both your mass and weight change', 'Your mass changes, but your weight remains the same', 'Nothing changes'],
      correctIndex: 0,
      explanation: 'Mass is the amount of "stuff" in you, which never changes! Weight depends on gravity. Since the Moon has less gravity, you weigh much less there!',
      difficulty: 'hard'
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Which of the following acts as a non-contact force (pulling or pushing without touching)?',
      options: ['Pushing a heavy box', 'A magnet attracting iron nails', 'Kicking a soccer ball', 'Typing on a keyboard'],
      correctIndex: 1,
      explanation: 'Magnetic force, like gravity, is a non-contact force. It can pull or push objects through space without physically touching them!',
      difficulty: 'medium'
    }
  ];

  // Seed Topics
  for (const topic of SEED_TOPICS) {
    try {
      await databases.createDocument(DB_ID, 'topics', topic.$id, {
        title: topic.title,
        icon: topic.icon,
        classNum: topic.classNum,
        description: topic.description,
        color: topic.color,
        questionCount: topic.questionCount
      });
      console.log(`✅ Seeded topic: "${topic.title}"`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`ℹ️ Topic "${topic.title}" already exists, skipping.`);
      } else {
        console.error(`❌ Failed to seed topic "${topic.title}":`, err.message);
      }
    }
  }

  // Seed Questions
  for (const question of SEED_QUESTIONS) {
    try {
      // Find if question already exists to prevent duplicate seeding
      const existing = await databases.listDocuments(DB_ID, 'questions', [
        databases.client.Query ? databases.client.Query.equal('question', question.question) : `equal("question", "${question.question}")`
      ]).catch(() => ({ documents: [] }));

      if (existing.documents.length > 0) {
        console.log(`ℹ️ Question "${question.question.substring(0, 30)}..." already seeded, skipping.`);
        continue;
      }

      await databases.createDocument(DB_ID, 'questions', 'unique()', question);
      console.log(`✅ Seeded question: "${question.question.substring(0, 40)}..."`);
    } catch (err) {
      console.error(`❌ Failed to seed question "${question.question.substring(0, 30)}...":`, err.message);
    }
  }

  console.log('\n⭐ Appwrite database setup & seeding completed successfully! ⭐');
}

run();
