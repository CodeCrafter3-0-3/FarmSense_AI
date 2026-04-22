// Firebase Configuration for FarmSense Admin Panel
// Uses the same database as the mobile app
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, get, set, update, remove, query, orderByChild, limitToLast } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCRiok1waOSyhpQNUIfeF0468j9SmBPqBM",
  authDomain: "farmsense-580c0.firebaseapp.com",
  databaseURL: "https://farmsense-580c0-default-rtdb.firebaseio.com",
  projectId: "farmsense-580c0",
  storageBucket: "farmsense-580c0.firebasestorage.app",
  messagingSenderId: "649656111175",
  appId: "1:649656111175:web:a9bd3522755de749dbe162"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, get, set, update, remove, query, orderByChild, limitToLast };
export default app;
