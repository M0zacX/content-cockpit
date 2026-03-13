"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Hard navigate so the middleware runs fresh with the new auth cookies.
    // router.push + router.refresh can race and loop back to /login.
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/";
    window.location.href = redirectTo;
  }

  return (
    <div className="relative min-h-screen bg-mesh text-foreground flex items-center justify-center px-4">
      {/* Floating orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md dropdown-menu rounded-2xl shadow-2xl p-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-sm text-text3 mt-1">Sign in to your content planner</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] uppercase tracking-wider text-text3 font-semibold mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-wider text-text3 font-semibold mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              minLength={6}
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
            {error && (
              <p className="text-xs text-t-rose mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-text3 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover font-medium transition">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
