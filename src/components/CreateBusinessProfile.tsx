"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function CreateBusinessProfile() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "businesses"), {
        name,
        description,
        goal: Math.round(Number(goal) * 100), // store goal in cents
        donated: 0,
      });

      alert("Business profile created!");
      router.push(`/business/${docRef.id}`);
    } catch (error) {
      alert("Error creating business profile.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <input
        type="text"
        placeholder="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Business Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        placeholder="Donation Goal ($)"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="w-full p-2 border rounded"
        required
        min={1}
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Create Profile
      </button>
    </form>
  );
}
