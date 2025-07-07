import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { businessId, amount } = await request.json();

    if (!businessId || !amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      donated: increment(amount),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}
