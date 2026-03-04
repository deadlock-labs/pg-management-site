"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please sign in manually.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 bg-stripe-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-stripe-primary rounded-xl mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-stripe-text">
            Create your account
          </h1>
          <p className="text-[13px] text-stripe-text-secondary mt-1">
            Get started with PG Management in seconds
          </p>
        </div>

        <div className="bg-stripe-card border border-stripe-border rounded-xl shadow-sm p-6">
          {error && (
            <div className="bg-stripe-danger-light text-stripe-danger text-[13px] p-3 rounded-lg mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-stripe-text mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-stripe-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-stripe-text mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-stripe-text mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-[14px] border border-stripe-border rounded-lg focus:ring-2 focus:ring-stripe-primary/20 focus:border-stripe-primary outline-none transition-colors bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stripe-primary text-white py-2.5 rounded-lg text-[14px] font-medium hover:bg-stripe-primary-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-stripe-text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-stripe-primary hover:text-stripe-primary-hover font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
