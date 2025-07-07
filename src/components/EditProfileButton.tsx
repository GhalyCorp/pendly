'use client';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../lib/firebase';

export default function EditProfileButton({ businessEmail, businessId }: { businessEmail: string; businessId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === businessEmail) {
        setShow(true);
      } else {
        setShow(false);
      }
    });
    return () => unsubscribe();
  }, [businessEmail]);

  if (!show) return null;
  return (
    <a
      href={`/business/${businessId}/edit`}
      className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    >
      <span className="mr-2">✏️</span>
      Edit Post
    </a>
  );
}
