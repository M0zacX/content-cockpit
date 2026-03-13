"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldError(null);

    if (password !== confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFieldError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen bg-mesh text-foreground flex items-center justify-center px-4">
      {/* Floating orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Signup card */}
      <div className="relative z-10 w-full max-w-md dropdown-menu rounded-2xl shadow-2xl p-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
          <p className="text-sm text-text3 mt-1">Start planning your content</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-[10px] uppercase tracking-wider text-text3 font-semibold mb-1.5">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
          </div>

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
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
              minLength={6}
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[10px] uppercase tracking-wider text-text3 font-semibold mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              minLength={6}
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
            {(fieldError || error) && (
              <p className="text-xs text-t-rose mt-1">{fieldError || error}</p>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-text3 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
