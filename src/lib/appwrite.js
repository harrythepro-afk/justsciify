import { Client, Account, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = '6a1bbec7000c4c660a17';
const ENDPOINT  = 'https://cloud.appwrite.io/v1';
export const DB_ID = '6a1bc2040017374a7f4a';

// Collection IDs — must match what the setup script creates
export const COL = {
  USERS:        'users',
  TOPICS:       'topics',
  QUESTIONS:    'questions',
  QUIZ_RESULTS: 'quiz_results',
};

let client;
let account;
let databases;

function getClient() {
  if (!client) {
    client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  }
  return client;
}

export function getAccount() {
  if (!account) account = new Account(getClient());
  return account;
}

export function getDatabases() {
  if (!databases) databases = new Databases(getClient());
  return databases;
}

export { ID, Query };
