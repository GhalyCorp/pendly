import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhv3fYW9boI3NqVcQZzuZ_5XPA-_7DhyQ",
  authDomain: "pendly-b9e13.firebaseapp.com",
  projectId: "pendly-b9e13",
  storageBucket: "pendly-b9e13.appspot.com",
  messagingSenderId: "26590917458",
  appId: "1:26590917458:web:ca45210f15f0243a86408b",
  measurementId: "G-4VZV0RMDM1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runTest() {
  try {
    const docRef = await addDoc(collection(db, "businesses"), {
      name: "Test Business",
      description: "This is a Firestore test.",
      goal: 1000
    });
    console.log("✅ Document written with ID:", docRef.id);
  } catch (err) {
    console.error("❌ Failed to write to Firestore:", err);
  }
}

runTest();
