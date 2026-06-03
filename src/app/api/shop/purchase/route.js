import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined!');
}

const SHOP_ITEMS = [
  { id: 'avatar_astro_boy', cost: 50 },
  { id: 'avatar_cyber_cyborg', cost: 100 },
  { id: 'avatar_alien_xenon', cost: 150 },
  { id: 'avatar_solar_lord', cost: 250 },
  { id: 'avatar_blackhole_mage', cost: 400 },
];

export async function POST(req) {
  try {
    await dbConnect();
    
    // Auth check
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

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const shopItem = SHOP_ITEMS.find(item => item.id === itemId);
    if (!shopItem) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already unlocked
    if (user.unlockedAvatars.includes(itemId)) {
      return NextResponse.json({ error: 'Item already unlocked' }, { status: 400 });
    }

    // Check if sufficient XP
    if (user.xp < shopItem.cost) {
      return NextResponse.json({ error: 'Insufficient XP balance' }, { status: 400 });
    }

    // Deduct XP and add to unlockedAvatars
    const updatedUnlocked = [...user.unlockedAvatars, itemId];
    const newXP = user.xp - shopItem.cost;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        xp: newXP,
        unlockedAvatars: updatedUnlocked,
        avatarId: itemId, // Auto-equip on purchase
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while purchasing item' },
      { status: 500 }
    );
  }
}
