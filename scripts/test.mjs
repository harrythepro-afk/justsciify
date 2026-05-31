import { Client, Databases } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = '6a1bbec7000c4c660a17'; // New Project ID
const DB_ID = '6a1bc2040017374a7f4a';      // Swapped Database ID

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/APPWRITE_API_KEY\s*=\s*(.+)/);
const API_KEY = match ? match[1].trim() : '';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function test() {
  try {
    console.log('Testing connection with PROJECT_ID:', PROJECT_ID);
    // Try to get the database to see if it exists
    const db = await databases.get(DB_ID);
    console.log('✅ Success! Database found:', db.name);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

test();
