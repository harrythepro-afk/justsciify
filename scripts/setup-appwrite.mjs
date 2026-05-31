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
      { key: 'unlockedAvatars', type: 'string', size: 100, required: false, array: true },
      { key: 'avatarId', type: 'string', size: 100, required: false, default: 'explorer_default' },
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
      { key: 'difficulty', type: 'integer', required: false, default: 2, min: 1, max: 10 },
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
  console.log('🚀 Starting Appwrite Database Setup for JustSciify (Startup Upgrade)...');

  // Reset collections for a clean run
  for (const c of SCHEMA) {
    try {
      await databases.deleteCollection(DB_ID, c.id);
      console.log(`🗑️ Deleted existing collection "${c.id}" for a fresh reset.`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      // Ignore if collection doesn't exist
    }
  }

  for (const c of SCHEMA) {
    try {
      console.log(`📦 Creating collection "${c.name}" (${c.id})...`);
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
            attr.min !== undefined ? attr.min : null,
            attr.max !== undefined ? attr.max : null,
            attr.default !== undefined ? attr.default : null,
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
  console.log('\n🌱 Seeding initial Topics and Questions with 1-10 Graded Difficulty...');

  const SEED_TOPICS = [
    {
      $id: 't_living_things',
      title: 'Living vs Non-Living Things',
      icon: '🌿',
      classNum: 3,
      description: 'Discover how living things grow, breathe, and feel compared to non-living things!',
      color: '#4ade80',
      questionCount: 12
    },
    {
      $id: 't_water_cycle',
      title: 'The Magical Water Cycle',
      icon: '💧',
      classNum: 4,
      description: 'Follow a water droplet as it evaporates into clouds and rains down again!',
      color: '#38bdf8',
      questionCount: 12
    },
    {
      $id: 't_gravity_force',
      title: 'Gravity & Simple Forces',
      icon: '🍎',
      classNum: 5,
      description: 'Why do things fall down? Learn about gravity, friction, and magnetic pushes and pulls!',
      color: '#a855f7',
      questionCount: 12
    }
  ];

  const SEED_QUESTIONS = [
    // ─── CLASS 3: LIVING VS NON-LIVING (Difficulties 1-10) ───
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Which of these objects needs food, water, and air to stay alive?',
      options: ['A ceramic mug', 'A green houseplant', 'A metal scissor', 'A wall clock'],
      correctIndex: 1,
      explanation: 'Living things like plants require water, nutrients from the soil, and air to make their food and live!',
      difficulty: 1
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'What happens to a sunflower when the sun moves across the sky?',
      options: ['It hides its petals', 'It turns to track and face the sun', 'It falls down immediately', 'Nothing at all'],
      correctIndex: 1,
      explanation: 'Living things respond to changes in their environment! Sunflower buds track the sun from east to west in a process called heliotropism.',
      difficulty: 2
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'All living things reproduce. What does "reproduce" mean?',
      options: ['To move from place to place', 'To sleep during the night', 'To make new young ones of their own kind', 'To shed old leaves'],
      correctIndex: 2,
      explanation: 'Reproduction is how living things continue their species by producing offspring, like cats having kittens or plants producing seeds.',
      difficulty: 3
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'How do plants breathe or exchange gases during the day?',
      options: ['Through their roots', 'Using tiny pores on their leaves called stomata', 'Through their flowers', 'They do not breathe at all'],
      correctIndex: 1,
      explanation: 'Stomata are microscopic guard-cell openings under leaves that let carbon dioxide in for photosynthesis and release oxygen!',
      difficulty: 4
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Why are green plants called producers?',
      options: ['They consume other animals', 'They make their own food using sunlight, water, and CO2', 'They produce wood for furniture', 'They clean the garden ground'],
      correctIndex: 1,
      explanation: 'Producers generate their own energy! Through photosynthesis, plants manufacture sugars, unlike animals who must consume other living things.',
      difficulty: 5
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Which of the following is a non-living thing that was once part of a living thing?',
      options: ['A copper penny', 'A leather belt', 'A glass marble', 'A steel nail'],
      correctIndex: 1,
      explanation: 'Leather comes from animal hides (which were once living). Copper, glass, and steel are inorganic minerals that were never alive.',
      difficulty: 6
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'Which organism breathes using air tubes called tracheae that run throughout its body?',
      options: ['An earthworm', 'A grasshopper (insect)', 'A goldfish', 'A pigeon'],
      correctIndex: 1,
      explanation: 'Insects do not have lungs! Instead, they use a network of spiracles (openings) and tracheal tubes to distribute oxygen straight to their tissues.',
      difficulty: 7
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'How do earthworms absorb oxygen from the atmosphere?',
      options: ['Using large gills', 'Through their thin, moist skin', 'Using specialized nostril openings', 'Through air sacs under their tails'],
      correctIndex: 1,
      explanation: 'Earthworms do not have specialized respiratory organs. They exchange carbon dioxide and oxygen directly through their thin, mucous-covered skin.',
      difficulty: 8
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'What is the primary biological function of a plant\'s seed cotyledon?',
      options: ['To absorb water from the clouds', 'To store nutrients and feed the tiny embryo during germination', 'To anchor the plant into the dirt', 'To attract honeybees with bright colors'],
      correctIndex: 1,
      explanation: 'The cotyledons serve as the food warehouse! They supply energy to the germinating seedling until it grows leaves to produce its own food.',
      difficulty: 9
    },
    {
      topicId: 't_living_things',
      classNum: 3,
      question: 'During severe droughts, how do desert cacti (like saguaro) structurally minimize water loss?',
      options: ['By shedding their roots entirely', 'By transforming leaves into sharp needles (spines) and using green thick stems for photosynthesis', 'By absorbing oxygen only at noon', 'By sweating out excess salts'],
      correctIndex: 1,
      explanation: 'Adaptation! Needle spines reduce surface area to limit transpiration (evaporation), while the thick, waxy stem stores massive amounts of water.',
      difficulty: 10
    },

    // ─── CLASS 4: WATER CYCLE (Difficulties 1-10) ───
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'What provides the heat energy required to make the water cycle run?',
      options: ['Underground volcanoes', 'The Sun', 'Electric wind currents', 'Hot ocean waves'],
      correctIndex: 1,
      explanation: 'The Sun heats up water on land and oceans, converting it into water vapor to start the entire cycle!',
      difficulty: 1
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'What is it called when liquid water turns into invisible gas floating in the air?',
      options: ['Condensation', 'Evaporation', 'Freezing', 'Melting'],
      correctIndex: 1,
      explanation: 'Evaporation is the phase change where liquid water absorbs thermal energy and converts into gas (water vapor).',
      difficulty: 2
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'How do clouds form in the sky?',
      options: ['By high winds sweeping up desert dust', 'Water vapor cools down and turns back into liquid droplets (Condensation)', 'By smoke rising from cities', 'Raindrops freezing into giant solid sheets of ice'],
      correctIndex: 1,
      explanation: 'Condensation! When warm, rising water vapor cools high in the atmosphere, it turns back into tiny micro-droplets of liquid water that group into clouds.',
      difficulty: 3
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'What do we call any form of water (rain, snow, hail) that falls from clouds back to earth?',
      options: ['Collection', 'Precipitation', 'Transpiration', 'Infiltration'],
      correctIndex: 1,
      explanation: 'Precipitation occurs when condensed water droplets inside clouds grow too heavy to remain suspended in the air and fall due to gravity.',
      difficulty: 4
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'How does water escape from the leaves of green plants back into the atmosphere?',
      options: ['Infiltration', 'Transpiration (evaporation from plants)', 'Sublimation', 'Respiration'],
      correctIndex: 1,
      explanation: 'Transpiration is the process where water travels through plant roots and exits as invisible water vapor via stomata pores on leaves.',
      difficulty: 5
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'What is it called when water sinks deep down into the soil to recharge underground aquifers?',
      options: ['Runoff', 'Infiltration / Percolation', 'Condensation', 'Evaporation'],
      correctIndex: 1,
      explanation: 'Infiltration happens when precipitation hits the earth and seeps downward through soil and rocks into natural underground water reserves.',
      difficulty: 6
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'Which of the following processes represents the transition of ice turning directly into water vapor without melting first?',
      options: ['Condensation', 'Sublimation', 'Evaporation', 'Deposition'],
      correctIndex: 1,
      explanation: 'Sublimation is a phase transition where a solid (like dry ice or glaciers) converts straight into gas, bypassing the liquid phase.',
      difficulty: 7
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'Why does dew form on morning grass leaves even when it did not rain at night?',
      options: ['Grass pumps out excess water from its roots', 'Warm moisture in the air cools down on the cold grass surface and condenses', 'Clouds descend during the night', 'Wind carries water from nearby rivers'],
      correctIndex: 1,
      explanation: 'Morning dew forms when warm, humid air contacts cool surfaces (like grass leaves) that are below the dew point, forcing condensation.',
      difficulty: 8
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'Which factor has the LEAST impact on the rate of water evaporation from an open pond?',
      options: ['Ambient air temperature', 'Wind velocity across the surface', 'The depth of the pond floor', 'Relative humidity of the atmosphere'],
      correctIndex: 2,
      explanation: 'While temperature, wind, and humidity directly govern evaporation rates at the surface, the overall depth of the pond bottom does not affect surface evaporation physics.',
      difficulty: 9
    },
    {
      topicId: 't_water_cycle',
      classNum: 4,
      question: 'How does the water cycle assist in purification and desalination of ocean water naturally?',
      options: ['Clouds filter out salt using air currents', 'Only pure H2O molecules evaporate, leaving dissolved salt minerals behind in the ocean', 'Fishes consume all the salt before water rises', 'Rainwater naturally neutralizes salt compounds on contact'],
      correctIndex: 1,
      explanation: 'Natural desalination! When solar thermal heat evaporates ocean water, only pure water molecules escape into the gaseous state. The heavy sodium and chloride ions remain behind.',
      difficulty: 10
    },

    // ─── CLASS 5: GRAVITY & FORCES (Difficulties 1-10) ───
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'What invisible force pulls all objects down towards the center of the Earth?',
      options: ['Magnetic Force', 'Gravity', 'Friction', 'Static Electricity'],
      correctIndex: 1,
      explanation: 'Gravity is the universal attractive force that acts between any two masses, pulling everything straight down to Earth.',
      difficulty: 1
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Which force resists motion and slows down a rolling soccer ball on a grassy field?',
      options: ['Gravity', 'Friction', 'Air resistance', 'Magnetic pull'],
      correctIndex: 1,
      explanation: 'Friction is a contact force that opposes the motion of sliding or rolling surfaces in contact, converting kinetic energy into heat.',
      difficulty: 2
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Why do we slip easily when walking on a wet tile floor compared to a rough concrete road?',
      options: ['Water increases the gravity of the tiles', 'Water acts as a lubricant, reducing the friction force between shoes and tiles', 'Tiles have static magnetic charges', 'Concrete pulls your shoes down harder'],
      correctIndex: 1,
      explanation: 'Wet surfaces minimize friction! Water fills microscopic rough grooves in tiles, creating a slick layer that reduces grip.',
      difficulty: 3
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Which of the following is a non-contact force that can push or pull without physically touching an object?',
      options: ['Kicking a soccer ball', 'A magnet attracting iron nails', 'Pushing a shopping cart', 'Friction slowing down a sled'],
      correctIndex: 1,
      explanation: 'Non-contact forces like gravity, magnetism, and electrostatic forces create force fields that act across distance without physical contact.',
      difficulty: 4
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'What is the scientific distinction between mass and weight?',
      options: ['They are exactly the same thing', 'Mass is the amount of matter in an object, while weight is the gravitational pull acting on that mass', 'Mass changes depending on location, but weight never does', 'Mass is measured in Newtons and weight in kilograms'],
      correctIndex: 1,
      explanation: 'Your mass is constant (atoms do not change)! Weight is a force (`Force = mass * gravity`). If gravity changes (like on the Moon), your weight shifts, but your mass remains identical.',
      difficulty: 5
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'If you drop a heavy bowling ball and a light tennis ball simultaneously in a complete vacuum (no air), which lands first?',
      options: ['The heavy bowling ball', 'The light tennis ball', 'They land at the exact same time', 'Neither will fall'],
      correctIndex: 2,
      explanation: 'In a vacuum, gravity accelerates all objects at the exact same rate regardless of their mass (9.8 m/s² on Earth). Without air resistance, they land together!',
      difficulty: 6
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Which type of friction is the strongest and requires the most force to overcome?',
      options: ['Rolling friction', 'Sliding friction', 'Static friction (initiating movement of a still object)', 'Fluid friction'],
      correctIndex: 2,
      explanation: 'Static friction is the strongest! Interlocking microscopic surfaces of objects at rest require a high threshold force to break loose compared to objects already in sliding motion.',
      difficulty: 7
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'Why does an astronaut float inside the International Space Station (ISS) orbiting Earth?',
      options: ['There is zero gravity in orbit space', 'The ISS is in a continuous state of free-fall around the Earth, creating weightlessness', 'Special magnetic suits repel the Earth\'s crust', 'The ISS is filled with helium gas'],
      correctIndex: 1,
      explanation: 'Free fall! Earth\'s gravity in orbit is still 90% of surface gravity. Astronauts float because they and the space station are falling around the Earth together at the same speed.',
      difficulty: 8
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'How do streamlined car designs and airplane bodies increase speed and fuel efficiency?',
      options: ['They increase gravitational pull forward', 'Their smooth shapes reduce fluid friction / air resistance (drag)', 'They multiply engine horsepower using wind', 'They reduce the mass of steel sheets'],
      correctIndex: 1,
      explanation: 'Aerodynamics! Streamlined teardrop shapes allow air currents to slip around the moving vehicle with minimal turbulence, decreasing the opposing drag force.',
      difficulty: 9
    },
    {
      topicId: 't_gravity_force',
      classNum: 5,
      question: 'According to Newton\'s third law of motion (action-reaction), how does a rocket propel itself forward into empty space?',
      options: ['By pushing against air molecules behind the engines', 'By ejecting hot exhaust gas backward, generating an equal and opposite thrust force forward', 'Using planetary magnetic fields to pull itself along', 'By burning up fuel mass to reduce gravitational pull'],
      correctIndex: 1,
      explanation: 'Action and Reaction! The action is the rocket engine blasting high-velocity combustion gases backward. The equal and opposite reaction is the gas pushing the rocket forward, working perfectly in empty space vacuums.',
      difficulty: 10
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
      await databases.createDocument(DB_ID, 'questions', 'unique()', question);
      console.log(`✅ Seeded question: "${question.question.substring(0, 40)}..." (Difficulty: ${question.difficulty})`);
    } catch (err) {
      console.error(`❌ Failed to seed question "${question.question.substring(0, 30)}...":`, err.message);
    }
  }

  console.log('\n⭐ Appwrite database setup & seeding completed successfully! ⭐');
}

run();
