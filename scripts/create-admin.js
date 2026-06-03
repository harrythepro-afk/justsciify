const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Connection URI from env.local
const MONGODB_URI = "mongodb://hemant:Bxydn-MYkKLg-3J@ac-rg9dwrh-shard-00-00.4ryni99.mongodb.net:27017,ac-rg9dwrh-shard-00-01.4ryni99.mongodb.net:27017,ac-rg9dwrh-shard-00-02.4ryni99.mongodb.net:27017/?ssl=true&replicaSet=atlas-m27lek-shard-0&authSource=admin&appName=justsciify";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String },
  classNum: { type: Number, default: 4 },
  beltLevel: { type: String, default: 'white' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  completedTopics: { type: [String], default: [] },
  unlockedAvatars: { type: [String], default: ['explorer_default'] },
  avatarId: { type: String, default: 'explorer_default' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas!");

    const password = "adminpassword123";
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.findOneAndUpdate(
      { email: "admin@justsciify.com" },
      {
        name: "Administrator",
        email: "admin@justsciify.com",
        password: hashedPassword,
        classNum: 4,
        beltLevel: "black",
        xp: 1600,
        streak: 10,
        lastActive: new Date(),
        completedTopics: [],
        unlockedAvatars: ['explorer_default', 'avatar_blackhole_mage'],
        avatarId: 'explorer_default'
      },
      { upsert: true, new: true }
    );

    console.log("\n==============================================");
    console.log("🎉 Admin user successfully created/reset!");
    console.log("----------------------------------------------");
    console.log("Email:    admin@justsciify.com");
    console.log("Password: adminpassword123");
    console.log("==============================================\n");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

run();
