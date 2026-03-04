"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentButtonProps {
  billShareId: string;
  amount: number;
  userName: string;
  userEmail: string;
}

export default function PaymentButton({ billShareId, amount, userName, userEmail }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePayment = async () => {
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billShareId, amount }),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const { orderId, key } = await res.json();

      const options: RazorpayOptions = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "PG Management",
        description: "Bill Payment",
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                billShareId,
              }),
            });

            if (verifyRes.ok) {
              setStatus("success");
              window.location.reload();
            } else {
              setStatus("error");
            }
          } catch {
            setStatus("error");
          }
        },
        prefill: { name: userName, email: userEmail },
        theme: { color: "#635bff" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-stripe-success-light text-stripe-success">
        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        Paid
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-stripe-primary text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-stripe-primary-hover disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
      </button>
      {status === "error" && (
        <p className="text-stripe-danger text-[12px] mt-1">Payment failed. Try again.</p>
      )}
    </div>
  );
}
