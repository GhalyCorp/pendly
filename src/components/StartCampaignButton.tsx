"use client";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";
import { useEffect, useState } from "react";

import type { User } from "firebase/auth";

export default function StartCampaignButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleClick = () => {
    if (user) {
      router.push("/business/create");
    } else {
      router.push("/signup");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-red-700 transition-all duration-300 hover:scale-105"
      disabled={loading}
    >
      Start a Campaign
    </button>
  );
}
