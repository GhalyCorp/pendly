"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// interface DonateFormProps {
//   businessId: string;
// }

const DonateFormInner: React.FC<{
  businessId: string;
  lockedAmount: number;
  lockedName: string;
  lockedEmail: string;
  businessAmount: number;
  transferType: string;
}> = ({ businessId, lockedAmount, lockedName, lockedEmail, businessAmount, transferType }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setMessage("");
    try {
      const confirmResult = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          receipt_email: lockedEmail.trim(),
        },
        redirect: "if_required",
      });
      if (confirmResult.error) {
        setMessage(confirmResult.error.message || "Payment failed");
        setLoading(false);
        return;
      }
              if (confirmResult.paymentIntent?.status === "succeeded") {
          // Update Firestore donated amount with business amount (90%)
          const businessRef = doc(db, "businesses", businessId);
          await updateDoc(businessRef, {
            donated: increment(businessAmount),
          });
          // Add donor record with full amount for transparency
          await addDoc(collection(db, "businesses", businessId, "donations"), {
            name: lockedName,
            amount: lockedAmount, // Store full amount for donor record
            businessAmount: businessAmount, // Store business amount separately
            email: lockedEmail.trim(),
            timestamp: serverTimestamp(),
          });
          
          // Reward and email will be handled by the Stripe webhook
        
        // Attempt to transfer the business amount to the business's Stripe account
        try {
          const transferResponse = await fetch('/api/transfer-to-business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: confirmResult.paymentIntent.id,
              businessId: businessId,
              businessAmount: businessAmount,
              transferType: transferType,
            }),
          });
          
          if (transferResponse.ok) {
            const transferData = await transferResponse.json();
            console.log('Transfer result:', transferData);
          } else {
            console.error('Transfer failed:', await transferResponse.text());
          }
        } catch (transferError) {
          console.error('Error initiating transfer:', transferError);
        }
        
        setMessage("Thank you for your donation!");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setMessage("Payment processing...");
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        setMessage((error as { message: string }).message || "Error processing payment");
      } else {
        setMessage("Error processing payment");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Payment Information</h2>
        <PaymentElement />
        <p className="text-xs text-blue-700 mt-2">
          Payments are securely processed by Stripe. For testing, use card <span className="font-mono">4242 4242 4242 4242</span> with any future date and CVC.
        </p>
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition mt-4"
      >
        {loading ? "Processing..." : "Donate"}
      </button>
      {message && <p className="text-center text-blue-900 mt-2">{message}</p>}
    </form>
  );
};

const DonateForm: React.FC<{ businessId: string; onShowPayment?: () => void }> = ({ businessId }) => {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [lockedAmount, setLockedAmount] = useState<number | null>(null);
  const [lockedName, setLockedName] = useState<string>("");
  const [lockedEmail, setLockedEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [businessAmount, setBusinessAmount] = useState<number>(0);
  const [platformFeePercentage, setPlatformFeePercentage] = useState<number>(10);
  const [transferType, setTransferType] = useState<string>('manual');

  React.useEffect(() => {
    async function fetchBusinessData() {
      try {
        const docRef = doc(db, "businesses", businessId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessName(data.businessName || data.name || "Business");
        } else {
          setBusinessName("Business");
        }
      } catch {
        setBusinessName("Business");
      }
    }
    fetchBusinessData();
  }, [businessId]);

  const nameValid = /^[A-Za-z' ]+$/.test(name.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const amountValid = amount.trim() && !isNaN(Number(amount)) && Number(amount) > 0;
  const allFieldsFilled = nameValid && emailValid && amountValid;

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allFieldsFilled) {
      setError("Please fill all fields correctly.");
      return;
    }
    setLoading(true);
    const amountCents = Math.round(Number(amount) * 100);
    setLockedAmount(amountCents);
    setLockedName(name.trim());
    setLockedEmail(email.trim());
    // Create payment intent
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          email: email.trim(),
          businessName: businessName,
          businessId: businessId,
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setBusinessAmount(data.businessAmount || 0);
        setPlatformFeePercentage(data.platformFeePercentage || 10);
        setTransferType(data.transferType || 'manual');
        setShowPayment(true);
      } else {
        setError(data.error || "Failed to load payment information.");
      }
    } catch {
      setError("Failed to load payment information.");
    }
    setLoading(false);
  };

  if (showPayment && clientSecret && lockedAmount && lockedName && lockedEmail) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <DonateFormInner
          businessId={businessId}
          lockedAmount={lockedAmount}
          lockedName={lockedName}
          lockedEmail={lockedEmail}
          businessAmount={businessAmount}
          transferType={transferType}
        />
      </Elements>
    );
  }

  return (
    <form onSubmit={handleProceed} className="w-full max-w-md space-y-4">
      <div className="mb-4">
        <label className="block text-blue-900 font-semibold mb-1">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={`w-full border ${name && !nameValid ? "border-red-500" : "border-blue-300"} rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900`}
        />
        {name && !nameValid && (
          <p className="text-red-600 text-sm mt-1">Name can only contain letters, spaces, and apostrophes.</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-blue-900 font-semibold mb-1">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={`w-full border ${email && !emailValid ? "border-red-500" : "border-blue-300"} rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900`}
        />
        {email && !emailValid && (
          <p className="text-red-600 text-sm mt-1">Email must contain an &quot;@&quot; symbol.</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-blue-900 font-semibold mb-1">Donation Amount (USD)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className={`w-full border ${amount && !amountValid ? "border-red-500" : "border-blue-300"} rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900`}
        />
        {amount && !amountValid && (
          <p className="text-red-600 text-sm mt-1">Donation amount must be a number greater than 0.</p>
        )}
      </div>
      
      {/* Fee Breakdown - moved to under donation amount */}
      {amount && amountValid && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Donation Breakdown</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Your Donation:</span>
              <span className="font-semibold">${(Number(amount)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Platform Fee ({platformFeePercentage}%):</span>
              <span className="text-blue-600">-${(Number(amount) * (platformFeePercentage / 100)).toFixed(2)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between font-semibold">
              <span className="text-blue-900">Business Receives:</span>
              <span className="text-green-700">${(Number(amount) * (1 - platformFeePercentage / 100)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      {error && <p className="text-red-600 text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition mt-4"
      >
        {loading ? "Loading..." : "Proceed to Payment"}
      </button>
    </form>
  );
};

export default DonateForm;
