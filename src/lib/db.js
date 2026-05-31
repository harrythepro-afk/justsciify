import { getDatabases, getAccount, DB_ID, COL, ID, Query } from './appwrite';

// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function createAccount(email, password, name) {
  const account = getAccount();
  const user = await account.create(ID.unique(), email, password, name);
  return user;
}

export async function loginUser(email, password) {
  const account = getAccount();
  return account.createEmailPasswordSession(email, password);
}

export async function logoutUser() {
  const account = getAccount();
  return account.deleteSession('current');
}

export async function getCurrentUser() {
  try {
    const account = getAccount();
    return await account.get();
  } catch {
    return null;
  }
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(userId, name, email, classNum) {
  const db = getDatabases();
  return db.createDocument(DB_ID, COL.USERS, userId, {
    userId,
    name,
    email,
    classNum: parseInt(classNum),
    beltLevel: 'white',
    xp: 0,
    streak: 0,
    lastActive: new Date().toISOString(),
    completedTopics: [],
  });
}

export async function getUserProfile(userId) {
  try {
    const db = getDatabases();
    return await db.getDocument(DB_ID, COL.USERS, userId);
  } catch {
    return null;
  }
}

export async function updateUserProfile(userId, data) {
  const db = getDatabases();
  return db.updateDocument(DB_ID, COL.USERS, userId, data);
}

// ─── XP & Belt logic ─────────────────────────────────────────────────────────

const BELT_THRESHOLDS = [
  { belt: 'white',  min: 0 },
  { belt: 'yellow', min: 100 },
  { belt: 'green',  min: 300 },
  { belt: 'blue',   min: 600 },
  { belt: 'red',    min: 1000 },
  { belt: 'black',  min: 1500 },
];

export function getBeltForXP(xp) {
  let belt = 'white';
  for (const t of BELT_THRESHOLDS) {
    if (xp >= t.min) belt = t.belt;
  }
  return belt;
}

export function getNextBeltThreshold(xp) {
  for (const t of BELT_THRESHOLDS) {
    if (xp < t.min) return t;
  }
  return null; // max belt
}

export async function addXP(userId, currentXP, earnedXP, topicId, completedTopics = []) {
  const newXP = currentXP + earnedXP;
  const newBelt = getBeltForXP(newXP);
  const updatedTopics = completedTopics.includes(topicId)
    ? completedTopics
    : [...completedTopics, topicId];

  await updateUserProfile(userId, {
    xp: newXP,
    beltLevel: newBelt,
    completedTopics: updatedTopics,
    lastActive: new Date().toISOString(),
  });

  return { newXP, newBelt };
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function getTopics(classNum = null) {
  const db = getDatabases();
  const queries = [Query.orderAsc('title')];
  if (classNum) queries.push(Query.equal('classNum', parseInt(classNum)));
  const res = await db.listDocuments(DB_ID, COL.TOPICS, queries);
  return res.documents;
}

export async function getTopic(topicId) {
  const db = getDatabases();
  return db.getDocument(DB_ID, COL.TOPICS, topicId);
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestions(topicId, limit = 10) {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.QUESTIONS, [
    Query.equal('topicId', topicId),
    Query.limit(limit),
  ]);
  // Shuffle questions
  const docs = res.documents;
  for (let i = docs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [docs[i], docs[j]] = [docs[j], docs[i]];
  }
  return docs;
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────

export async function saveQuizResult(userId, topicId, score, total, xpEarned) {
  const db = getDatabases();
  return db.createDocument(DB_ID, COL.QUIZ_RESULTS, ID.unique(), {
    userId,
    topicId,
    score,
    total,
    xpEarned,
    date: new Date().toISOString(),
  });
}

export async function getUserResults(userId, limit = 10) {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.QUIZ_RESULTS, [
    Query.equal('userId', userId),
    Query.orderDesc('date'),
    Query.limit(limit),
  ]);
  return res.documents;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllUsers(limit = 100) {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.USERS, [Query.limit(limit)]);
  return res.documents;
}

export async function getAllTopics() {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.TOPICS, [Query.orderAsc('classNum')]);
  return res.documents;
}

export async function createTopic(data) {
  const db = getDatabases();
  return db.createDocument(DB_ID, COL.TOPICS, ID.unique(), data);
}

export async function updateTopic(topicId, data) {
  const db = getDatabases();
  return db.updateDocument(DB_ID, COL.TOPICS, topicId, data);
}

export async function deleteTopic(topicId) {
  const db = getDatabases();
  return db.deleteDocument(DB_ID, COL.TOPICS, topicId);
}

export async function createQuestion(data) {
  const db = getDatabases();
  return db.createDocument(DB_ID, COL.QUESTIONS, ID.unique(), data);
}

export async function updateQuestion(questionId, data) {
  const db = getDatabases();
  return db.updateDocument(DB_ID, COL.QUESTIONS, questionId, data);
}

export async function deleteQuestion(questionId) {
  const db = getDatabases();
  return db.deleteDocument(DB_ID, COL.QUESTIONS, questionId);
}

export async function getQuestionsByTopic(topicId) {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.QUESTIONS, [
    Query.equal('topicId', topicId),
    Query.limit(100),
  ]);
  return res.documents;
}

export async function getAllQuizResults(limit = 200) {
  const db = getDatabases();
  const res = await db.listDocuments(DB_ID, COL.QUIZ_RESULTS, [
    Query.orderDesc('date'),
    Query.limit(limit),
  ]);
  return res.documents;
}
