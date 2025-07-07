"use client";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface DeleteBusinessButtonProps {
  businessId: string;
  businessEmail: string;
}

const DeleteBusinessButton: React.FC<DeleteBusinessButtonProps> = ({ businessId, businessEmail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Get current user
  const auth = getAuth();
  const user = auth.currentUser;
  const isOwner = user && user.email === businessEmail;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this business post? This action cannot be undone.")) return;
    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, "businesses", businessId));
      router.push("/");
    } catch {
      setError("Failed to delete business post.");
    }
    setLoading(false);
  };

  if (!isOwner) return null;

  return (
    <div className="mt-4 w-full flex flex-col items-center">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Post"}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default DeleteBusinessButton; 