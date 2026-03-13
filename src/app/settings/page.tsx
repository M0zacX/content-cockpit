"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    // Load profile
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        else setDisplayName(user.email?.split("@")[0] ?? "");
        setProfileLoading(false);
      });
  }, [user, authLoading, router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user!.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (authLoading || profileLoading) {
    return (
      <div className="relative min-h-screen bg-mesh text-foreground flex items-center justify-center">
        <div className="bg-orb bg-orb-1" aria-hidden="true" />
        <div className="bg-orb bg-orb-2" aria-hidden="true" />
        <div className="bg-orb bg-orb-3" aria-hidden="true" />
        <div className="relative z-10 flex items-center gap-3 text-text3">
          <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-mesh text-foreground flex items-center justify-center px-4">
      {/* Floating orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Settings card */}
      <div className="relative z-10 w-full max-w-md dropdown-menu rounded-2xl shadow-2xl p-8 animate-slide-up">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text3 hover:text-foreground transition mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to planner
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-text3 mt-1">Manage your profile</p>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSave} className="space-y-4">
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
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text3 font-semibold mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-text3 cursor-not-allowed opacity-60"
            />
          </div>

          {error && (
            <p className="text-xs text-t-rose">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-border my-6" />

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2.5 bg-t-rose/10 text-t-rose text-sm font-semibold rounded-xl border border-t-rose/30 hover:bg-t-rose/20 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
