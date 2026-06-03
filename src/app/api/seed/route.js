import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Topic from '@/models/Topic';
import Subtopic from '@/models/Subtopic';
import Question from '@/models/Question';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
}

// Intercept Question.create to map string difficulties to numeric values for backward compatibility
const originalCreate = Question.create.bind(Question);
Question.create = function(data, ...args) {
  const mapDiff = (q) => {
    if (q && typeof q === 'object') {
      if (q.difficulty === 'easy') q.difficulty = 3;
      else if (q.difficulty === 'medium') q.difficulty = 6;
      else if (q.difficulty === 'hard') q.difficulty = 9;
    }
    return q;
  };
  
  if (Array.isArray(data)) {
    data.forEach(mapDiff);
  } else {
    mapDiff(data);
  }
  return originalCreate(data, ...args);
};

export async function GET() {
  try {
    await dbConnect();

    // Enforce admin check
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const adminUser = await User.findById(decoded.userId);
    if (!adminUser || adminUser.email !== 'admin@justsciify.com') {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    // 1. Clear existing data to ensure a fresh, clean premium seed
    await Topic.deleteMany({});
    await Subtopic.deleteMany({});
    await Question.deleteMany({});

    // =========================================================================
    // CLASS 3 TOPICS
    // =========================================================================

    // Topic 1: Plants — Our Green Friends (Class 3)
    const topic1 = await Topic.create({
      title: 'Plants — Our Green Friends',
      description: 'Explore leaf shapes, parts of a plant, and discover how seeds germinate into beautiful green friends!',
      classNum: 3,
      icon: '🌿',
    });

    const subtopic1A = await Subtopic.create({
      topicId: topic1._id,
      title: 'Parts of a Plant & Their Roles',
      description: 'Learn the primary functions of roots, stems, leaves, and flowers.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic1A._id,
        questionText: 'Which part of the plant anchors it firmly to the ground and absorbs water and minerals from the soil?',
        options: ['Stem', 'Leaf', 'Root', 'Flower'],
        correctOption: 2,
        explanation: 'Roots grow deep into the ground. They act as anchors to hold the plant in place and act like tiny straws absorbing water and nutrients from the soil.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic1A._id,
        questionText: 'What is the main function of the green leaves of a plant?',
        options: [
          'To produce seeds for reproduction',
          'To absorb water directly from the air',
          'To prepare food for the plant using sunlight, water, and air',
          'To support the branches and keep the plant upright'
        ],
        correctOption: 2,
        explanation: 'Leaves contain chlorophyll which allows them to make food for the plant through photosynthesis. That is why they are called the plant kitchen!',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic1A._id,
        questionText: 'If we cut off all the flowers from a tomato plant, what will it fail to produce?',
        options: ['Green Leaves', 'Roots', 'Tomatoes and Seeds', 'Stem branches'],
        correctOption: 2,
        explanation: 'Flowers are the reproductive parts of a plant. They turn into fruits (like tomatoes) which contain seeds to grow new plants.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic1A._id,
        questionText: 'Which part acts like a highway, carrying water and nutrients from the roots up to the leaves?',
        options: ['Petal', 'Stem', 'Seed', 'Thorn'],
        correctOption: 1,
        explanation: 'The stem acts as the transport system of the plant, holding it upright and distributing water and nutrients to all parts.',
        difficulty: 'easy',
      },
    ]);

    const subtopic1B = await Subtopic.create({
      topicId: topic1._id,
      title: 'Seed Germination & Growth',
      description: 'Discover how a tiny seed wakes up and grows into a seedling.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic1B._id,
        questionText: 'What three things does a seed absolutely need to wake up and start germinating?',
        options: [
          'Soil, fertilizer, and dark shadows',
          'Water, air (oxygen), and suitable warmth',
          'Carbon dioxide, sand, and heavy wind',
          'Ice, direct sunlight, and compost'
        ],
        correctOption: 1,
        explanation: 'For germination, a seed requires moisture (water) to soften its coat, oxygen (air) for breathing, and warmth to trigger growth.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic1B._id,
        questionText: 'What is the tiny, young plant that first emerges from a seed called?',
        options: ['Trunk', 'Seedling', 'Sprout Root', 'Shrublet'],
        correctOption: 1,
        explanation: 'A seedling is a young sporophyte developing out of a plant embryo from a seed.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic1B._id,
        questionText: 'Why do seeds NOT need soil or sunlight during the very first stage of germination?',
        options: [
          'They sleep and do not breathe',
          'They store their own food inside the seed leaves (cotyledons)',
          'They get energy from underground rocks',
          'They drink air instead of eating'
        ],
        correctOption: 1,
        explanation: 'A seed contains cotyledons (seed leaves) that store starch/food. Until it grows its first green leaves to catch sunlight, it lives off this stored energy.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic1B._id,
        questionText: 'Which part grows out of the seed FIRST during germination?',
        options: ['The baby leaf', 'The baby root (radicle)', 'The flower bud', 'The woody bark'],
        correctOption: 1,
        explanation: 'The radicle (embryonic root) always grows downwards first to secure the seed in the ground and start absorbing water.',
        difficulty: 'easy',
      },
    ]);

    // =========================================================================
    // CLASS 4 TOPICS
    // =========================================================================

    // Topic 2: States of Matter (Class 4)
    const topic2 = await Topic.create({
      title: 'States of Matter',
      description: 'Learn how molecules dance in solids, liquids, and gases, and explore changes of state!',
      classNum: 4,
      icon: '🧪',
    });

    const subtopic2A = await Subtopic.create({
      topicId: topic2._id,
      title: 'Molecules & Three States',
      description: 'Understand molecular arrangements in solids, liquids, and gases.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic2A._id,
        questionText: 'Why does a solid block of wood keep its shape no matter which container you place it in?',
        options: [
          'Its molecules are packed extremely tightly and held by strong attraction forces',
          'Its molecules flow constantly like water',
          'Its molecules have no attraction and fly away',
          'Its molecules are made of magic magnets'
        ],
        correctOption: 0,
        explanation: 'Solids have tightly bound molecules in a fixed structure, meaning they keep a fixed shape and volume.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic2A._id,
        questionText: 'Rohit fills a syringe with air, seals the tip, and pushes the plunger. The plunger moves inward easily. He then repeats the experiment with water. Why does the plunger barely move with water?',
        options: [
          'Water has no weight or volume',
          'Molecules in liquids are already packed very closely compared to gases, making them hard to compress',
          'Water molecules are highly reactive with the plastic plunger',
          'Air molecules are heavier than water molecules and push back harder'
        ],
        correctOption: 1,
        explanation: 'Gases have large spaces between their molecules, which makes them highly compressible. Liquids, however, have closely packed molecules and are nearly impossible to compress under ordinary pressure.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic2A._id,
        questionText: 'Which state of matter has NO fixed shape and NO fixed volume, spreading out to fill any space?',
        options: ['Liquid', 'Gas', 'Solid', 'Ice'],
        correctOption: 1,
        explanation: 'Gas molecules are spaced far apart and move rapidly in all directions, so they expand to fill any container.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic2A._id,
        questionText: 'What happens to the molecules of water when it flows down a glass?',
        options: [
          'They remain locked in rigid, crystalline lines',
          'They fly apart completely into the room',
          'They slide past and roll over each other because they are loosely packed',
          'They freeze instantly'
        ],
        correctOption: 2,
        explanation: 'Liquid molecules are packed moderately close but can slide past one another, allowing liquids to flow and take the shape of their container.',
        difficulty: 'medium',
      },
    ]);

    const subtopic2B = await Subtopic.create({
      topicId: topic2._id,
      title: 'Changes in Matter',
      description: 'Explore phase transitions like melting, evaporation, and condensation.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic2B._id,
        questionText: 'When water vapor cools down and turns back into water drops on the outside of a cold glass, what is it called?',
        options: ['Melting', 'Sublimation', 'Evaporation', 'Condensation'],
        correctOption: 3,
        explanation: 'Condensation is the process where a gas cools down and converts back into a liquid state.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic2B._id,
        questionText: 'Which of the following is a CHEMICAL change (irreversible) rather than a physical change?',
        options: [
          'Melting of ice cubes in juice',
          'Tearing a piece of paper into small bits',
          'Rusting of an iron nail left in wet soil',
          'Dissolving sugar into warm milk'
        ],
        correctOption: 2,
        explanation: 'Rusting is a chemical change because a new substance (iron oxide) is formed, and it cannot be undone. Melting, tearing, and dissolving are physical and reversible.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic2B._id,
        questionText: 'What is the change of state from a solid directly to a liquid called (e.g. ice to water)?',
        options: ['Freezing', 'Melting', 'Evaporation', 'Boiling'],
        correctOption: 1,
        explanation: 'Melting is the phase change where a solid gains thermal energy and turns into a liquid.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic2B._id,
        questionText: 'If you boil water, it changes from liquid to gas. What is this gas called?',
        options: ['Oxygen', 'Hydrogen', 'Water Vapor', 'Carbon dioxide'],
        correctOption: 2,
        explanation: 'Water in gaseous state is called water vapor or steam.',
        difficulty: 'easy',
      },
    ]);

    // Topic 3: Force, Work & Energy (Class 4)
    const topic3 = await Topic.create({
      title: 'Force, Work & Energy',
      description: 'Explore the physics of pushes, pulls, gravity, and the magic of simple machines!',
      classNum: 4,
      icon: '⚙️',
    });

    const subtopic3A = await Subtopic.create({
      topicId: topic3._id,
      title: 'Forces Around Us',
      description: 'Learn about gravity, friction, and magnetic forces.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic3A._id,
        questionText: 'What force pulls an apple down to the ground from a tree?',
        options: ['Friction', 'Magnetic Force', 'Gravity', 'Wind Resistance'],
        correctOption: 2,
        explanation: 'Gravity is the invisible force that pulls all objects toward the center of the Earth.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic3A._id,
        questionText: 'Why is it much harder to slide a heavy box on carpet than on a tiled floor?',
        options: [
          'Carpet has less friction',
          'Carpet has more friction',
          'Tiled floors have more gravity',
          'Gravity is stronger on carpets'
        ],
        correctOption: 1,
        explanation: 'Carpet surfaces are rough and create more friction compared to smooth tiles, resisting sliding motion.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic3A._id,
        questionText: 'Which surface will create the MOST friction when you slide a toy car across it?',
        options: ['Smooth Glass Ice', 'Rough Sandpaper', 'Polished Wood', 'Shiny Marble Floor'],
        correctOption: 1,
        explanation: 'Rougher surfaces like sandpaper have higher micro-irregularities, generating more friction which resists movement.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic3A._id,
        questionText: 'If you throw a ball straight up in the air, why does it slow down, stop, and then fall back down?',
        options: [
          'The ball gets tired and heavy',
          'Gravity acts against its upward movement, pulling it back down',
          'Magnetic fields in the air block it',
          'The sky pushes it away'
        ],
        correctOption: 1,
        explanation: 'Gravity pulls the ball down constantly. As it rises, gravity slows it down until it stops and accelerates it back to earth.',
        difficulty: 'medium',
      },
    ]);

    const subtopic3B = await Subtopic.create({
      topicId: topic3._id,
      title: 'Simple Machines & Mechanical Advantage',
      description: 'Discover how levers, pulleys, and inclined planes make work easier.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic3B._id,
        questionText: 'A seesaw is a perfect everyday example of which simple machine?',
        options: ['Wheel and Axle', 'Pulley', 'Inclined Plane', 'Lever'],
        correctOption: 3,
        explanation: 'A seesaw is a lever that pivots on a fixed support point called the fulcrum.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic3B._id,
        questionText: 'Which simple machine is used to lift a flag up a flagpole?',
        options: ['Wedge', 'Pulley', 'Screw', 'Lever'],
        correctOption: 1,
        explanation: 'A pulley has a grooved wheel and rope that changes the direction of force, making it easy to raise items up.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic3B._id,
        questionText: 'Why does sliding a heavy barrel up a ramp feel much easier than lifting it straight up into a truck?',
        options: [
          'A ramp reduces the gravity on the barrel',
          'A ramp reduces the total distance traveled',
          'A ramp (inclined plane) lets you apply less force over a longer distance',
          'A ramp eliminates friction entirely'
        ],
        correctOption: 2,
        explanation: 'An inclined plane (ramp) gives a mechanical advantage: it spreads the work over a longer distance, requiring less upward force.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic3B._id,
        questionText: 'A knife or an axe used to cut wood is an example of which simple machine?',
        options: ['Wedge', 'Wheel and Axle', 'Lever', 'Pulley'],
        correctOption: 0,
        explanation: 'A wedge is a double inclined plane that moves to split, cut, or lift materials.',
        difficulty: 'medium',
      },
    ]);

    // =========================================================================
    // CLASS 5 TOPICS
    // =========================================================================

    // Topic 4: The Solar System (Class 5)
    const topic4 = await Topic.create({
      title: 'The Solar System',
      description: 'Take a journey through the stars, the sun, and the incredible eight planets in our cosmic neighborhood.',
      classNum: 5,
      icon: '🪐',
    });

    const subtopic4A = await Subtopic.create({
      topicId: topic4._id,
      title: 'The Inner Planets',
      description: 'Meet the rocky planets closest to the Sun: Mercury, Venus, Earth, and Mars.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic4A._id,
        questionText: 'Which planet is known as the "Red Planet" due to iron oxide on its surface?',
        options: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
        correctOption: 2,
        explanation: 'Mars is called the Red Planet because the iron minerals in its soil rust, giving it a reddish appearance.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic4A._id,
        questionText: 'Which is the hottest planet in our solar system, covered in thick clouds?',
        options: ['Mercury', 'Venus', 'Mars', 'Saturn'],
        correctOption: 1,
        explanation: 'Even though Mercury is closer to the sun, Venus is the hottest because its thick atmosphere traps heat (Greenhouse effect).',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic4A._id,
        questionText: 'Which inner planet is the only one known to support life, with liquid water and a rich atmosphere?',
        options: ['Earth', 'Mars', 'Venus', 'Mercury'],
        correctOption: 0,
        explanation: 'Earth has perfect temperatures, liquid water, and an oxygen-rich atmosphere that supports thriving life.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic4A._id,
        questionText: 'Why does Mercury experience extreme hot temperatures during the day but freezing temperatures at night?',
        options: [
          'It is very far from the sun at night',
          'It has no atmosphere to trap heat at night or block intense rays during the day',
          'It is covered in liquid methane ice',
          'It spins extremely fast'
        ],
        correctOption: 1,
        explanation: 'Mercury lacks an atmosphere. Without a blanket of air to retain heat, all the daytime heat escapes immediately into space at night.',
        difficulty: 'hard',
      },
    ]);

    const subtopic4B = await Subtopic.create({
      topicId: topic4._id,
      title: 'The Outer Planets',
      description: 'Discover the massive gas giants and ice giants: Jupiter, Saturn, Uranus, and Neptune.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic4B._id,
        questionText: 'Which is the largest planet in our solar system, famous for its Great Red Spot?',
        options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'],
        correctOption: 2,
        explanation: 'Jupiter is the largest planet. The Great Red Spot is a giant storm that has raged for hundreds of years.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic4B._id,
        questionText: 'Which outer planet is surrounded by a magnificent, wide system of rings made of ice and rock?',
        options: ['Saturn', 'Uranus', 'Jupiter', 'Neptune'],
        correctOption: 0,
        explanation: 'Saturn has the most complex and spectacular rings, composed of trillions of ice, rock, and dust particles.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic4B._id,
        questionText: 'Uranus and Neptune appear bright blue-green in telescopes. What gas in their atmosphere gives them this color?',
        options: ['Oxygen', 'Methane', 'Helium', 'Nitrogen'],
        correctOption: 1,
        explanation: 'Methane gas in their upper atmospheres absorbs red light and reflects blue-green wavelengths back into space.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic4B._id,
        questionText: 'Unlike the rocky inner planets, what are the outer planets (Jupiter, Saturn, Uranus, Neptune) primarily composed of?',
        options: ['Molten gold', 'Liquid iron', 'Gases and ice (Hydrogen, Helium, Methane)', 'Granite and basalt rocks'],
        correctOption: 2,
        explanation: 'They are called gas giants and ice giants because they are made of dense gas layers surrounding small, heavy cores.',
        difficulty: 'medium',
      },
    ]);

    // Topic 5: Human Organ Systems (Class 5)
    const topic5 = await Topic.create({
      title: 'Human Organ Systems',
      description: 'Discover how the heart, lungs, stomach, and brain work together to keep you alive and healthy!',
      classNum: 5,
      icon: '🧠',
    });

    const subtopic5A = await Subtopic.create({
      topicId: topic5._id,
      title: 'Circulatory & Respiratory Systems',
      description: 'Learn how oxygen is breathed in and pumped to all parts of the body.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic5A._id,
        questionText: 'Which organ acts as a powerful pump, constantly pushing blood through vessels to all parts of your body?',
        options: ['Lungs', 'Brain', 'Heart', 'Stomach'],
        correctOption: 2,
        explanation: 'The heart is a muscular organ that pumps blood carrying oxygen and nutrients to every single cell.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic5A._id,
        questionText: 'What is the tiny, balloon-like air sacs in our lungs where oxygen enters the blood and carbon dioxide leaves called?',
        options: ['Trachea', 'Alveoli', 'Bronchi', 'Diaphragm'],
        correctOption: 1,
        explanation: 'Alveoli are microscopic air sacs in the lungs where gas exchange (oxygen in, carbon dioxide out) takes place with blood capillaries.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic5A._id,
        questionText: 'Which vessels carry oxygen-rich blood AWAY from the heart to the rest of the body?',
        options: ['Veins', 'Arteries', 'Nerves', 'Tendons'],
        correctOption: 1,
        explanation: 'Arteries carry oxygenated blood away from the heart, while veins carry oxygen-poor blood back to the heart.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic5A._id,
        questionText: 'What muscle below your lungs moves down when you breathe in, helping to fill your lungs with air?',
        options: ['Bicep', 'Triceps', 'Diaphragm', 'Abdominal'],
        correctOption: 2,
        explanation: 'The diaphragm is a dome-shaped muscle that contracts and moves downwards, creating a vacuum that pulls air into the lungs.',
        difficulty: 'medium',
      },
    ]);

    const subtopic5B = await Subtopic.create({
      topicId: topic5._id,
      title: 'Digestive & Nervous Systems',
      description: 'Explore how we extract nutrients from food and how the brain directs actions.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic5B._id,
        questionText: 'Where does the digestion of food begin in the human body?',
        options: ['Stomach', 'Small Intestine', 'Mouth', 'Oesophagus'],
        correctOption: 2,
        explanation: 'Digestion begins in the mouth where teeth chew food, and saliva starts breaking down starches.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic5B._id,
        questionText: 'In which organ is most of the nutrients from digested food absorbed into the blood stream?',
        options: ['Stomach', 'Small Intestine', 'Large Intestine', 'Liver'],
        correctOption: 1,
        explanation: 'The small intestine is lined with tiny finger-like folds (villi) that absorb nutrients into the blood.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic5B._id,
        questionText: 'Which part of the brain controls your balance, posture, and coordination when you ride a bicycle?',
        options: ['Cerebrum', 'Cerebellum', 'Medulla Oblongata', 'Spinal Cord'],
        correctOption: 1,
        explanation: 'The cerebellum (little brain) coordinates muscle movements, balance, and posture.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic5B._id,
        questionText: 'What are the microscopic cables that carry sensory messages from your skin up to your spinal cord and brain?',
        options: ['Arteries', 'Veins', 'Nerves', 'Muscles'],
        correctOption: 2,
        explanation: 'Nerves are bundles of fibers that transmit electrical signals between the brain/spinal cord and the rest of the body.',
        difficulty: 'easy',
      },
    ]);

    // =========================================================================
    // CLASS 5 TECHNOLOGY & STEM TOPICS
    // =========================================================================

    // Topic 6: Introduction to Robotics & AI (Class 5)
    const topic6 = await Topic.create({
      title: 'Introduction to Robotics & AI',
      description: 'Unlock the future! Understand how robots sense the world and how Artificial Intelligence works.',
      classNum: 5,
      icon: '🤖',
    });

    const subtopic6A = await Subtopic.create({
      topicId: topic6._id,
      title: 'How Robots Work',
      description: 'Learn the primary components of robots: sensors, actuators, and processors.',
      order: 1,
    });

    await Question.create([
      {
        subtopicId: subtopic6A._id,
        questionText: 'A smart vacuum cleaner is cleaning a room. Suddenly, it stops right before a flight of stairs and turns around. Which part of the robot helped it "know" that there was a drop ahead and avoid falling?',
        options: [
          'The Actuator (wheels)',
          'The Sensor (infrared/cliff sensor)',
          'The CPU (battery indicator)',
          'The chassis (metal outer frame)'
        ],
        correctOption: 1,
        explanation: 'Sensors act like the eyes and ears of a robot. A cliff sensor sends out invisible beams of light; when the light takes too long to bounce back (indicating a drop/staircase), the robot\'s processor commands the wheels (actuators) to stop and turn.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic6A._id,
        questionText: 'Which component of a robot acts as its "muscles" to make it move, turn wheels, or lift an arm?',
        options: ['Sensors', 'Actuators / Motors', 'Batteries', 'Microphones'],
        correctOption: 1,
        explanation: 'Actuators (like DC motors or servo motors) convert electrical energy from the battery into physical movement.',
        difficulty: 'easy',
      },
      {
        subtopicId: subtopic6A._id,
        questionText: 'If sensors are the "eyes" and actuators are the "muscles", what part of the robot acts as its "brain"?',
        options: ['The steel skeleton', 'The solar panel', 'The Microcontroller / Processor', 'The rubber tires'],
        correctOption: 2,
        explanation: 'The processor (microcontroller) runs the software code, reads data from the sensors, and decides how to control the actuators.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic6A._id,
        questionText: 'Which of the following is a key difference between a simple toaster and a smart kitchen robot?',
        options: [
          'A toaster uses electricity, but a smart robot does not',
          'A smart robot can sense its environment, make decisions, and execute physical tasks automatically based on code',
          'A toaster is made of plastic, but a robot is always wooden',
          'There is no difference'
        ],
        correctOption: 1,
        explanation: 'Robots possess a continuous loop of sensing, thinking (decision-making via processor), and acting. Simple appliances just execute a manual timer.',
        difficulty: 'easy',
      },
    ]);

    const subtopic6B = await Subtopic.create({
      topicId: topic6._id,
      title: 'Understanding AI',
      description: 'Discover how machine learning, voice assistants, and image recognition shape our world.',
      order: 2,
    });

    await Question.create([
      {
        subtopicId: subtopic6B._id,
        questionText: 'When a smartphone camera automatically recognizes your face and unlocks, what AI technology is it using?',
        options: ['Natural Language Processing', 'Image Recognition / Computer Vision', 'Robot Navigation', 'Cryptographic Hashing'],
        correctOption: 1,
        explanation: 'Computer vision is an AI field that trains computers to interpret and understand the visual world (like identifying facial features).',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic6B._id,
        questionText: 'How does an Artificial Intelligence (AI) assistant like Alexa or Siri learn to understand different accents over time?',
        options: [
          'A human programmer manually types in every accent in the world',
          'It uses Machine Learning, studying patterns in millions of voice recordings to improve its accuracy',
          'It guesses randomly and gets lucky',
          'It connects to a dictionary inside the phone'
        ],
        correctOption: 1,
        explanation: 'Machine learning allows AI systems to analyze vast amounts of data, find patterns, and self-improve without being explicitly programmed for every specific scenario.',
        difficulty: 'hard',
      },
      {
        subtopicId: subtopic6B._id,
        questionText: 'What is a key benefit of using Artificial Intelligence in hospitals and healthcare?',
        options: [
          'AI can clean patient rooms faster than human doctors',
          'AI can scan thousands of X-rays quickly to help doctors spot diseases early',
          'AI can cure all sicknesses instantly with electricity',
          'AI replaces the need for healthy eating'
        ],
        correctOption: 1,
        explanation: 'AI is exceptional at pattern matching. It can analyze thousands of medical images to assist doctors in fast, highly accurate diagnoses.',
        difficulty: 'medium',
      },
      {
        subtopicId: subtopic6B._id,
        questionText: 'Which of the following is an ethical guideline we must follow when using or developing AI systems?',
        options: [
          'We must use AI to do all our homework without learning anything ourselves',
          'AI should be developed to be fair, safe, protect user privacy, and benefit humanity',
          'AI should be hidden from children',
          'AI must replace all human beings immediately'
        ],
        correctOption: 1,
        explanation: 'Responsible AI must be developed with safety, fairness, privacy, and accountability at its core to ensure it supports and enhances human life.',
        difficulty: 'easy',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'MongoDB database successfully seeded with world-class CBSE/ICSE Science & Technology Curriculum! 🚀',
    }, { status: 200 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong during seeding' },
      { status: 500 }
    );
  }
}
