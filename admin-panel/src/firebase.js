// Firebase Configuration for FarmSense Admin Panel
// Uses the same database as the mobile app
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, get, set, update, remove, query, orderByChild, limitToLast } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-ReplaceWithYourOwn",
  authDomain: "farmsense-580c0.firebaseapp.com",
  databaseURL: "https://farmsense-580c0-default-rtdb.firebaseio.com",
  projectId: "farmsense-580c0",
  storageBucket: "farmsense-580c0.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, get, set, update, remove, query, orderByChild, limitToLast };
export default app;
