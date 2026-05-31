// Helper to extract JSON from fetch responses safely
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function createAccount(email, password, name) {
  const data = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  }).then(handleResponse);

  const u = data.user;
  return { ...u, $id: u._id };
}

export async function loginUser(email, password) {
  const data = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

  const u = data.user;
  return { ...u, $id: u._id, userId: u._id };
}

export async function logoutUser() {
  return fetch('/api/auth/logout', {
    method: 'POST',
  }).then(handleResponse);
}

export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.user) return null;
    return { ...data.user, $id: data.user._id };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(userId, name, email, classNum) {
  // In MongoDB, the profile is part of the User model itself.
  // We simply update the classNum and any profile details during this call.
  const data = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, classNum: parseInt(classNum) }),
  }).then(handleResponse);

  const u = data.user;
  return { ...u, $id: u._id };
}

export async function getUserProfile(userId) {
  // Profile matches User in MongoDB
  return getCurrentUser();
}

export async function updateUserProfile(userId, data) {
  const resData = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

  const u = resData.user;
  return { ...u, $id: u._id };
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
  // In MongoDB, XP is handled automatically on quiz submissions,
  // but if we call this directly, we can update it via profile PUT.
  const newXP = currentXP + earnedXP;
  const newBelt = getBeltForXP(newXP);
  const updatedTopics = completedTopics.includes(topicId)
    ? completedTopics
    : [...completedTopics, topicId];

  const profile = await updateUserProfile(userId, {
    xp: newXP,
    beltLevel: newBelt,
    completedTopics: updatedTopics,
    lastActive: new Date().toISOString(),
  });

  return { newXP, newBelt, profile };
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function getTopics(classNum = null) {
  const url = classNum ? `/api/topics?classNum=${classNum}` : '/api/topics';
  const data = await fetch(url).then(handleResponse);
  return data.topics;
}

export async function getTopic(topicId) {
  const data = await fetch(`/api/topics/${topicId}`).then(handleResponse);
  return data.topic;
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function getQuestions(subtopicId, limit = 10) {
  // Fetches from subtopic-specific questions API
  const data = await fetch(`/api/subtopics/${subtopicId}/questions`).then(handleResponse);
  return data.questions.slice(0, limit);
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────

export async function saveQuizResult(userId, subtopicId, score, total, xpEarned) {
  const data = await fetch('/api/quiz/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtopicId, score, total, xpEarned }),
  }).then(handleResponse);

  return data.result;
}

export async function getUserResults(userId, limit = 10) {
  const data = await fetch(`/api/quiz/results?limit=${limit}`).then(handleResponse);
  return data.results;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 10) {
  const data = await fetch(`/api/leaderboard?limit=${limit}`).then(handleResponse);
  return data.users;
}

// ─── Admin / Utilities ────────────────────────────────────────────────────────

export async function getAllUsers(limit = 100) {
  const data = await fetch(`/api/leaderboard?limit=${limit}`).then(handleResponse);
  return data;
}

export async function getAllTopics() {
  return getTopics();
}

export async function createTopic(data) {
  return fetch('/api/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export async function updateTopic(topicId, data) {
  return fetch(`/api/topics/${topicId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export async function deleteTopic(topicId) {
  return fetch(`/api/topics/${topicId}`, {
    method: 'DELETE',
  }).then(handleResponse);
}

export async function createQuestion(data) {
  const { subtopicId } = data;
  return fetch(`/api/subtopics/${subtopicId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export async function updateQuestion(questionId, data) {
  return fetch(`/api/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export async function deleteQuestion(questionId) {
  return fetch(`/api/questions/${questionId}`, {
    method: 'DELETE',
  }).then(handleResponse);
}

export async function getQuestionsByTopic(subtopicId) {
  return getQuestions(subtopicId);
}

export async function getAllQuizResults(limit = 100) {
  return getUserResults(null, limit);
}

