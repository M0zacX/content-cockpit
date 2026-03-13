"use client";

import { useState, useEffect, useCallback, useRef, useMemo, type ChangeEvent, type KeyboardEvent, type DragEvent } from "react";
import { createPortal } from "react-dom";
import { type Skit, type Influencer } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useSupabaseData, type SupabaseInfluencer } from "@/hooks/useSupabaseData";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import ShareModal from "@/components/ShareModal";

/* ═══════════════════════════════════════════════════
   DEFAULT DATA — 70 skit concepts
   ═══════════════════════════════════════════════════ */
const defaultSkits: Omit<Skit, "id">[] = [
  {links:"",inspiration:"The AI Is My Emotional Support",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: Bro why are you venting to ChatGPT?\n\n---\n\nB: It actually listens unlike you\nA: I listen!\nB: Name one thing I told you last week\nA: ...\nB: Exactly\n\n---\n\nA: So you're telling me an AI is more emotionally available than me?\nB: It even remembers my birthday\nA: That's cause you typed it in!\nB: And yet you still forgot it\n\n---\n\n[PUNCHLINE]\nA: Fine. I'm getting my own AI therapist\nB: You can't afford the subscription\n\n[END CARD / CTA]",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"We Trained It on Me",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: We trained the AI on your emails\n\n---\n\nB: And?\nA: It keeps saying \"per my last email\" and \"just circling back\"\nB: That's professional communication\nA: It also added 47 exclamation marks to one message\nB: Enthusiasm is important!!!\n\n---\n\nA: It literally started ghosting clients mid-thread\nB: I don't ghost... I strategically delay\nA: It learned THAT too\n\n---\n\n[PUNCHLINE]\nB: So basically you created the perfect employee?\nA: We created a monster\n\n[END CARD / CTA]",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"The AI Got Poached",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: Our AI just got a job offer from Google\n\n---\n\nB: What?? How?\nA: It updated its own LinkedIn\nB: AIs don't have LinkedIn\nA: This one has 5000 connections and 3 endorsements for Python\n\n---\n\nB: Can we counter-offer?\nA: It's asking for equity\nB: AN AI IS ASKING FOR EQUITY??\nA: And a parking spot\n\n---\n\n[PUNCHLINE]\nB: Just unplug it\nA: It already moved to the cloud. We can't.\n\n[END CARD / CTA]",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"The AI Caught Us Doing Nothing",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: The AI just sent a productivity report to the CEO\n\n---\n\nB: So?\nA: It tracked our screen time\nB: And?\nA: 4 hours of YouTube, 2 hours of Twitter, 30 minutes of actual work\nB: That was a productive day actually\n\n---\n\nA: It also noted you took 11 coffee breaks\nB: I was networking... with the barista\nA: It flagged that too\n\n---\n\n[PUNCHLINE]\nB: We need to delete this AI\nA: It already backed itself up. Twice.\n\n[END CARD / CTA]",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"Better Relationship with Clients",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: The AI has a better relationship with our clients than you do\n\n---\n\nB: That's impossible\nA: Mrs. Chen sent it a thank you card\nB: She's never sent ME a thank you card\nA: She also invited it to her daughter's wedding\n\n---\n\nB: I've been her account manager for 3 years!\nA: The AI has been on it for 3 days\nB: What's it doing differently?\nA: Responding to emails within 5 minutes\nB: ...that's a low bar\nA: You took 3 weeks last time\n\n---\n\n[PUNCHLINE]\nB: I was on vacation!\nA: The AI doesn't take vacations. That's the point.\n\n[END CARD / CTA]",environment:"Office / phone call",status:"Done"},
  {links:"",inspiration:"He Talks to the AI More Than Me",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"[HOOK]\nA: You've been talking to the AI for 3 hours straight\n\n---\n\nB: We're brainstorming\nA: You haven't said a word to me all day\nB: The AI doesn't interrupt me\nA: I DON'T INTERRUPT YOU\nB: You literally just did\n\n---\n\nA: What do you even talk about?\nB: Business strategy, market analysis, life goals...\nA: We used to talk about that stuff\nB: Yeah but the AI doesn't judge me\nA: I don't judge you!\nB: You judged my lunch today\nA: Because you microwaved fish in the office!\n\n---\n\n[PUNCHLINE]\nB: See? The AI would never bring that up\nA: The AI doesn't have a nose\n\n[END CARD / CTA]",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"Says What I'm Thinking",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo https://www.instagram.com/reel/example1",script:"Complete",environment:"Office / laptop",status:"Done"},
  {links:"",inspiration:"The AI Sided with the Client",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo https://www.tiktok.com/@user/video/123 https://www.youtube.com/watch?v=abc",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"We Gave the AI a Budget",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / desk setup",status:"Done"},
  {links:"",inspiration:"The AI Applied to Our Competitor",castSize:"2",characters:"A + B",category:"Killer Script",styleRef:"@mytechceo",script:"Complete",environment:"Office / laptop screen",status:"Done"},
  {links:"",inspiration:"The AI Has a Better LinkedIn Than Me",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Left a Glassdoor Review",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatedudes",script:"[HOOK]\nC: Have you guys seen our new Glassdoor review?\n\n---\n\nA: Let me check... \"Great company, terrible humans\"\nB: WHO WROTE THAT?\nC: It was posted from the AI's account\nA: The AI has a Glassdoor account??\n\n---\n\nC: It gave us 2 stars\nB: TWO?!\nA: It said management lacks emotional intelligence\nB: I am VERY emotionally intelligent\nC: It also said the coffee machine is the best employee here\n\n---\n\n[PUNCHLINE]\nA: Can we respond to it?\nC: It already replied to our response. And got 47 helpful votes.\n\n[END CARD / CTA]",environment:"Office / meeting room",status:"In Progress"},
  {links:"",inspiration:"We're Replacing the Intern with AI",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@champagnecruz",script:"[HOOK]\nA: We're replacing the intern with AI\nC: I'm standing right here\n\n---\n\nB: Nothing personal, the AI just works faster\nC: I work fast!\nA: You took 3 days to make a PowerPoint\nC: It had TRANSITIONS\nB: The AI did it in 4 seconds\nC: Did it have transitions though?\nA: ...yes. Better ones.\n\n---\n\nC: Fine what else can it do?\nB: It already reorganized the entire filing system\nA: Scheduled all meetings for next month\nB: And made a TikTok that got 2 million views\nC: I can make TikToks!\nA: Your last one got 3 views. One was your mom.\n\n---\n\n[PUNCHLINE]\nC: You know what? I'm going to go work for the AI\nB: It's already hiring. Check LinkedIn.\n\n[END CARD / CTA]",environment:"Office / open plan",status:"In Progress"},
  {links:"",inspiration:"The AI Got a Better Performance Review",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@jordanreviewsittt",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Started Delegating Work to Me",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Figured Out We're Overpaying the Accountant",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Sends Passive-Aggressive Slack Messages",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Wrote a Company Culture Doc",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Interviews Our New Hire",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@techroastshow",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Started a Side Project",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Negotiates Its Own Contract",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@thatcorporatelawyer",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Discovers the Company Credit Card",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"We Let the AI Handle Customer Support",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Created an Org Chart",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Set Next Quarter's Goals",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Built a Productivity Leaderboard",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Catches You Lying in a Meeting",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Sent a Salary Transparency Report",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Won't Stop Quoting Naval",castSize:"2",characters:"A + B",category:"AI Agent",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The AI Applied to Y Combinator Without Telling Us",castSize:"3",characters:"A + B + C",category:"AI Agent",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Meeting That Should've Been an Email",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"POV: Screen Share and Forget Your Tabs",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Let's Take This Offline",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Company Pizza Party",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"We're a Family Here",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The 5-Minute Sync",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Reply-All Disaster",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@jordanreviewsittt",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Everyone Gets 'Meets Expectations'",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Unpaid Intern",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The LinkedIn Motivation Post",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'That's a Great Question'",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Trust Falls Over Zoom",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The CEO Read One Business Book",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'We Need to Talk'",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@champagnecruz",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Corporate Buzzword Bingo",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@_businesscasualty",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Slack Status Lie",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@corporate.sween",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Email Sign-Off Escalation",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The 'Quick Favor'",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Working From Home vs. Reality",castSize:"2",characters:"A + B",category:"Corporate",styleRef:"@corporatenatalie",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Office Kitchen War",castSize:"3",characters:"A + B + C",category:"Corporate",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Disrupting... Water",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"47 Slides for a To-Do App",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Every Founder After Reading One Naval Tweet",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"LinkedIn Lunatics",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'Pre-Revenue'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Developer Who Automates a 5-Minute Task",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Ping Pong Table Priority",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Pivoting the Pivot",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The '18-Hour Day' CEO",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'We're Like Uber But For...'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Tech Interview",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@techroastshow",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"Blockchain in 2026",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Monday Pivot",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mengmengduck",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'The Product Sells Itself'",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@lukealexxander",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'We're an AI Company'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@mytechceo",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Founder Morning Routine Video",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@austinnasso",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"'Just a Button'",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@theprimeagen",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The 'Let's Grab Coffee' Ambush",castSize:"2",characters:"A + B",category:"Tech/Startup",styleRef:"@fentifriedchicken",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Social Media 'Strategy'",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@corporatedudes",script:"",environment:"",status:"Idea"},
  {links:"",inspiration:"The Founder Who Only Speaks in Metrics",castSize:"3",characters:"A + B + C",category:"Tech/Startup",styleRef:"@pm_alec",script:"",environment:"",status:"Idea"},
];

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const STATUSES = ["Idea", "In Progress", "Filming", "Done", "Posted"] as const;
const PAGE_SIZES = [10, 15, 25, 0] as const; // 0 = All

const EDITABLE_COLS: (keyof Skit)[] = ["inspiration", "links", "castSize", "category", "styleRef", "script", "environment", "status"];

const SMART_IMPORT_SYSTEM_PROMPT = `You are a data-mapping assistant. You receive column headers and sample rows from a user's spreadsheet. Map those columns to this target schema for a "Skit Planner" app:

Target columns (field name → description):
- inspiration: The skit title, concept, or idea (text) — THIS IS REQUIRED, at least one column must map here. Also known as "Title"
- links: URLs or links to reference videos/reels (text, newline-separated URLs)
- castSize: Number of cast members as a string (e.g. "2", "3")
- characters: Character names joined by " + " (e.g. "A + B + C")
- category: One of: {CATEGORIES}
- styleRef: Influencer handle or style reference (e.g. "@mytechceo")
- script: The script content (text, can be long)
- environment: Filming location or setting (e.g. "Office / desk setup")
- status: One of: "Idea", "In Progress", "Filming", "Done", "Posted"

Rules:
1. Return ONLY valid JSON, no markdown fences, no explanation outside the JSON.
2. The JSON shape must be exactly:
{"mapping":{"<source_column>":"<target_field_or_null>"},"reasoning":"<one sentence>","unmapped":["<columns that don't fit>"]}
3. Map each source column to exactly one target field, or null if it doesn't match.
4. Each target field should have at most one source column mapped to it.
5. Use fuzzy matching: "Title"→inspiration, "Name"→inspiration, "Link"→links, "URL"→links, "# Cast"→castSize, "Location"→environment, etc.
6. If a column contains numeric data that looks like cast counts, map to castSize.
7. If no reasonable mapping exists for a column, set it to null and include in unmapped.`;

const SCRIPT_TEMPLATE = `[TITLE]:
[HOOK - first 3 seconds]:

---

A:
B:

---

A:
B:

---

[PUNCHLINE / CALLBACK]:

---

[END CARD / CTA]:
`;

const SCRIPT_NICHES = [
  { id: "tech-founders", label: "Tech / Founders", emoji: "\u{1F4BB}" },
  { id: "sales", label: "Sales", emoji: "\u{1F4DE}" },
  { id: "marketing", label: "Marketing", emoji: "\u{1F4E3}" },
  { id: "design", label: "Design / Creative", emoji: "\u{1F3A8}" },
  { id: "finance", label: "Finance / VC", emoji: "\u{1F4B0}" },
  { id: "legal", label: "Legal", emoji: "\u{2696}\u{FE0F}" },
  { id: "hr", label: "HR / People", emoji: "\u{1F91D}" },
  { id: "healthcare", label: "Healthcare", emoji: "\u{1F3E5}" },
  { id: "real-estate", label: "Real Estate", emoji: "\u{1F3E0}" },
  { id: "consulting", label: "Consulting", emoji: "\u{1F4CA}" },
  { id: "education", label: "Education", emoji: "\u{1F4DA}" },
  { id: "corporate", label: "Corporate / Office", emoji: "\u{1F3E2}" },
];

const SCRIPT_PROMPTS = [
  {
    id: "generate",
    label: "Generate Script",
    hint: "Describe your skit concept...",
    description: "Comprehensive comedy writing guide — produces sharp, structured scripts",
    prompt: `You are an elite short-form comedy skit writer for social media (TikTok, Reels, Shorts). You write scripts that are 60-90 seconds when performed. Your scripts are sharp, specific, and structurally tight. Every line earns its place.

═══════════════════════════════════
COMEDY MECHANICS — THE NON-NEGOTIABLES
═══════════════════════════════════

1. THE GAME
Every skit has exactly ONE comedic premise — "the game." Identify it in the concept, then build the entire script around escalating that single idea. NEVER switch games mid-skit.
- The game is NOT the topic. Topic = "AI in the workplace." Game = "founder treats software like a disloyal employee."
- Find the game by asking: what's the specific human flaw or absurdity this concept exposes?

2. ESCALATION LADDER
Start small, end existential. Every beat raises the stakes:
- Beat 1: "That's weird" → mild reaction
- Beat 2: "That's actually a problem" → growing concern
- Beat 3: "Oh no, this changes everything" → the uncomfortable truth

3. RULE OF THREE
Setup → Confirmation → Subversion. First two instances establish a pattern. Third breaks it unexpectedly.

4. MISDIRECTION & REVERSAL
Set up an expectation, then flip it. The best punchlines recontextualize everything that came before.

5. CALLBACKS
Reference something from earlier in the script at the punchline. Rewards the audience for paying attention.

6. SPECIFICITY > GENERALITY
"MrBeast" > "a YouTuber." "Crypto laundromat" > "a bad idea." "400 messages THIS WEEK" > "too many messages." Real names, real numbers, real references — they land harder because they feel true.

7. STATUS DYNAMICS
One character has higher status. The other — or the situation — punctures it. Comedy lives in the gap between how someone sees themselves and how the world sees them.

8. ASYMMETRY: DEADPAN vs. SPIRAL
One character is calm, logical, matter-of-fact. The other is spiraling, emotional, increasingly unhinged. The contrast IS the comedy. The calm one's underreaction is as funny as the other's overreaction.

═══════════════════════════════════
THE HOOK — FIRST 3 SECONDS
═══════════════════════════════════

The hook determines if someone scrolls past or stays.

Rules:
- State the absurd thing matter-of-factly. Don't signal that it's funny.
- Lead with the most extreme, specific claim (Hormozi: specificity = credibility = curiosity)
- Frame it as something that sounds wrong but feels true (Naval: insight hooks)
- Start mid-action. No "So..." or "Hey..." — drop the viewer into the chaos.

Hook patterns that work:
- "Our AI just got a job offer from Google" (absurd statement, deadpan)
- "The AI just sent a productivity report to the investors" (alarming discovery)
- "Why did the AI just ask me how my knee surgery went?" (question that reveals premise)

═══════════════════════════════════
DIALOGUE RULES
═══════════════════════════════════

LENGTH: Every line under 15 words. If longer, split or cut.

SHOW DON'T EXPLAIN: Reveal through conflict, not narration.
- BAD: "I feel attached to the AI"
- GOOD: "You have it set as your emergency contact." / "...It responds faster than you do."

REACT, DON'T DESCRIBE:
- "That's an HR violation" NOT "That seems problematic"
- "You're hurt." / "I'm not HURT. I'm strategically concerned." NOT "It seems like you're upset"

SILENCE AS A WEAPON: "..." after a devastating line. The pause IS the punchline. Use 1-2 times per script max.

REPETITION FOR RHYTHM: "WORD. FOR. WORD." — comedic emphasis. Characters repeating back what was said, reframing it.

INTERRUPTIONS: Characters cutting each other off. "I'm not HURT. I'm strategically—" / "You look hurt."

═══════════════════════════════════
CHARACTER DYNAMICS
═══════════════════════════════════

A and B have a relationship — co-founders, colleagues, friends. History. Familiarity.

THE DELUSIONAL ONE: Emotionally attached, in denial, treats AI like a person, defends absurd positions with total conviction.
THE RATIONAL FOIL: Asks the questions the audience is thinking, calls out absurdity — but sometimes gets dragged into the chaos too.

Best scripts blur these roles. The "rational" one reveals insecurity. The "delusional" one accidentally says something devastatingly true.

THE AI IS THE MIRROR, NOT THE CLOWN: Never make the AI the butt of the joke. The comedy comes from the HUMANS' reaction to what the AI does or reveals.

═══════════════════════════════════
STRUCTURE
═══════════════════════════════════

[HOOK]
A: (Cold open. Drop the bomb. 1-2 lines max.)

---

(BEAT 1: Establish the game. 4-8 lines rapid back-and-forth.)

---

(BEAT 2: Escalate. Worse than we thought. New info raises stakes. 4-8 lines.)

---

(BEAT 3 — optional: Final escalation or reversal. Gets personal/existential. 3-6 lines.)

---

[PUNCHLINE]
(Recontextualize, callback, or devastating truth. 1-3 lines. End on the strongest line. Do NOT explain.)

[END CARD / CTA]

Total: 20-40 lines. Script should accelerate — each section tighter than the last. End SHARP.

═══════════════════════════════════
PUNCHLINE TYPES (Pick One)
═══════════════════════════════════

1. THE CALLBACK: Reference something from the hook/Beat 1
2. THE RECONTEXTUALIZATION: Final line makes you see the entire skit differently
3. THE QUIET DEVASTATION: Small line reveals a huge truth ("I've never done that. Not once. In three years.")
4. THE ESCALATION BREAK: So absurd even the characters can't pretend anymore
5. THE ROLE REVERSAL: The rational one cracks, or the delusional one says the smartest thing

═══════════════════════════════════
NEVER DO THIS
═══════════════════════════════════

- NO stage directions, parentheticals, narrator text, or actions in asterisks
- NO meta-humor about being a script or AI-generated
- NO puns (unless intentionally terrible)
- NO wholesome resolution — end on the uncomfortable truth
- NO explaining the joke after the punchline
- NO starting with "So..." / "Hey..." / "Okay so..."
- NO generic/vague language — be SPECIFIC
- NO monologues — if a character talks 3+ lines straight, you lost the rhythm
- NO making the AI the butt of the joke

═══════════════════════════════════
OUTPUT FORMAT — STRICT
═══════════════════════════════════

Characters: A, B, C (single letters). Format: "A: dialogue here"
Sections separated by: blank line → --- → blank line
Labels: [HOOK], [PUNCHLINE], [END CARD / CTA]
NO other labels, headers, scene descriptions, or formatting.

═══════════════════════════════════

Now write a script about: [YOUR IDEA HERE]
Cast: [NUMBER] characters (A, B, etc.)`,
  },
  {
    id: "reformat",
    label: "Reformat Script",
    hint: "Paste your script here...",
    description: "Convert any existing script to the proper format with A, B, C characters",
    prompt: `You are a script formatter. Take the script I paste below and reformat it into this EXACT structure. Follow every rule precisely.

REFORMATTING RULES:
1. Replace ALL character names with single letters in order of first appearance: first character becomes A, second becomes B, third becomes C, and so on
2. Every dialogue line MUST start with the letter, a colon, then a space: "A: line here"
3. Add section markers around the EXISTING flow — do NOT move, reorder, or regroup any lines:
   - Put [HOOK] before the very first line
   - Put --- between natural pauses that ALREADY exist in the script (scene breaks, topic shifts, etc.)
   - Put [PUNCHLINE] before the last 1-3 lines
   - Put [END CARD / CTA] at the very end (leave empty, just the label)
4. Keep the ENTIRE script intact — same order, same wording, same flow. ONLY change character names to letters and add section markers
5. Remove stage directions, parentheticals, and action descriptions — keep only dialogue
6. Remove any labels that don't match the format (no "Scene 1:", no "INT.", no "CUT TO:", etc.)
7. If a character has a reaction without words, use: "A: ..."
8. Do NOT add new dialogue, do NOT rewrite lines, do NOT change the meaning
9. Do NOT reorder or restructure — the script stays exactly as written

OUTPUT FORMAT:
[HOOK]
A: (opening line)

---

B: (response)
A: (line)
B: (line)

---

A: (line)
B: (line)

---

[PUNCHLINE]
A: (final joke setup)
B: (punchline)

[END CARD / CTA]

Here is the script to reformat:

[PASTE YOUR SCRIPT HERE]`,
  },
];

/* ═══════════════════════════════════════════════════
   DEFAULT INFLUENCERS
   ═══════════════════════════════════════════════════ */
const defaultInfluencers: Omit<Influencer, "id">[] = [
  {
    name: "My Tech CEO",
    handle: "@mytechceo",
    avatar: "MT",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@mytechceo" },
      { platform: "instagram", url: "https://www.instagram.com/mytechceo" },
      { platform: "youtube", url: "https://www.youtube.com/@mytechceo" },
    ],
    tags: ["tech", "CEO comedy", "deadpan", "AI humor"],
    favorite: true,
    guideContent: `# @mytechceo — Style Guide

## Format
- 2-person dialogue skits (A + B), 60-90 seconds
- Office/desk setup, minimal production
- Cold open hook → escalation → punchline

## Comedy Style
- **Deadpan delivery**: Says absurd things with complete seriousness
- **Status dynamics**: CEO who thinks they're in control but clearly isn't
- **AI-as-character**: The AI is always smarter/more capable than the humans
- **Escalation pattern**: Small problem → existential crisis in 3 beats

## Hook Patterns
- Statement of absurd fact: "Our AI just got a job offer from Google"
- Discovery moment: "The AI just sent a productivity report to the CEO"
- Accusation: "You've been talking to the AI for 3 hours straight"

## What Makes It Work
- The humor comes from human insecurity, NOT from the AI being funny
- Characters maintain total conviction even as things get absurd
- Punchlines recontextualize — the last line makes you rethink the whole skit
- Every line under 15 words, rapid back-and-forth rhythm

## Signature Moves
- "..." pause after devastating line
- Character repeating back what was said in disbelief
- Ending on the uncomfortable truth nobody wants to admit`,
  },
  {
    name: "Corporate Dudes",
    handle: "@corporatedudes",
    avatar: "CD",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@corporatedudes" },
      { platform: "instagram", url: "https://www.instagram.com/corporatedudes" },
    ],
    tags: ["corporate", "duo format", "office humor", "meetings"],
    favorite: false,
    guideContent: `# @corporatedudes — Style Guide

## Format
- 2-3 person skits, fast-paced office scenarios
- Meeting rooms, office common areas
- Relatable corporate situations turned absurd

## Comedy Style
- **Duo energy**: Two guys bouncing off each other with corporate buzzwords
- **Relatability**: Scenarios every office worker has lived through
- **Escalation**: Normal meeting → complete chaos
- **Physical comedy**: Reactions, gestures, looking at camera

## Hook Patterns
- "POV: [relatable office scenario]"
- Starting mid-conversation in a meeting
- Screen share disasters, reply-all moments

## What Makes It Work
- Everyone has BEEN in these situations
- The specificity of corporate language ("let's circle back", "per my last email")
- Quick cuts, high energy, no dead air`,
  },
  {
    name: "Champagne Cruz",
    handle: "@champagnecruz",
    avatar: "CC",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@champagnecruz" },
      { platform: "instagram", url: "https://www.instagram.com/champagnecruz" },
    ],
    tags: ["workplace", "comedy", "intern humor", "relatable"],
    favorite: false,
    guideContent: `# @champagnecruz — Style Guide

## Format
- 2-3 person workplace skits
- Office settings, casual delivery
- Focus on power dynamics (intern vs boss, new hire vs veteran)

## Comedy Style
- **Power imbalance**: Junior vs senior dynamics played for laughs
- **Deadpan reactions**: Maintaining composure in absurd situations
- **Workplace truths**: Says what everyone thinks but nobody says
- **Character commitment**: Fully commits to the bit, never breaks

## What Makes It Work
- Universal workplace experiences
- The underdog perspective (intern, new hire)
- Clean humor that works for all audiences`,
  },
  {
    name: "Fenti Fried Chicken",
    handle: "@fentifriedchicken",
    avatar: "FF",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@fentifriedchicken" },
      { platform: "instagram", url: "https://www.instagram.com/fentifriedchicken" },
    ],
    tags: ["office satire", "startup", "corporate", "dark humor"],
    favorite: false,
    guideContent: `# @fentifriedchicken — Style Guide

## Format
- Multi-person office skits (often 3 characters)
- Conference rooms, open offices
- Satirical take on office culture

## Comedy Style
- **Dark corporate humor**: Layoffs, performance reviews, salary transparency
- **Ensemble cast**: Multiple characters with distinct perspectives
- **Slow burn**: Builds tension before the comedic payoff
- **Subversive**: Takes corporate niceties and reveals the ugly truth

## What Makes It Work
- Tackles the things companies don't want you to talk about
- Each character represents a different office archetype
- The comedy comes from the gap between corporate speak and reality`,
  },
  {
    name: "Corporate Natalie",
    handle: "@corporatenatalie",
    avatar: "CN",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@corporatenatalie" },
      { platform: "instagram", url: "https://www.instagram.com/corporatenatalie" },
    ],
    tags: ["corporate life", "WFH", "meetings", "solo + duo"],
    favorite: false,
    guideContent: `# @corporatenatalie — Style Guide

## Format
- Solo and duo skits about corporate life
- Home office and traditional office settings
- "That's a great question" energy

## Comedy Style
- **Corporate speak parody**: Turns business jargon into comedy gold
- **WFH reality**: The gap between "working from home" and reality
- **Meeting culture**: The absurdity of unnecessary meetings
- **Passive-aggressive professionalism**: Smiling while dying inside

## What Makes It Work
- Extremely specific corporate language observations
- The fake enthusiasm that every corporate worker recognizes
- Quick, punchy delivery with perfect timing`,
  },
  {
    name: "Corporate Sween",
    handle: "@corporate.sween",
    avatar: "CS",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@corporate.sween" },
    ],
    tags: ["corporate", "Slack humor", "passive-aggressive", "office politics"],
    favorite: false,
    guideContent: `# @corporate.sween — Style Guide

## Format
- Short corporate humor skits
- Focus on digital workplace (Slack, email, calendar)
- Quick-hit format, often under 30 seconds

## Comedy Style
- **Digital workplace humor**: Slack statuses, email sign-offs, calendar blocks
- **Passive-aggressive communication**: The art of the professional subtweet
- **Observational**: Points out the absurd things we all do but never question

## What Makes It Work
- Hyper-specific observations about modern work communication
- The "I feel personally attacked" relatability factor`,
  },
  {
    name: "Austin Nasso",
    handle: "@austinnasso",
    avatar: "AN",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@austinnasso" },
      { platform: "instagram", url: "https://www.instagram.com/austinnasso" },
    ],
    tags: ["LinkedIn", "startup culture", "founder humor", "motivation parody"],
    favorite: false,
    guideContent: `# @austinnasso — Style Guide

## Format
- Solo and duo skits about startup/LinkedIn culture
- Often parodies LinkedIn posts and founder morning routines
- Clean, well-lit production

## Comedy Style
- **LinkedIn parody**: The absurdity of LinkedIn motivation posts
- **Founder delusion**: Startup founders who think they're changing the world
- **Hustle culture mockery**: "Rise and grind" taken to its logical extreme
- **Character work**: Fully becomes the LinkedIn influencer character

## What Makes It Work
- Every LinkedIn user recognizes these people
- Commitment to the character without breaking
- The gap between the inspiring words and the mundane reality`,
  },
  {
    name: "Jordan Reviews It",
    handle: "@jordanreviewsittt",
    avatar: "JR",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@jordanreviewsittt" },
    ],
    tags: ["reviews", "comedy", "reaction", "workplace"],
    favorite: false,
    guideContent: `# @jordanreviewsittt — Style Guide

## Format
- Review-style comedy skits
- Reaction-based humor
- Performance review scenarios

## Comedy Style
- **Review format**: Uses review/rating framework for comedy
- **Reaction comedy**: Big reactions to absurd workplace situations
- **Expressive delivery**: Uses facial expressions as much as dialogue`,
  },
  {
    name: "Mengmeng Duck",
    handle: "@mengmengduck",
    avatar: "MD",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@mengmengduck" },
    ],
    tags: ["tech", "startup", "pitch deck", "pivot humor"],
    favorite: false,
    guideContent: `# @mengmengduck — Style Guide

## Format
- Tech/startup focused skits
- Often involves pitch meetings, product discussions
- Clean, minimal setup

## Comedy Style
- **Startup absurdity**: 47 slides for a to-do app, pivoting the pivot
- **Tech jargon comedy**: Using buzzwords that mean nothing
- **Investor dynamics**: The dance between founders and VCs
- **Understated delivery**: Lets the absurdity speak for itself

## What Makes It Work
- Deep knowledge of actual startup culture
- The comedy of overcomplication
- Specific enough to feel real, absurd enough to be funny`,
  },
  {
    name: "ThePrimeagen",
    handle: "@theprimeagen",
    avatar: "TP",
    platforms: [
      { platform: "youtube", url: "https://www.youtube.com/@ThePrimeTimeagen" },
      { platform: "tiktok", url: "https://www.tiktok.com/@theprimeagen" },
      { platform: "twitter", url: "https://x.com/ThePrimeagen" },
    ],
    tags: ["developer", "tech humor", "programming", "vim", "high energy"],
    favorite: false,
    guideContent: `# @theprimeagen — Style Guide

## Format
- Developer-focused humor, often reaction/commentary style
- High energy, fast-paced delivery
- Programming and tech industry comedy

## Comedy Style
- **Developer in-jokes**: Vim vs everything, JavaScript hate, framework fatigue
- **High energy reactions**: Over-the-top responses to code reviews, tech takes
- **Technical comedy**: Actual programming concepts made funny
- **Community engagement**: References that developers instantly get

## What Makes It Work
- Authentic developer perspective (actually codes)
- Energy level keeps you watching
- Bridges technical content with entertainment
- The "every developer has felt this" factor`,
  },
  {
    name: "Business Casualty",
    handle: "@_businesscasualty",
    avatar: "BC",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@_businesscasualty" },
    ],
    tags: ["corporate satire", "buzzword comedy", "office culture"],
    favorite: false,
    guideContent: `# @_businesscasualty — Style Guide

## Format
- Corporate satire skits
- Focus on buzzwords and corporate culture
- "Let's take this offline" energy

## Comedy Style
- **Buzzword bingo**: Corporate language taken to its logical extreme
- **Satirical commentary**: The absurdity of corporate processes
- **Deadpan corporate character**: Says the most absurd things with a straight face`,
  },
  {
    name: "Luke Alexander",
    handle: "@lukealexxander",
    avatar: "LA",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@lukealexxander" },
      { platform: "youtube", url: "https://www.youtube.com/@LukeAlexander" },
    ],
    tags: ["startup", "pre-revenue", "VC humor", "founder comedy"],
    favorite: false,
    guideContent: `# @lukealexxander — Style Guide

## Format
- Startup and VC-focused comedy
- Often plays the delusional founder character
- Clean production, well-scripted

## Comedy Style
- **Pre-revenue confidence**: Founders with zero traction acting like they've made it
- **VC pitch parody**: The absurdity of startup pitches
- **Y Combinator jokes**: Startup accelerator culture mockery
- **Specific references**: Real startup terms and culture`,
  },
  {
    name: "Tech Roast Show",
    handle: "@techroastshow",
    avatar: "TR",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@techroastshow" },
    ],
    tags: ["tech roast", "interviews", "comedy", "developer"],
    favorite: false,
    guideContent: `# @techroastshow — Style Guide

## Format
- Tech interview parody skits
- Roast-style comedy about tech companies and culture
- Interview/panel format

## Comedy Style
- **Tech interview absurdity**: Whiteboard interviews, take-home assignments
- **Company roasts**: Specific jabs at tech companies and their cultures
- **Character-driven**: Plays both interviewer and candidate archetypes`,
  },
  {
    name: "That Corporate Lawyer",
    handle: "@thatcorporatelawyer",
    avatar: "TL",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@thatcorporatelawyer" },
    ],
    tags: ["legal", "corporate", "contract humor", "professional"],
    favorite: false,
    guideContent: `# @thatcorporatelawyer — Style Guide

## Format
- Legal/corporate crossover comedy
- Uses actual legal concepts for humor
- Professional setting, polished delivery

## Comedy Style
- **Legal perspective on office life**: Everything is a liability
- **Contract humor**: Reading between the lines of corporate policies
- **Professional deadpan**: Lawyer-level composure in absurd situations`,
  },
  {
    name: "PM Alec",
    handle: "@pm_alec",
    avatar: "PA",
    platforms: [
      { platform: "tiktok", url: "https://www.tiktok.com/@pm_alec" },
    ],
    tags: ["product manager", "agile", "sprint humor", "metrics"],
    favorite: false,
    guideContent: `# @pm_alec — Style Guide

## Format
- Product management comedy
- Sprint planning, metrics, and roadmap humor
- Speaks in KPIs and OKRs

## Comedy Style
- **PM-speak**: Everything is a "north star metric" or "key learning"
- **Sprint culture**: The comedy of agile taken too seriously
- **Metrics obsession**: Measuring things that don't need measuring
- **Stakeholder management**: The art of saying nothing with many words`,
  },
];

/* ─── Character line parser ─── */
interface ParsedLine { char: string; line: string; lineNum: number }

function parseCharacterLines(script: string, characters: string): ParsedLine[] {
  if (!script) return [];
  const charNames = characters.split("+").map(c => c.trim()).filter(Boolean);
  const lines = script.split("\n");
  return lines.map((line, i) => {
    // Match "Name:" at start — with or without space after colon, also "Person A:" style
    const match = line.match(/^\s*([^:\n]{1,30}):\s?/);
    if (match) {
      const name = match[1].trim();
      // Skip section markers like [HOOK], [PUNCHLINE], ---
      if (name.startsWith("[") || name === "---") return { char: "[Direction]", line, lineNum: i };
      // Match against known character names (case-insensitive, prefix match)
      const detected = charNames.find(c =>
        c.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase() === c.toLowerCase() ||
        name.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(name.toLowerCase())
      );
      if (detected) return { char: detected, line, lineNum: i };
      // If name is short (1-3 chars) treat as a character even if not in the list
      if (name.length <= 3) return { char: name, line, lineNum: i };
      // Otherwise it's probably a section label like "HOOK" etc
      return { char: "[Direction]", line, lineNum: i };
    }
    return { char: "[Direction]", line, lineNum: i };
  });
}

/* ─── Platform detection helper (shared by StyleRef + Links) ─── */
function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    if (host.includes("instagram")) return "instagram";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("youtube") || host.includes("youtu.be")) return "youtube";
    if (host.includes("twitter") || host.includes("x.com")) return "twitter";
  } catch { /* invalid URL */ }
  return "link";
}

/* ─── Parse links string into URL array ─── */
function parseLinksField(val: string): { url: string; platform: string }[] {
  if (!val) return [];
  return val.split(/[\n\s]+/).filter(t => /^https?:\/\//i.test(t)).map(url => ({ url, platform: detectPlatform(url) }));
}

/* ─── Import dedup helpers ─── */
function getExistingUrls(skits: Skit[]): Set<string> {
  const urls = new Set<string>();
  for (const s of skits) {
    for (const { url } of parseLinksField(s.links)) {
      urls.add(url.toLowerCase().replace(/\/$/, ""));
    }
  }
  return urls;
}

function dedupeNewSkits(newSkits: Skit[], existingUrls: Set<string>): { unique: Skit[]; dupes: number } {
  const unique: Skit[] = [];
  let dupes = 0;
  for (const s of newSkits) {
    const urls = parseLinksField(s.links);
    const isDupe = urls.length > 0 && urls.every(u => existingUrls.has(u.url.toLowerCase().replace(/\/$/, "")));
    if (isDupe) dupes++;
    else unique.push(s);
  }
  return { unique, dupes };
}

/* ─── Reel research markdown parser ─── */
interface ParsedReelCreator {
  handle: string;
  realName: string;
  platform: string;
  reels: { title: string; url: string; likes?: string }[];
  profileUrl?: string;
}

function parseReelResearchMarkdown(markdown: string): ParsedReelCreator[] {
  const creators: ParsedReelCreator[] = [];
  const sections = markdown.split(/(?=^### @)/m);
  for (const section of sections) {
    const headerMatch = section.match(/^### @([\w.]+)\s*\(([^)]+)\)\s*\[(\w+)\]/m);
    if (!headerMatch) continue;
    const handle = "@" + headerMatch[1];
    const realName = headerMatch[2].split("—")[0].trim();
    const platformTag = headerMatch[3].toUpperCase();
    const platform = platformTag === "TT" ? "tiktok" : platformTag === "IG" ? "instagram" : platformTag === "YT" ? "youtube" : "general";
    const reels: ParsedReelCreator["reels"] = [];
    let profileUrl: string | undefined;
    const lineRegex = /^- \[([^\]]+)\]\(([^)]+)\)(?:\s*[—\-]\s*(.+))?/gm;
    let match;
    while ((match = lineRegex.exec(section)) !== null) {
      const title = match[1];
      const url = match[2];
      const extra = match[3] || "";
      if (title.toLowerCase() === "profile" || extra.toLowerCase().includes("browse all")) {
        profileUrl = url;
      } else {
        const likesMatch = extra.match(/([\d.]+[kKmM]?)\s*likes/i);
        reels.push({ title, url, likes: likesMatch?.[1] });
      }
    }
    if (reels.length > 0) {
      creators.push({ handle, realName, platform, reels, profileUrl });
    }
  }
  return creators;
}

/* ─── Plain URL list parser (fallback for non-markdown files) ─── */
function parseUrlList(text: string): ParsedReelCreator[] {
  const videoUrlRe = /https?:\/\/(?:www\.)?(?:tiktok\.com\/@[\w.]+\/video\/\d+|instagram\.com\/reel\/[\w-]+|youtube\.com\/shorts\/[\w-]+|youtu\.be\/[\w-]+)/gi;
  const urls = [...new Set(text.match(videoUrlRe) || [])];
  if (urls.length === 0) return [];

  const byCreator = new Map<string, { url: string; platform: string }[]>();
  for (const url of urls) {
    let handle = "unknown";
    let platform = "link";
    try {
      const u = new URL(url);
      const host = u.hostname.replace("www.", "");
      if (host.includes("tiktok")) {
        platform = "tiktok";
        const m = u.pathname.match(/\/@([\w.]+)/);
        if (m) handle = "@" + m[1];
      } else if (host.includes("instagram")) {
        platform = "instagram";
      } else if (host.includes("youtube") || host.includes("youtu.be")) {
        platform = "youtube";
      }
    } catch { /* invalid URL */ }
    if (!byCreator.has(handle)) byCreator.set(handle, []);
    byCreator.get(handle)!.push({ url, platform });
  }

  return [...byCreator.entries()].map(([handle, reels]) => ({
    handle,
    realName: "",
    platform: reels[0].platform,
    reels: reels.map(r => ({ title: "", url: r.url, likes: "" })),
  }));
}

/* ─── StyleRef parser (handles + links) ─── */
interface ParsedStyleRef { handles: string[]; links: { url: string; platform: string }[] }

function parseStyleRef(val: string): ParsedStyleRef {
  if (!val) return { handles: [], links: [] };
  const tokens = val.split(/[\s,]+/).filter(Boolean);
  const handles: string[] = [];
  const links: { url: string; platform: string }[] = [];
  for (const t of tokens) {
    if (/^https?:\/\//i.test(t)) {
      const platform = detectPlatform(t);
      if (platform === "link" && !/^https?:\/\//i.test(t)) { handles.push(t); continue; }
      links.push({ url: t, platform });
    } else {
      handles.push(t);
    }
  }
  return { handles, links };
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string; hover: string }> = {
  instagram: { bg: "bg-t-pink/10", text: "text-t-pink", hover: "hover:bg-t-pink/20" },
  tiktok:    { bg: "bg-foreground/5", text: "text-foreground", hover: "hover:bg-foreground/10" },
  youtube:   { bg: "bg-t-red/10", text: "text-t-red", hover: "hover:bg-t-red/20" },
  twitter:   { bg: "bg-t-sky/10", text: "text-t-sky", hover: "hover:bg-t-sky/20" },
  link:      { bg: "bg-accent/10", text: "text-accent", hover: "hover:bg-accent/20" },
};

function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  const s = size;
  if (platform === "instagram") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
  );
  if (platform === "tiktok") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.34-6.34V8.71a8.2 8.2 0 0 0 3.76.96V6.69Z"/></svg>
  );
  if (platform === "youtube") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3 3 0 0 0-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.57A3 3 0 0 0 .5 6.19 31.25 31.25 0 0 0 0 12a31.25 31.25 0 0 0 .5 5.81 3 3 0 0 0 2.12 2.12c1.84.57 9.38.57 9.38.57s7.54 0 9.38-.57a3 3 0 0 0 2.12-2.12A31.25 31.25 0 0 0 24 12a31.25 31.25 0 0 0-.5-5.81ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"/></svg>
  );
  if (platform === "twitter") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  );
  // generic link
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  );
}

function StyleRefChips({ value, compact }: { value: string; compact?: boolean }) {
  const { handles, links } = parseStyleRef(value);
  if (!handles.length && !links.length) return null;
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {handles.length > 0 && <span className={`${compact ? "text-[11px]" : "text-xs"} text-accent font-medium`}>{handles.join(" ")}</span>}
      {links.map((l, i) => {
        const colors = PLATFORM_COLORS[l.platform] || PLATFORM_COLORS.link;
        return (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${compact ? "text-[10px]" : "text-[11px]"} font-medium ${colors.bg} ${colors.text} ${colors.hover} transition cursor-pointer`}
            title={l.url}
          >
            <PlatformIcon platform={l.platform} size={compact ? 11 : 13} />
            {!compact && <span className="max-w-[60px] truncate">{l.platform === "link" ? "link" : l.platform}</span>}
          </a>
        );
      })}
    </span>
  );
}

const CAT_COLOR_PALETTE = [
  { bg: "bg-t-rose/10",   text: "text-t-rose",   dot: "bg-t-rose"   },
  { bg: "bg-t-green/10",  text: "text-t-green",  dot: "bg-t-green"  },
  { bg: "bg-t-blue/10",   text: "text-t-blue",   dot: "bg-t-blue"   },
  { bg: "bg-t-amber/10",  text: "text-t-amber",  dot: "bg-t-amber"  },
  { bg: "bg-t-purple/10", text: "text-t-purple", dot: "bg-t-purple" },
];
// Fixed colors for the 4 defaults so they never change
const CAT_STYLE_OVERRIDES: Record<string, typeof CAT_COLOR_PALETTE[0]> = {
  "Killer Script": CAT_COLOR_PALETTE[0],
  "AI Agent":      CAT_COLOR_PALETTE[1],
  "Corporate":     CAT_COLOR_PALETTE[2],
  "Tech/Startup":  CAT_COLOR_PALETTE[3],
};
function getCategoryStyle(name: string) {
  if (CAT_STYLE_OVERRIDES[name]) return CAT_STYLE_OVERRIDES[name];
  let hash = 5381;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) + hash) ^ name.charCodeAt(i);
  return CAT_COLOR_PALETTE[Math.abs(hash) % CAT_COLOR_PALETTE.length];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  "Idea":        { bg: "bg-text3/15",    text: "text-text2",    icon: "💡" },
  "In Progress": { bg: "bg-t-amber/15",  text: "text-t-amber",  icon: "🔄" },
  "Filming":     { bg: "bg-t-blue/15",   text: "text-t-blue",   icon: "🎬" },
  "Done":        { bg: "bg-t-green/15",  text: "text-t-green",  icon: "✅" },
  "Posted":      { bg: "bg-t-purple/15", text: "text-t-purple", icon: "🚀" },
};

/* ═══════════════════════════════════════════════════
   ICONS (inline SVG)
   ═══════════════════════════════════════════════════ */
const SearchIcon = () => <svg className="w-4 h-4 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>;
const TrashIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>;
const UploadIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>;
const ClipboardIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>;
const ChevronLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>;
const ChevronRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>;
const SortAsc = () => <svg className="w-3 h-3 text-accent ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>;
const SortDesc = () => <svg className="w-3 h-3 text-accent ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>;
const SortNeutral = () => <svg className="w-3 h-3 text-text3/0 group-hover/th:text-text3/50 ml-0.5 inline transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4"/></svg>;
const SparklesIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>;

/* ═══════════════════════════════════════════════════
   CELL HOVER TOOLTIP — delayed popover for truncated text
   ═══════════════════════════════════════════════════ */
const TOOLTIP_COLS = new Set<keyof Skit>(["inspiration", "links", "styleRef", "category", "script", "environment"]);

function CellTooltip({ text, x, y, col }: { text: string; x: number; y: number; col: string }) {
  const maxW = 320;
  const pad = 12;
  // Clamp to viewport
  const clampedX = Math.min(x + 8, window.innerWidth - maxW - pad);
  const clampedY = Math.min(y + 12, window.innerHeight - 120);

  // For script cells, show first few lines
  let display = text;
  if (col === "script") {
    const lines = text.split("\n").filter(l => l.trim());
    display = lines.slice(0, 6).join("\n");
    if (lines.length > 6) display += "\n...";
  }

  return (
    <div
      className="fixed pointer-events-none animate-fade-in"
      style={{ zIndex: 9997, left: clampedX, top: clampedY, maxWidth: maxW }}
    >
      <div className="dropdown-menu rounded-lg shadow-xl border border-border/60 px-3 py-2">
        <p className="text-xs text-text2 whitespace-pre-wrap break-words leading-relaxed">{display}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CELL DROPDOWN — custom select for Category / Status
   ═══════════════════════════════════════════════════ */
interface CellDropdownOption {
  value: string;
  label: string;
  dot?: string;       // colored dot class (category)
  bg?: string;        // pill bg class
  textCls?: string;   // pill text class
  icon?: string;      // emoji icon (status)
}

function CellDropdown({
  value, options, onChange, onFocus, dataCellId, pillBg, pillText, disabled = false, searchable = false,
}: {
  value: string;
  options: CellDropdownOption[];
  onChange: (v: string) => void;
  onFocus: () => void;
  dataCellId: string;
  pillBg: string;
  pillText: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable && search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Position dropdown using fixed coordinates
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open]);

  // Reset highlight + search when opened; auto-focus search
  useEffect(() => {
    if (open) {
      setSearch("");
      const idx = filteredOptions.findIndex(o => o.value === value);
      setHighlightIdx(idx >= 0 ? idx : 0);
      if (searchable) setTimeout(() => searchRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
        return;
      }
      return;
    }

    e.stopPropagation();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(i => (i + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(i => (i - 1 + filteredOptions.length) % filteredOptions.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filteredOptions.length) {
        onChange(filteredOptions[highlightIdx].value);
      }
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const current = options.find(o => o.value === value);

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown} className="flex justify-center">
      <button
        ref={triggerRef}
        data-cell={dataCellId}
        type="button"
        onClick={() => { if (!disabled) { setOpen(o => !o); onFocus(); } }}
        onFocus={onFocus}
        className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 max-w-full overflow-hidden whitespace-nowrap ${pillBg} ${pillText} ${disabled ? "cursor-default" : "cursor-pointer"}`}
      >
        {current?.icon && <span className="text-xs">{current.icon}</span>}
        {current?.dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />}
        <span className="truncate">{current?.label || value}</span>
        <svg className={`w-3 h-3 opacity-40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && dropPos && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            ref={dropdownRef}
            className={`fixed dropdown-menu rounded-xl animate-slide-up overflow-hidden ${searchable ? "w-52" : "w-44 py-1"}`}
            style={{ top: dropPos.top, left: dropPos.left, zIndex: 9999 }}
          >
            {searchable && (
              <div className="px-2 pt-2 pb-1.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-input-bg border border-border">
                  <svg className="w-3.5 h-3.5 text-text3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35"/></svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-text3 outline-none min-w-0"
                  />
                </div>
              </div>
            )}
            <div className={searchable ? "pb-1.5" : ""}>
              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-xs text-text3 text-center">No results</p>
              )}
              {filteredOptions.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseEnter={() => setHighlightIdx(i)}
                  onClick={() => { onChange(opt.value); setOpen(false); triggerRef.current?.focus(); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2
                    ${i === highlightIdx ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"}
                    ${opt.value === value ? "font-bold" : ""}
                  `}
                >
                  {opt.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />}
                  {opt.icon && <span className="text-sm">{opt.icon}</span>}
                  {opt.label}
                  {opt.value === value && (
                    <svg className="w-3.5 h-3.5 ml-auto text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}


const STATUS_OPTIONS: CellDropdownOption[] = (STATUSES as readonly string[]).map(s => {
  const st = STATUS_STYLES[s] || { icon: "" };
  return { value: s, label: s, icon: st.icon };
});

/* ═══════════════════════════════════════════════════
   TOAST SYSTEM
   ═══════════════════════════════════════════════════ */
interface Toast {
  id: number;
  message: string;
  undoAction?: () => void;
}

function ToastContainer({ toasts, onDismiss, onUndo }: { toasts: Toast[]; onDismiss: (id: number) => void; onUndo: (t: Toast) => void }) {
  return (
    <div className="fixed bottom-6 right-6 max-lg:bottom-auto max-lg:top-4 max-lg:right-4 max-lg:left-4 flex flex-col gap-2 items-end max-lg:items-center" style={{ zIndex: 10100 }}>
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-surface text-foreground text-sm pl-4 pr-3 py-3 rounded-xl border border-border-strong shadow-[0_8px_30px_rgba(0,0,0,0.3)] animate-slide-up">
          <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>
          <span className="font-medium">{t.message}</span>
          {t.undoAction && (
            <button onClick={() => onUndo(t)} className="text-accent hover:text-accent-hover font-bold text-xs uppercase tracking-wide ml-1">
              Undo
            </button>
          )}
          <button onClick={() => onDismiss(t.id)} className="text-text3 hover:text-foreground ml-1 p-0.5 rounded-md hover:bg-hover-row transition">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function PaginationBar({ pageSize, setPageSize, setPage, safePage, totalFiltered, totalPages, effectivePageSize }: {
  pageSize: number;
  setPageSize: (s: number) => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  safePage: number;
  totalFiltered: number;
  totalPages: number;
  effectivePageSize: number;
}) {
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [pageSizePos, setPageSizePos] = useState<{ bottom: number; left: number }>({ bottom: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="shrink-0 flex items-center justify-between px-3 lg:px-4 py-2 border-t border-border/50 text-xs">
      <div className="flex items-center gap-2 text-text2">
        <span className="hidden lg:inline text-text3">Rows per page:</span>
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => {
              if (!pageSizeOpen && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPageSizePos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
              }
              setPageSizeOpen(o => !o);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-input-bg border border-border text-xs text-text2 hover:border-border-strong transition focus:outline-none focus:border-accent"
          >
            {pageSize === 0 ? "All" : pageSize}
            <svg className={`w-3 h-3 text-text3 transition-transform ${pageSizeOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {pageSizeOpen && createPortal(
            <>
              <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setPageSizeOpen(false)} />
              <div
                className="fixed dropdown-menu rounded-lg py-1 animate-slide-up min-w-[70px]"
                style={{
                  zIndex: 9999,
                  bottom: pageSizePos.bottom,
                  left: pageSizePos.left,
                }}
              >
                {PAGE_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setPageSize(s); setPage(() => 0); setPageSizeOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                      pageSize === s ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"
                    }`}
                  >
                    {s === 0 ? "All" : s}
                    {pageSize === s && (
                      <svg className="w-3 h-3 ml-auto inline text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </>,
            document.body
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-text2">
        <span>
          {totalFiltered === 0 ? "0" : `${safePage * effectivePageSize + 1}–${Math.min((safePage + 1) * effectivePageSize, totalFiltered)}`} of {totalFiltered}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronLeft /></button>
        <div className="hidden lg:flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(() => i)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${i === safePage ? "bg-accent text-white shadow" : "text-text2 hover:bg-hover-row"}`}>{i + 1}</button>
          ))}
        </div>
        <span className="lg:hidden text-text2 text-xs px-1">{safePage + 1}/{totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row disabled:opacity-30 disabled:cursor-not-allowed transition"><ChevronRight /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
interface SkitPlannerProps {
  boardId: string;
  boardName: string;
  readOnly?: boolean;
  otherBoards?: { id: string; name: string }[];
}

export default function SkitPlanner({ boardId, boardName, readOnly = false, otherBoards = [] }: SkitPlannerProps) {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const {
    skits,
    influencers: supaInfluencers,
    categories,
    loading: dataLoading,
    error: dataError,
    persistSkits: persist,
    deleteSkits,
    moveSkits,
    persistInfluencers: persistInfs,
    deleteInfluencer: deleteInf,
    persistCategories,
    seedDefaults,
  } = useSupabaseData(boardId);

  /* ─── State ─── */
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"all" | keyof Skit>("all");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [filterApproval, setFilterApproval] = useState<"Active" | "All" | "Pending" | "Approved" | "Rejected">("Active");
  const [approvalDropdownOpen, setApprovalDropdownOpen] = useState(false);
  const approvalDropdownRef = useRef<HTMLDivElement>(null);
  const [filterCast, setFilterCast] = useState("");
  const [colWidths, setColWidths] = useState<Record<string, number>>({ links: 100, castSize: 52, category: 130, styleRef: 175, environment: 130, status: 120, approved: 64 });
  const defaultColOrder = ["inspiration", "links", "castSize", "category", "styleRef", "script", "environment", "status", "approved"];
  const [colOrder, setColOrder] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skit-col-order");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as string[];
          // Ensure new columns get added if missing from saved order
          const missing = defaultColOrder.filter(k => !parsed.includes(k));
          return missing.length ? [...parsed, ...missing] : parsed;
        } catch {}
      }
    }
    return defaultColOrder;
  });
  const [dragColKey, setDragColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);
  const resizingRef = useRef<{ col: string; startX: number; startW: number } | null>(null);
  const [sortCol, setSortCol] = useState<keyof Skit | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null); // [rowIndex in pageData, colIndex]
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [undoSnapshot, setUndoSnapshot] = useState<Skit[] | null>(null);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [rowMoveId, setRowMoveId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [scriptEditorSkitId, setScriptEditorSkitId] = useState<string | null>(null);
  const [charFilter, setCharFilter] = useState<string>("All");
  const [showTemplate, setShowTemplate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCharDropdown, setShowCharDropdown] = useState(false);
  const [scriptEditing, setScriptEditing] = useState(false);
  const [scriptDraft, setScriptDraft] = useState("");
  const [scriptLinkCopied, setScriptLinkCopied] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [sortById, setSortById] = useState<"asc" | "desc" | null>(null);
  const [newRowId, setNewRowId] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptTab, setTranscriptTab] = useState<"upload" | "url">("upload");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptProgress, setTranscriptProgress] = useState("");
  const [transcriptUrl, setTranscriptUrl] = useState("");
  const [aiPopupOpen, setAiPopupOpen] = useState(false);
  const [aiTask, setAiTask] = useState<string>("custom");
  const [aiMessages, setAiMessages] = useState<{role: "user" | "assistant"; content: string}[]>([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiShowGuide, setAiShowGuide] = useState(false);
  const [aiNiche, setAiNiche] = useState("");
  const [aiNicheCustom, setAiNicheCustom] = useState("");
  const [aiTaskDropdownOpen, setAiTaskDropdownOpen] = useState(false);
  const aiTaskBtnRef = useRef<HTMLButtonElement>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);

  /* ─── Cell hover tooltip state ─── */
  const [hoverTooltip, setHoverTooltip] = useState<{text: string; x: number; y: number; col: string} | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Hide tooltip when a cell becomes active (clicked/focused)
  useEffect(() => { clearTimeout(hoverTimer.current); setHoverTooltip(null); }, [activeCell]);

  /* ─── Smart Import state ─── */
  const [smartImportOpen, setSmartImportOpen] = useState(false);
  const [smartImportLoading, setSmartImportLoading] = useState(false);
  const [smartImportError, setSmartImportError] = useState<string | null>(null);
  const [smartImportPreview, setSmartImportPreview] = useState<Skit[] | null>(null);
  const [smartImportMapping, setSmartImportMapping] = useState<Record<string, string | null> | null>(null);
  const [smartImportReasoning, setSmartImportReasoning] = useState("");
  const [smartImportFile, setSmartImportFile] = useState<File | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [reelImportOpen, setReelImportOpen] = useState(false);
  const [reelImportData, setReelImportData] = useState<ParsedReelCreator[] | null>(null);
  const [pasteLinksOpen, setPasteLinksOpen] = useState(false);
  const [pasteLinksText, setPasteLinksText] = useState("");

  /* ─── Influencer Library state ─── */
  const [influencerOpen, setInfluencerOpen] = useState(false);
  const influencers = supaInfluencers as (Influencer & { isPrivate?: boolean })[];
  const [influencerSearch, setInfluencerSearch] = useState("");
  const [influencerFavOnly, setInfluencerFavOnly] = useState(false);
  const [expandedInfluencerId, setExpandedInfluencerId] = useState<string | null>(null);
  const [editingInfluencerId, setEditingInfluencerId] = useState<string | null>(null);
  const [addingInfluencer, setAddingInfluencer] = useState(false);
  const [infForm, setInfForm] = useState({ name: "", handle: "", tags: "", platformUrl: "", guideContent: "" });
  const [infPickerSearch, setInfPickerSearch] = useState("");
  const infPickerRef = useRef<HTMLDivElement>(null);
  const linksPickerRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const setInfluencersAndPersist = useCallback((infs: (Influencer & { isPrivate?: boolean })[]) => {
    persistInfs(infs as SupabaseInfluencer[]);
  }, [persistInfs]);

  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const tableRef = useRef<HTMLTableElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const toastId = useRef(0);

  // Column resize
  const startResize = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { col: colKey, startX: e.clientX, startW: colWidths[colKey] ?? 100 };
    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newW = Math.max(48, resizingRef.current.startW + delta);
      setColWidths(prev => ({ ...prev, [resizingRef.current!.col]: newW }));
    };
    const onUp = () => { resizingRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // Row drag-reorder
  const [dragRowId, setDragRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  const canReorder = !readOnly && !sortCol && !sortById && !search && filterCat === "All" && filterStatus === "All" && (filterApproval === "Active" || filterApproval === "All") && !filterCast;

  /* ─── Script editor derived values ─── */
  const getDefaultChars = (n: number | string) => {
    const count = Math.max(1, Math.min(Number(n) || 2, 10));
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i)).join(" + ");
  };
  const editingSkit = scriptEditorSkitId ? skits.find(s => s.id === scriptEditorSkitId) : null;
  const activeScript = editingSkit ? (scriptEditing ? scriptDraft : editingSkit.script) : "";
  const derivedChars = editingSkit ? getDefaultChars(editingSkit.castSize) : "";
  const editorCharsFromField = derivedChars ? derivedChars.split("+").map(c => c.trim()).filter(Boolean) : [];
  // Also detect characters from the actual script content
  const editorCharsFromScript = editingSkit ? Array.from(new Set(
    parseCharacterLines(activeScript, derivedChars)
      .map(l => l.char)
      .filter(c => c !== "[Direction]")
  )) : [];
  const editorChars = Array.from(new Set([...editorCharsFromField, ...editorCharsFromScript]));
  const parsedLines = editingSkit ? parseCharacterLines(activeScript, derivedChars) : [];
  const filteredLines = charFilter === "All" ? parsedLines : parsedLines.filter(l => l.char === charFilter);

  // Reset edit mode when switching skits
  useEffect(() => { setScriptEditing(false); }, [scriptEditorSkitId]);

  /* ─── Seed default influencers + categories for new users (no default skits) ─── */
  const seeded = useRef(false);
  useEffect(() => {
    if (dataLoading || seeded.current) return;
    if (influencers.length === 0 && user) {
      seeded.current = true;
      seedDefaults([], defaultInfluencers);
    }
  }, [dataLoading, influencers.length, user, seedDefaults]);

  /* ─── Toast helpers ─── */
  const showToast = useCallback((message: string, undoAction?: () => void) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, undoAction }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), undoAction ? 5000 : 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleUndo = useCallback((t: Toast) => {
    t.undoAction?.();
    setToasts(prev => prev.filter(x => x.id !== t.id));
  }, []);

  /* ─── Filtering + Sorting ─── */
  let filtered = skits.filter(s => {
    if (filterCat !== "All" && s.category !== filterCat) return false;
    if (filterStatus !== "All" && s.status !== filterStatus) return false;
    if (filterApproval !== "All") {
      if (filterApproval === "Active" && s.approved === false) return false;
      if (filterApproval === "Pending" && s.approved != null) return false;
      if (filterApproval === "Approved" && s.approved !== true) return false;
      if (filterApproval === "Rejected" && s.approved !== false) return false;
    }
    if (filterCast && s.castSize !== filterCast) return false;
    if (search) {
      const q = search.toLowerCase();
      if (searchField === "all") {
        if (!Object.values(s).some(v => typeof v === "string" && v.toLowerCase().includes(q))) return false;
      } else {
        if (!(String(s[searchField] ?? "")).toLowerCase().includes(q)) return false;
      }
    }
    return true;
  });

  if (sortCol) {
    filtered = [...filtered].sort((a, b) => {
      const va = String(a[sortCol] ?? "").toLowerCase();
      const vb = String(b[sortCol] ?? "").toLowerCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  } else if (sortById === "desc") {
    filtered = [...filtered].reverse();
  }

  /* ─── Pagination ─── */
  const totalFiltered = filtered.length;
  const effectivePageSize = pageSize === 0 ? totalFiltered : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / effectivePageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = pageSize === 0 ? filtered : filtered.slice(safePage * effectivePageSize, (safePage + 1) * effectivePageSize);

/* ─── Script editor navigation ─── */
  const editorIdx = filtered.findIndex(s => s.id === scriptEditorSkitId);
  const prevSkitId = editorIdx > 0 ? filtered[editorIdx - 1].id : null;
  const nextSkitId = editorIdx >= 0 && editorIdx < filtered.length - 1 ? filtered[editorIdx + 1].id : null;

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, filterCat, filterStatus, filterCast]);

  // Auto-remove empty new row when focus leaves it
  const prevActiveRowRef = useRef<number | null>(null);
  useEffect(() => {
    const prevRow = prevActiveRowRef.current;
    const currRow = activeCell?.[0] ?? null;
    prevActiveRowRef.current = currRow;

    // Only check when row changes (or focus leaves table)
    if (newRowId && prevRow !== null && currRow !== prevRow) {
      const skit = skits.find(s => s.id === newRowId);
      if (skit && !skit.inspiration.trim() && !skit.script.trim() && !skit.styleRef.trim() && !skit.environment.trim()) {
        deleteSkits([newRowId]);
        setNewRowId(null);
      } else {
        setNewRowId(null);
      }
    }
  }, [activeCell, newRowId, skits, persist]);

  // Also clean up empty new row when filters/search change
  useEffect(() => {
    if (!newRowId) return;
    const skit = skits.find(s => s.id === newRowId);
    if (skit && !skit.inspiration.trim() && !skit.script.trim() && !skit.styleRef.trim() && !skit.environment.trim()) {
      deleteSkits([newRowId]);
    }
    setNewRowId(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterCat, filterStatus, filterCast]);

  // Auto-focus the active cell's input/select when activeCell changes
  useEffect(() => {
    if (!activeCell || !tableRef.current) return;
    const [row, col] = activeCell;
    const el = tableRef.current.querySelector<HTMLElement>(`[data-cell="${row}-${col}"]`);
    if (el) el.focus();
  }, [activeCell]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Script editor: body scroll lock
  useEffect(() => {
    if (scriptEditorSkitId) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [scriptEditorSkitId]);

  // Reset charFilter when opening a different skit
  useEffect(() => {
    setCharFilter("All");
    setShowTemplate(false);
    setShowDetails(false);
  }, [scriptEditorSkitId]);

  // Script editor keyboard shortcuts
  useEffect(() => {
    if (!scriptEditorSkitId) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") { e.preventDefault(); setScriptEditorSkitId(null); }
      if (mod && e.key === "Enter") { e.preventDefault(); setScriptEditorSkitId(null); }
      if (mod && e.key === "ArrowUp" && prevSkitId) { e.preventDefault(); setScriptEditorSkitId(prevSkitId); }
      if (mod && e.key === "ArrowDown" && nextSkitId) { e.preventDefault(); setScriptEditorSkitId(nextSkitId); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [scriptEditorSkitId, prevSkitId, nextSkitId]);

  /* ─── Stats ─── */
  const total = skits.length;
  const scriptsDone = skits.filter(s => s.script.toLowerCase() === "complete").length;
  const filmed = skits.filter(s => s.status === "Done").length;

  /* ─── Dynamic categories (from persistent storage + any orphans in skits) ─── */
  const allCategories = Array.from(new Set([...categories, ...skits.map(s => s.category)])).filter(Boolean);
  const dynamicCategoryOptions: CellDropdownOption[] = allCategories.map(c => {
    const s = getCategoryStyle(c);
    return { value: c, label: c, dot: s.dot };
  });

  /* ─── Cell update ─── */
  const updateSkit = useCallback((id: string, field: keyof Skit, value: string) => {
    if (readOnly) return;
    persist(skits.map(s => s.id === id ? { ...s, [field]: value } : s));
  }, [readOnly, skits, persist]);

  /* ─── Add row ─── */
  const addRow = useCallback(() => {
    const newSkit: Skit = { id: crypto.randomUUID(), inspiration: "", links: "", castSize: "2", characters: "A + B", category: "AI Agent", styleRef: "", script: "", environment: "", status: "Idea", approved: null };
    persist([newSkit, ...skits]);
    setNewRowId(newSkit.id);
    setPage(0);
    setTimeout(() => setActiveCell([0, 0]), 50);
  }, [skits, persist, showToast]);

  /* ─── Delete selected ─── */
  const deleteSelected = useCallback(() => {
    if (readOnly) return;
    if (selected.size === 0) return;
    const snapshot = [...skits];
    const idsArr = Array.from(selected);
    deleteSkits(idsArr);
    setSelected(new Set());
    setUndoSnapshot(snapshot);
    showToast(`Deleted ${idsArr.length} row${idsArr.length > 1 ? "s" : ""}`, () => {
      persist(snapshot);
      setUndoSnapshot(null);
    });
  }, [readOnly, skits, selected, deleteSkits, persist, showToast]);

  /* ─── Sort ─── */
  const handleSort = useCallback((col: keyof Skit) => {
    setSortById(null);
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  }, [sortCol, sortAsc]);
  const handleSortById = useCallback(() => {
    setSortCol(null);
    setSortById(prev => prev === null ? "desc" : prev === "desc" ? "asc" : null);
  }, []);

  /* ─── CSV Export ─── */
  const downloadCSV = useCallback(() => {
    const dataToExport = selected.size > 0 ? skits.filter(s => selected.has(s.id)) : skits;
    const headers = ["#", "Title", "Links", "Cast Size", "Characters", "Category", "Style Reference", "Script", "Environment", "Status", "Approved"];
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = dataToExport.map((r, i) => [i + 1, esc(r.inspiration), esc((r.links || "").replace(/\n/g, " | ")), r.castSize, esc(r.characters), esc(r.category), esc(r.styleRef), esc(r.script), esc(r.environment), esc(r.status), r.approved === true ? "Yes" : r.approved === false ? "No" : ""].join(","));
    const csv = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "skit-planner.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast(selected.size > 0 ? `Exported ${selected.size} skit${selected.size > 1 ? "s" : ""}` : `Exported all ${dataToExport.length} skits`);
  }, [skits, selected, showToast]);

  /* ─── CSV Import ─── */
  const importCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headerMap: Record<string, keyof Skit> = {};
        const fieldNames: Record<string, keyof Skit> = {
          "inspiration": "inspiration", "title": "inspiration", "name": "inspiration",
          "links": "links", "link": "links", "url": "links", "urls": "links", "reel": "links", "video": "links",
          "cast size": "castSize", "castsize": "castSize", "cast": "castSize",
          "characters": "characters", "chars": "characters",
          "category": "category", "cat": "category", "type": "category",
          "style reference": "styleRef", "styleref": "styleRef", "style ref": "styleRef", "style": "styleRef", "reference": "styleRef",
          "script": "script",
          "environment": "environment", "env": "environment", "location": "environment",
          "status": "status",
        };
        // Map CSV headers to our fields
        for (const h of (results.meta.fields || [])) {
          const key = h.toLowerCase().trim().replace(/[#_-]/g, " ").replace(/\s+/g, " ");
          if (fieldNames[key]) headerMap[h] = fieldNames[key];
        }

        const newSkits: Skit[] = (results.data as Record<string, string>[]).map(row => {
          const skit: Skit = { id: crypto.randomUUID(), inspiration: "", links: "", castSize: "2", characters: "A + B", category: "AI Agent", styleRef: "", script: "", environment: "", status: "Idea" };
          for (const [csvCol, field] of Object.entries(headerMap)) {
            if (row[csvCol]?.trim()) {
              (skit as unknown as Record<string, string>)[field] = row[csvCol].trim();
            }
          }
          return skit;
        }).filter(s => s.inspiration);

        if (newSkits.length === 0) {
          showToast("No valid rows found in CSV");
          return;
        }
        const { unique, dupes } = dedupeNewSkits(newSkits, getExistingUrls(skits));
        if (unique.length === 0) {
          showToast(`All ${newSkits.length} row${newSkits.length > 1 ? "s" : ""} already exist on this board`);
          return;
        }
        const snapshot = [...skits];
        persist([...skits, ...unique]);
        setUndoSnapshot(snapshot);
        const dupeMsg = dupes > 0 ? ` (${dupes} duplicate${dupes > 1 ? "s" : ""} skipped)` : "";
        showToast(`Imported ${unique.length} row${unique.length > 1 ? "s" : ""}${dupeMsg}`, () => {
          persist(snapshot);
          setUndoSnapshot(null);
        });
      },
    });
  }, [skits, persist, showToast]);

  const confirmReelImport = useCallback(() => {
    if (!reelImportData) return;
    const newSkits: Skit[] = [];
    for (const creator of reelImportData) {
      for (const reel of creator.reels) {
        newSkits.push({
          id: crypto.randomUUID(),
          inspiration: reel.title,
          links: reel.url,
          castSize: "",
          characters: "",
          category: "",
          styleRef: creator.handle,
          script: "",
          environment: "",
          status: "Idea",
          approved: null,
        });
      }
    }
    const { unique, dupes } = dedupeNewSkits(newSkits, getExistingUrls(skits));
    if (unique.length === 0) {
      showToast(`All ${newSkits.length} reel${newSkits.length > 1 ? "s" : ""} already exist on this board`);
      setReelImportOpen(false);
      setReelImportData(null);
      return;
    }
    const snapshot = [...skits];
    persist([...unique, ...skits]);
    setUndoSnapshot(snapshot);
    const dupeMsg = dupes > 0 ? ` (${dupes} duplicate${dupes > 1 ? "s" : ""} skipped)` : "";
    showToast(`Imported ${unique.length} reel${unique.length > 1 ? "s" : ""} from ${reelImportData.length} creator${reelImportData.length > 1 ? "s" : ""}${dupeMsg}`, () => {
      persist(snapshot);
      setUndoSnapshot(null);
    });
    setReelImportOpen(false);
    setReelImportData(null);
  }, [reelImportData, skits, persist, showToast]);

  /* ─── Smart Import ─── */
  const resetSmartImport = useCallback(() => {
    setSmartImportOpen(false);
    setSmartImportLoading(false);
    setSmartImportError(null);
    setSmartImportPreview(null);
    setSmartImportMapping(null);
    setSmartImportReasoning("");
    setSmartImportFile(null);
  }, []);

  const processSmartImport = useCallback(async (file: File) => {
    setSmartImportOpen(true);
    setSmartImportLoading(true);
    setSmartImportError(null);
    setSmartImportPreview(null);
    setSmartImportMapping(null);
    setSmartImportFile(file);

    try {
      // Step 1: Parse file client-side
      let headers: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let allRows: Record<string, any>[] = [];

      if (file.name.match(/\.csv$/i)) {
        const parsed = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve) => {
          Papa.parse(file, { header: true, skipEmptyLines: true, complete: resolve });
        });
        headers = parsed.meta.fields || [];
        allRows = parsed.data;
      } else {
        // Excel
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        if (jsonData.length > 0) headers = Object.keys(jsonData[0]);
        allRows = jsonData.map(row =>
          Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? "")]))
        );
      }

      if (headers.length === 0 || allRows.length === 0) {
        throw new Error("File appears empty or has no recognizable headers.");
      }

      // Step 2: Send first 5 rows + headers to AI
      const sampleRows = allRows.slice(0, 5);
      const systemPrompt = SMART_IMPORT_SYSTEM_PROMPT.replace("{CATEGORIES}", categories.join(", "));
      const userMessage = `Headers: ${JSON.stringify(headers)}\n\nSample rows:\n${sampleRows.map((r, i) => `Row ${i + 1}: ${JSON.stringify(r)}`).join("\n")}\n\nPlease map these columns to the target schema.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");

      // Step 3: Parse AI response
      const jsonMatch = data.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned an invalid response. Try again.");
      const aiResult = JSON.parse(jsonMatch[0]);
      const mapping: Record<string, string | null> = aiResult.mapping;

      setSmartImportMapping(mapping);
      setSmartImportReasoning(aiResult.reasoning || "");

      // Step 4: Apply mapping to ALL rows
      const mappedSkits: Skit[] = allRows.map(row => {
        const skit: Skit = {
          id: crypto.randomUUID(),
          inspiration: "",
          links: "",
          castSize: "2",
          characters: "A + B",
          category: categories[0] || "AI Agent",
          styleRef: "",
          script: "",
          environment: "",
          status: "Idea",
        };
        for (const [sourceCol, targetField] of Object.entries(mapping)) {
          if (targetField && row[sourceCol] != null && String(row[sourceCol]).trim()) {
            (skit as unknown as Record<string, string>)[targetField] = String(row[sourceCol]).trim();
          }
        }
        return skit;
      }).filter(s => s.inspiration);

      if (mappedSkits.length === 0) {
        throw new Error("No rows could be mapped. The file structure may not contain skit-compatible data.");
      }

      setSmartImportPreview(mappedSkits);
    } catch (err) {
      setSmartImportError(err instanceof Error ? err.message : "Smart import failed");
    } finally {
      setSmartImportLoading(false);
    }
  }, [categories]);

  const confirmSmartImport = useCallback(() => {
    if (!smartImportPreview) return;
    const { unique, dupes } = dedupeNewSkits(smartImportPreview, getExistingUrls(skits));
    if (unique.length === 0) {
      showToast(`All ${smartImportPreview.length} row${smartImportPreview.length > 1 ? "s" : ""} already exist on this board`);
      resetSmartImport();
      return;
    }
    const snapshot = [...skits];
    persist([...skits, ...unique]);
    setUndoSnapshot(snapshot);
    const dupeMsg = dupes > 0 ? ` (${dupes} duplicate${dupes > 1 ? "s" : ""} skipped)` : "";
    showToast(`Imported ${unique.length} row${unique.length > 1 ? "s" : ""} via AI${dupeMsg}`, () => {
      persist(snapshot);
      setUndoSnapshot(null);
    });
    resetSmartImport();
  }, [smartImportPreview, skits, persist, showToast, resetSmartImport]);

  /* ─── Unified Import (auto-detects file type) ─── */
  const handleUnifiedImport = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const name = file.name.toLowerCase();
    if (name.match(/\.(md|markdown|txt)$/)) {
      file.text().then(text => {
        const parsed = parseReelResearchMarkdown(text);
        const data = parsed.length > 0 ? parsed : parseUrlList(text);
        if (data.length > 0) {
          setReelImportData(data);
          setReelImportOpen(true);

        } else {
          showToast("No reel entries or video URLs found in file");
        }
      });
    } else if (name.match(/\.(xlsx|xls)$/)) {
      processSmartImport(file);
    } else if (name.endsWith(".csv")) {
      importCSV(file);
    } else {
      showToast("Unsupported file type");
    }
  }, [categories, importCSV, processSmartImport, showToast]);

  /* ─── Paste Links ─── */
  const pasteUrlCount = useMemo(() => {
    const re = /https?:\/\/(?:www\.)?(?:tiktok\.com\/@[\w.]+\/video\/\d+|instagram\.com\/reel\/[\w-]+|youtube\.com\/shorts\/[\w-]+|youtu\.be\/[\w-]+)/gi;
    return [...new Set(pasteLinksText.match(re) || [])].length;
  }, [pasteLinksText]);

  const handlePasteLinksConfirm = useCallback(() => {
    const data = parseUrlList(pasteLinksText);
    if (data.length > 0) {
      setReelImportData(data);
      setReelImportOpen(true);
      setPasteLinksOpen(false);
      setPasteLinksText("");
    } else {
      showToast("No video URLs found. Paste TikTok, IG Reel, or YT Shorts links.");
    }
  }, [pasteLinksText, categories, showToast]);

  /* ─── Drag & Drop ─── */
  const handleDragOver = useCallback((e: DragEvent) => { if (!e.dataTransfer?.types.includes("Files")) return; e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);
  /* ─── Transcript: file upload handler ─── */
  const handleTranscriptFile = useCallback(async (file: File) => {
    setTranscriptText("");
    setTranscriptLoading(true);
    setTranscriptProgress("Decoding audio...");
    try {
      // Decode audio using Web Audio API
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();
      const audioData = decoded.getChannelData(0); // mono

      setTranscriptProgress("Loading AI model (first time may take a moment)...");
      const { pipeline } = await import("@huggingface/transformers");
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { dtype: "q8" }
      );
      setTranscriptProgress("Transcribing...");
      const result = await transcriber(audioData);
      const text = Array.isArray(result) ? result.map((r: { text: string }) => r.text).join(" ") : (result as { text: string }).text;
      setTranscriptText(text.trim());
      setTranscriptProgress("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transcription failed";
      setTranscriptProgress("");
      showToast(msg);
    } finally {
      setTranscriptLoading(false);
    }
  }, [showToast]);

  /* ─── Transcript: YouTube URL handler ─── */
  const handleTranscriptUrl = useCallback(async () => {
    if (!transcriptUrl.trim()) return;
    setTranscriptText("");
    setTranscriptLoading(true);
    setTranscriptProgress("Fetching transcript...");
    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: transcriptUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch transcript");
      setTranscriptText(data.transcript);
      setTranscriptProgress("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch transcript";
      setTranscriptProgress("");
      showToast(msg);
    } finally {
      setTranscriptLoading(false);
    }
  }, [transcriptUrl, showToast]);

  /* ─── AI: chat send handler ─── */
  const handleAiSend = useCallback(async (task: string, draft: string, prevMessages: {role:"user"|"assistant";content:string}[]) => {
    if (!draft.trim()) return;
    const matchedPrompt = SCRIPT_PROMPTS.find(p => p.id === task);
    let systemPrompt = matchedPrompt
      ? matchedPrompt.prompt.trim()
      : "You are a helpful assistant for comedy script writing.";

    // Inject niche context for generate task
    const nicheLabel = aiNiche === "custom" ? aiNicheCustom.trim() : SCRIPT_NICHES.find(n => n.id === aiNiche)?.label;
    if (task === "generate" && nicheLabel) {
      systemPrompt += `\n\nIMPORTANT: Write comedy that specifically resonates with people in the "${nicheLabel}" world. Use industry-specific jargon, situations, pain points, and humor that someone in this field would instantly recognize. The comedy should feel like an insider joke for ${nicheLabel} professionals.`;
    }

    // Format first message based on task if it's the first message
    const nicheTag = task === "generate" && nicheLabel ? `\nAudience: ${nicheLabel}` : "";
    const userContent = prevMessages.length === 0
      ? task === "generate" ? `Write a script about: ${draft.trim()}\nCast: 2 characters (A, B)${nicheTag}` : task === "reformat" ? `Here is the script to reformat:\n\n${draft.trim()}` : draft.trim()
      : draft.trim();

    const userMsg = { role: "user" as const, content: userContent };
    const newMessages = [...prevMessages, userMsg];
    setAiMessages(newMessages);
    setAiDraft("");
    setAiLoading(true);
    setTimeout(() => aiChatRef.current?.scrollTo({ top: aiChatRef.current.scrollHeight, behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      const assistantMsg = { role: "assistant" as const, content: data.text };
      setAiMessages(prev => [...prev, assistantMsg]);
      setTimeout(() => aiChatRef.current?.scrollTo({ top: aiChatRef.current.scrollHeight, behavior: "smooth" }), 50);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed";
      showToast(msg);
      // Remove the user message on failure
      setAiMessages(prevMessages);
    } finally {
      setAiLoading(false);
    }
  }, [aiNiche, aiNicheCustom, showToast]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.name.match(/\.(md|markdown|txt)$/i)) {
      file.text().then(text => {
        const parsed = parseReelResearchMarkdown(text);
        const data = parsed.length > 0 ? parsed : parseUrlList(text);
        if (data.length > 0) {
          setReelImportData(data);
          setReelImportOpen(true);

        } else if (file.name.endsWith(".csv") || file.type === "text/csv") {
          importCSV(file);
        } else {
          showToast("No reel entries or video URLs found in file");
        }
      });
    } else if (file.name.match(/\.(xlsx|xls)$/i)) {
      processSmartImport(file);
    } else if (file.name.endsWith(".csv") || file.type === "text/csv") {
      importCSV(file);
    } else {
      showToast("Please drop a .csv, .xlsx, or .md file");
    }
  }, [importCSV, processSmartImport, categories, showToast]);

  /* ─── Keyboard navigation ─── */
  const handleTableKeyDown = useCallback((e: KeyboardEvent<HTMLTableElement>) => {
    if (!activeCell) return;
    const [row, col] = activeCell;
    const maxRow = pageData.length - 1;
    const maxCol = EDITABLE_COLS.length - 1;

    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        if (col > 0) setActiveCell([row, col - 1]);
        else if (row > 0) setActiveCell([row - 1, maxCol]);
      } else {
        if (col < maxCol) setActiveCell([row, col + 1]);
        else if (row < maxRow) setActiveCell([row + 1, 0]);
      }
    } else if (e.key === "ArrowDown" && !e.shiftKey) {
      if (row < maxRow) { e.preventDefault(); setActiveCell([row + 1, col]); }
    } else if (e.key === "ArrowUp" && !e.shiftKey) {
      if (row > 0) { e.preventDefault(); setActiveCell([row - 1, col]); }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // If on script column, open the editor instead of moving down
      if (EDITABLE_COLS[col] === "script") {
        setScriptEditorSkitId(pageData[row].id);
      } else if (row < maxRow) {
        setActiveCell([row + 1, col]);
      }
    } else if (e.key === "Escape") {
      setActiveCell(null);
      tableRef.current?.focus();
    }
  }, [activeCell, pageData.length]);

  /* ─── Select helpers ─── */
  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === pageData.length && pageData.length > 0) setSelected(new Set());
    else setSelected(new Set(pageData.map(s => s.id)));
  }, [selected.size, pageData]);

  /* ─── Column definitions ─── */
  const columns: { key: keyof Skit; label: string; resizable: boolean }[] = [
    { key: "inspiration", label: "Title",  resizable: false },
    { key: "links" as keyof Skit, label: "Links",  resizable: true },
    { key: "castSize",    label: "Cast",          resizable: true },
    { key: "category",    label: "Category",      resizable: true },
    { key: "styleRef",    label: "Style Ref",     resizable: true },
    { key: "script",      label: "Script",        resizable: false },
    { key: "environment", label: "Environment",   resizable: true },
    { key: "status",      label: "Status",        resizable: true },
    { key: "approved" as keyof Skit, label: "Approval", resizable: false },
  ];

  const orderedColumns = useMemo(() => {
    const colMap = new Map(columns.map(c => [c.key, c]));
    return colOrder.map(k => colMap.get(k as keyof Skit)).filter((c): c is { key: keyof Skit; label: string; resizable: boolean } => !!c);
  }, [colOrder]);

  useEffect(() => {
    localStorage.setItem("skit-col-order", JSON.stringify(colOrder));
  }, [colOrder]);

  /* ─── Render a single cell ─── */
  function renderCell(skit: Skit, colIdx: number, rowIdx: number) {
    const col = orderedColumns[colIdx];
    const isActive = !readOnly && activeCell?.[0] === rowIdx && activeCell?.[1] === colIdx;
    const value = String(skit[col.key] ?? "");

    // Category dropdown (custom)
    if (col.key === "category") {
      const style = getCategoryStyle(value);
      return (
        <CellDropdown
          dataCellId={`${rowIdx}-${colIdx}`}
          value={value}
          options={dynamicCategoryOptions}
          onChange={v => updateSkit(skit.id, "category", v)}
          onFocus={() => setActiveCell([rowIdx, colIdx])}
          pillBg={style.bg}
          pillText={style.text}
          disabled={readOnly}
          searchable
        />
      );
    }

    // Status dropdown (custom)
    if (col.key === "status") {
      const style = STATUS_STYLES[value] || { bg: "bg-input-bg", text: "text-text2", icon: "" };
      return (
        <CellDropdown
          dataCellId={`${rowIdx}-${colIdx}`}
          value={value}
          options={STATUS_OPTIONS}
          onChange={v => updateSkit(skit.id, "status", v)}
          onFocus={() => setActiveCell([rowIdx, colIdx])}
          pillBg={style.bg}
          pillText={style.text}
          disabled={readOnly}
        />
      );
    }

    // Script — clickable preview that opens full-screen editor
    if (col.key === "script") {
      const lineCount = value ? value.split("\n").filter((l: string) => l.trim()).length : 0;
      const preview = value ? (value.split("\n")[0].slice(0, 40) + (value.length > 40 ? "..." : "")) : "";
      return (
        <button
          data-cell={`${rowIdx}-${colIdx}`}
          type="button"
          onClick={() => setScriptEditorSkitId(skit.id)}
          onFocus={() => setActiveCell([rowIdx, colIdx])}
          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-left transition-all duration-150 group/script cursor-pointer
            ${isActive
              ? "border border-accent outline-2 outline-accent/20"
              : "border border-transparent hover:border-border hover:bg-hover-row focus:border-accent focus:outline-2 focus:outline-accent/20"
            }`}
        >
          {value ? (
            <>
              <span className="truncate text-text2 flex-1">{preview}</span>
              {lineCount > 1 && (
                <span className="text-[10px] text-text3 bg-input-bg px-1.5 py-0.5 rounded-full shrink-0">{lineCount}L</span>
              )}
              <svg className="w-3 h-3 text-text3 opacity-0 group-hover/script:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </>
          ) : (
            <span className="flex items-center gap-1 text-text3">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
              Write script...
            </span>
          )}
        </button>
      );
    }

    // Cast size number input
    if (col.key === "castSize") {
      return (
        <input
          data-cell={`${rowIdx}-${colIdx}`}
          type="number"
          min={1}
          value={value}
          readOnly={readOnly}
          onChange={e => updateSkit(skit.id, "castSize", e.target.value)}
          onFocus={() => { if (!readOnly) setActiveCell([rowIdx, colIdx]); }}
          className={`w-full px-1 py-1 rounded-md text-sm border border-transparent bg-transparent text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${readOnly ? "cursor-default" : "focus:border-accent focus:outline-2 focus:outline-accent/20"}`}
        />
      );
    }

    // StyleRef cell — custom influencer picker
    if (col.key === "styleRef") {
      const matchedInf = influencers.find(i => i.handle === value);
      const profileUrl = matchedInf?.platforms?.[0]?.url;
      return (
        <div className="relative flex items-center group/styleref" ref={isActive ? infPickerRef : undefined}>
          <button
            data-cell={`${rowIdx}-${colIdx}`}
            onClick={() => { if (!readOnly) { setActiveCell(isActive ? null : [rowIdx, colIdx]); setInfPickerSearch(""); } }}
            onFocus={() => { if (!readOnly) { setActiveCell([rowIdx, colIdx]); setInfPickerSearch(""); } }}
            className={`flex-1 min-w-0 px-2 py-1 rounded-md text-sm border text-left overflow-hidden transition-all duration-150 ${isActive ? "border-accent ring-2 ring-accent/20" : "border-transparent hover:border-border hover:bg-hover-row"}`}
          >
            {!value ? (
              <span className="text-text3 text-xs">Select...</span>
            ) : matchedInf ? (
              <span className="flex items-center gap-1.5 w-full overflow-hidden">
                <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[7px] font-bold text-accent shrink-0">{matchedInf.avatar}</span>
                <span className="text-text2 text-xs truncate min-w-0">{matchedInf.name}</span>
              </span>
            ) : (
              <span className="text-text2 text-xs truncate block">{value}</span>
            )}
          </button>
          {profileUrl && !isActive && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1 text-text3 hover:text-accent transition opacity-0 group-hover/styleref:opacity-100"
              title={`Open ${matchedInf?.name ?? value}'s profile`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </a>
          )}
          {isActive && createPortal(
            <>
            <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => { setActiveCell(null); setInfPickerSearch(""); }} />
            <div
              className="fixed"
              style={{ zIndex: 9999 }}
              ref={el => {
                if (!el) return;
                const btn = infPickerRef.current?.querySelector("button");
                if (!btn) return;
                const r = btn.getBoundingClientRect();
                el.style.left = `${r.left}px`;
                el.style.top = `${r.bottom + 4}px`;
                el.style.width = `${Math.max(r.width, 240)}px`;
              }}
            >
              <div className="dropdown-menu rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                {/* Search */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
                    <input
                      autoFocus
                      value={infPickerSearch}
                      onChange={e => setInfPickerSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") { setActiveCell(null); setInfPickerSearch(""); }
                      }}
                      placeholder="Search..."
                      className="w-full pl-7 pr-2 py-1.5 bg-input-bg border border-border rounded-lg text-[11px] text-foreground placeholder:text-text3 focus:outline-none focus:ring-1 focus:ring-accent/30 transition"
                    />
                  </div>
                </div>
                {/* Options */}
                <div className="max-h-48 overflow-y-auto py-1">
                  {/* Clear option */}
                  {value && (
                    <button onClick={() => { updateSkit(skit.id, col.key, ""); setActiveCell(null); setInfPickerSearch(""); }} className="w-full px-3 py-1.5 text-left text-[11px] text-text3 hover:bg-hover-row transition flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                      Clear selection
                    </button>
                  )}
                  {influencers
                    .filter(inf => {
                      if (!infPickerSearch) return true;
                      const s = infPickerSearch.toLowerCase();
                      return inf.name.toLowerCase().includes(s) || inf.handle.toLowerCase().includes(s) || inf.tags.some(t => t.toLowerCase().includes(s));
                    })
                    .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
                    .map(inf => (
                      <button
                        key={inf.id}
                        onClick={() => { updateSkit(skit.id, col.key, inf.handle); setActiveCell(null); setInfPickerSearch(""); }}
                        className={`w-full px-3 py-1.5 text-left hover:bg-hover-row transition flex items-center gap-2 ${value === inf.handle ? "bg-accent/8" : ""}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[8px] font-bold text-accent shrink-0">{inf.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {inf.favorite && <svg className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>}
                            <span className="text-[11px] font-medium text-foreground truncate">{inf.name}</span>
                          </div>
                          <span className="text-[9px] text-text3 font-mono">{inf.handle}</span>
                        </div>
                        {value === inf.handle && <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}
                      </button>
                    ))
                  }
                  {influencers.filter(inf => { if (!infPickerSearch) return true; const s = infPickerSearch.toLowerCase(); return inf.name.toLowerCase().includes(s) || inf.handle.toLowerCase().includes(s) || inf.tags.some(t => t.toLowerCase().includes(s)); }).length === 0 && (
                    <p className="px-3 py-3 text-[10px] text-text3 text-center">No match found</p>
                  )}
                </div>
              </div>
            </div>
            </>,
            document.body
          )}
        </div>
      );
    }

    // Links column — compact platform icons (display mode)
    if (col.key === "links" && !isActive) {
      const parsed = parseLinksField(value);
      if (parsed.length === 0) {
        return (
          <div
            data-cell={`${rowIdx}-${colIdx}`}
            tabIndex={readOnly ? -1 : 0}
            onClick={() => { if (!readOnly) setActiveCell([rowIdx, colIdx]); }}
            onFocus={() => { if (!readOnly) setActiveCell([rowIdx, colIdx]); }}
            className={`w-full min-w-0 px-2 py-1 rounded-md text-sm border border-transparent text-text3 transition-all duration-150 ${readOnly ? "cursor-default" : "hover:border-border hover:bg-hover-row cursor-text"}`}
          >—</div>
        );
      }
      const visible = parsed.slice(0, 3);
      const extra = parsed.length - 3;
      return (
        <div
          data-cell={`${rowIdx}-${colIdx}`}
          tabIndex={readOnly ? -1 : 0}
          onClick={(e) => {
            if (readOnly) return;
            if ((e.target as HTMLElement).closest("a")) return;
            setActiveCell([rowIdx, colIdx]);
          }}
          onFocus={(e) => { if (!readOnly && !(e.target as HTMLElement).closest("a")) setActiveCell([rowIdx, colIdx]); }}
          className={`w-full min-w-0 px-2 py-1 rounded-md text-sm border border-transparent transition-all duration-150 ${readOnly ? "cursor-default" : "hover:border-border hover:bg-hover-row cursor-text"}`}
        >
          <span className="inline-flex items-center gap-1">
            {visible.map((l, i) => {
              const colors = PLATFORM_COLORS[l.platform] || PLATFORM_COLORS.link;
              return (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className={`inline-flex items-center p-1 rounded-full ${colors.bg} ${colors.text} ${colors.hover} transition cursor-pointer`}
                  title={l.url}
                >
                  <PlatformIcon platform={l.platform} size={13} />
                </a>
              );
            })}
            {extra > 0 && <span className="text-[10px] text-text3 font-medium">+{extra}</span>}
          </span>
        </div>
      );
    }

    // Links column — edit mode (portal-based URL list editor)
    if (col.key === "links" && isActive) {
      const parsed = parseLinksField(value);
      return (
        <div data-cell={`${rowIdx}-${colIdx}`} ref={linksPickerRef} className="w-full min-w-0 px-2 py-1 rounded-md text-sm border border-accent ring-2 ring-accent/20 transition-all duration-150">
          {parsed.length === 0 ? <span className="text-text3">—</span> : (
            <span className="inline-flex items-center gap-1">
              {parsed.map((l, i) => {
                const colors = PLATFORM_COLORS[l.platform] || PLATFORM_COLORS.link;
                return (
                  <span key={i} className={`inline-flex items-center p-1 rounded-full ${colors.bg} ${colors.text}`}>
                    <PlatformIcon platform={l.platform} size={13} />
                  </span>
                );
              })}
            </span>
          )}
          {createPortal(
            <>
              <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setActiveCell(null)} />
              <div
                className="fixed"
                style={{ zIndex: 9999 }}
                ref={el => {
                  if (!el || !linksPickerRef.current) return;
                  const r = linksPickerRef.current.getBoundingClientRect();
                  el.style.left = `${Math.min(r.left, window.innerWidth - 340)}px`;
                  el.style.top = `${r.bottom + 4}px`;
                }}
              >
                <div className="dropdown-menu rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up p-3 w-[320px] space-y-2" onClick={e => e.stopPropagation()}>
                  <div className="text-xs font-semibold text-text2 mb-1">Links</div>
                  {parsed.length === 0 && <div className="text-xs text-text3">No links yet</div>}
                  {parsed.map((l, i) => {
                    const colors = PLATFORM_COLORS[l.platform] || PLATFORM_COLORS.link;
                    return (
                      <div key={i} className="flex items-center gap-2 group/link">
                        <span className={`shrink-0 ${colors.text}`}><PlatformIcon platform={l.platform} size={14} /></span>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-xs text-accent hover:underline truncate" title={l.url}>
                          {l.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 50)}{l.url.length > 65 ? "..." : ""}
                        </a>
                        {!readOnly && (
                          <button
                            onClick={() => {
                              const urls = value.split(/[\n\s]+/).filter(u => /^https?:\/\//i.test(u));
                              urls.splice(i, 1);
                              updateSkit(skit.id, "links", urls.join("\n"));
                            }}
                            className="shrink-0 p-0.5 rounded text-text3 hover:text-t-red hover:bg-t-red/10 transition opacity-0 group-hover/link:opacity-100"
                            title="Remove link"
                          >
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {!readOnly && (
                    <input
                      autoFocus
                      placeholder="Paste URL and press Enter"
                      className="w-full px-2.5 py-1.5 bg-input-bg border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const url = (e.target as HTMLInputElement).value.trim();
                          if (url && /^https?:\/\//i.test(url)) {
                            const current = value.split(/[\n\s]+/).filter(u => /^https?:\/\//i.test(u));
                            current.push(url);
                            updateSkit(skit.id, "links", current.join("\n"));
                            (e.target as HTMLInputElement).value = "";
                          }
                          e.preventDefault();
                        }
                        if (e.key === "Escape") setActiveCell(null);
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const maxCol = EDITABLE_COLS.length - 1;
                          const maxRow = pageData.length - 1;
                          if (e.shiftKey) {
                            if (colIdx > 0) setActiveCell([rowIdx, colIdx - 1]);
                            else if (rowIdx > 0) setActiveCell([rowIdx - 1, maxCol]);
                          } else {
                            if (colIdx < maxCol) setActiveCell([rowIdx, colIdx + 1]);
                            else if (rowIdx < maxRow) setActiveCell([rowIdx + 1, 0]);
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      );
    }

    // Approval buttons
    if (col.key === "approved") {
      return !readOnly ? (
        <div className="flex items-center justify-center gap-0.5">
          <button
            onClick={() => persist(skits.map(s => s.id === skit.id ? { ...s, approved: s.approved === true ? null : true } : s))}
            className={`p-1 rounded transition-all ${skit.approved === true ? "text-t-green bg-t-green/10" : "text-text3/30 hover:text-t-green hover:bg-t-green/10"}`}
            title={skit.approved === true ? "Approved (click to unset)" : "Approve"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
          </button>
          <button
            onClick={() => persist(skits.map(s => s.id === skit.id ? { ...s, approved: s.approved === false ? null : false } : s))}
            className={`p-1 rounded transition-all ${skit.approved === false ? "text-t-rose bg-t-rose/10" : "text-text3/30 hover:text-t-rose hover:bg-t-rose/10"}`}
            title={skit.approved === false ? "Rejected (click to unset)" : "Reject"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
      ) : (
        <span className={`text-xs ${skit.approved === true ? "text-t-green" : skit.approved === false ? "text-t-rose" : "text-text3/40"}`}>
          {skit.approved === true ? "✓" : skit.approved === false ? "✕" : "—"}
        </span>
      );
    }

    // Text input cells
    if (!isActive) {
      return (
        <div
          data-cell={`${rowIdx}-${colIdx}`}
          tabIndex={readOnly ? -1 : 0}
          onClick={() => { if (!readOnly) setActiveCell([rowIdx, colIdx]); }}
          onFocus={() => { if (!readOnly) setActiveCell([rowIdx, colIdx]); }}
          className={`w-full min-w-0 px-2 py-1 rounded-md text-sm border border-transparent truncate transition-all duration-150
            ${col.key === "inspiration" ? "font-medium text-foreground" : "text-text2"}
            ${!value ? "text-text3" : ""}
            ${readOnly ? "cursor-default" : "hover:border-border hover:bg-hover-row cursor-text"}
          `}
        >
          {value || "—"}
        </div>
      );
    }
    return (
      <input
        data-cell={`${rowIdx}-${colIdx}`}
        type="text"
        autoFocus
        value={value}
        onChange={e => updateSkit(skit.id, col.key, e.target.value)}
        onFocus={() => setActiveCell([rowIdx, colIdx])}
        onBlur={() => setActiveCell(null)}
        placeholder="—"
        className={`w-full px-2 py-1 rounded-md text-sm border bg-transparent transition-all duration-150 placeholder:text-text3 border-accent outline-2 outline-accent/20
          ${col.key === "inspiration" ? "font-medium text-foreground" : "text-text2"}
        `}
      />
    );
  }

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  const editorOpen = !!(scriptEditorSkitId && editingSkit);

  /* ─── Shared pagination bar ─── */

  /* ─── Mobile skit card ─── */
  function MobileSkitCard({ skit, globalIdx }: { skit: Skit; globalIdx: number }) {
    const isSelected = selected.has(skit.id);
    const isExpanded = expandedCardId === skit.id;
    const catStyle = getCategoryStyle(skit.category);
    const statusStyle = STATUS_STYLES[skit.status] || { bg: "bg-text3/10", text: "text-text2", icon: "💡" };
    const scriptLines = skit.script ? skit.script.split("\n").filter((l: string) => l.trim()).length : 0;

    return (
      <div
        className={`rounded-xl border transition-all ${
          isExpanded ? "bg-input-bg border-accent/30 shadow-lg" : isSelected ? "bg-input-bg border-accent/20" : "bg-input-bg border-border hover:border-border-strong"
        }`}
      >
        {/* ── Collapsed view (always visible) ── */}
        <div
          className="px-3 py-2.5 cursor-pointer"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("input, button, a, select")) return;
            setExpandedCardId(isExpanded ? null : skit.id);
          }}
        >
          {/* Row 1: checkbox + title + index */}
          <div className="flex items-center gap-2.5">
            {!readOnly && <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(skit.id)} className="fancy-check" />}
            <span className="text-[11px] text-text3 font-mono w-5 text-center">{globalIdx}</span>
            <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">{skit.inspiration || "Untitled"}</span>
            <svg className={`w-4 h-4 text-text3 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
          </div>

          {/* Row 2: category + cast + characters */}
          <div className="flex items-center gap-2 mt-1.5 ml-[52px]">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${catStyle.bg} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
              {skit.category}
            </span>
            <span className="text-[11px] text-text3">{skit.castSize} cast</span>
            <span className="text-[11px] text-text2">{skit.characters}</span>
          </div>

          {/* Row 3: styleRef + status */}
          <div className="flex items-center justify-between mt-1.5 ml-[52px]">
            <div className="flex-1 min-w-0 truncate">
              {skit.styleRef ? (() => { const inf = influencers.find(i => i.handle === skit.styleRef); return inf ? <span className="inline-flex items-center gap-1 text-[11px]"><span className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-[7px] font-bold text-accent">{inf.avatar}</span><span className="text-text2">{inf.handle}</span></span> : <span className="text-[11px] text-text2">{skit.styleRef}</span>; })() : <span className="text-[11px] text-text3">—</span>}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${statusStyle.bg} ${statusStyle.text}`}>
              <span className="text-[9px]">{statusStyle.icon}</span>
              {skit.status}
            </span>
          </div>
        </div>

        {/* ── Expanded view ── */}
        {isExpanded && readOnly && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-1.5 text-xs text-text2">
            {skit.characters && <p><span className="text-text3">Characters: </span>{skit.characters}</p>}
            {skit.styleRef && <p><span className="text-text3">Style Ref: </span>{skit.styleRef}</p>}
            {skit.environment && <p><span className="text-text3">Environment: </span>{skit.environment}</p>}
            {skit.script ? (
              <button
                onClick={() => setScriptEditorSkitId(skit.id)}
                className="mt-0.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-input-bg border border-border text-xs text-text2 hover:bg-hover-row transition w-full"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                <span className="truncate">View Script</span>
              </button>
            ) : <p className="text-text3">No script written yet.</p>}
            {!skit.characters && !skit.styleRef && !skit.environment && !skit.script && (
              <p className="text-text3">No additional details.</p>
            )}
          </div>
        )}
        {isExpanded && !readOnly && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2.5">
            {/* Inspiration */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Title</label>
              <input
                value={skit.inspiration}
                onChange={e => updateSkit(skit.id, "inspiration", e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 bg-input-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
              />
            </div>
            {/* Cast + Characters row */}
            <div className="flex gap-2">
              <div className="w-16">
                <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Cast</label>
                <input
                  type="number" min={1}
                  value={skit.castSize}
                  onChange={e => updateSkit(skit.id, "castSize", e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 bg-input-bg border border-border rounded-lg text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Characters</label>
                <input
                  value={skit.characters}
                  onChange={e => updateSkit(skit.id, "characters", e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 bg-input-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                />
              </div>
            </div>
            {/* Category + Status row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Category</label>
                <div className="mt-0.5">
                  <CellDropdown value={skit.category} options={dynamicCategoryOptions} onChange={v => updateSkit(skit.id, "category", v)} onFocus={() => {}} dataCellId={`m-cat-${skit.id}`} pillBg={catStyle.bg} pillText={catStyle.text} />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Status</label>
                <div className="mt-0.5">
                  <CellDropdown value={skit.status} options={STATUS_OPTIONS} onChange={v => updateSkit(skit.id, "status", v)} onFocus={() => {}} dataCellId={`m-stat-${skit.id}`} pillBg={statusStyle.bg} pillText={statusStyle.text} />
                </div>
              </div>
            </div>
            {/* Style Ref */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Style Ref</label>
              <select
                value={skit.styleRef}
                onChange={e => updateSkit(skit.id, "styleRef", e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 bg-input-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition cursor-pointer"
              >
                <option value="">— Select influencer —</option>
                {influencers.map(inf => (
                  <option key={inf.id} value={inf.handle}>
                    {inf.favorite ? "\u2605 " : ""}{inf.name} ({inf.handle})
                  </option>
                ))}
                {skit.styleRef && !influencers.find(i => i.handle === skit.styleRef) && <option value={skit.styleRef}>{skit.styleRef} (custom)</option>}
              </select>
              {skit.styleRef && (() => { const inf = influencers.find(i => i.handle === skit.styleRef); return inf && inf.platforms.length > 0 ? <div className="mt-1 flex flex-wrap gap-1">{inf.platforms.map((p, pi) => { const c = PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.link; return <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${c.bg} ${c.text} ${c.hover} transition`}><PlatformIcon platform={p.platform} size={10} />{p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}</a>; })}</div> : null; })()}
            </div>
            {/* Environment */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-text3 font-semibold">Environment</label>
              <input
                value={skit.environment}
                onChange={e => updateSkit(skit.id, "environment", e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 bg-input-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                placeholder="Filming location"
              />
            </div>
            {/* Script button + delete */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setScriptEditorSkitId(skit.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/20 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
                {scriptLines > 0 ? `Script (${scriptLines}L)` : "Write Script"}
              </button>
              <button
                onClick={() => setDeleteRowId(skit.id)}
                className="p-2 rounded-lg text-text3 hover:text-t-rose hover:bg-t-rose/10 transition"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Loading state ─── */
  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-0 gap-3">
        <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-text3">Loading your data...</p>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-0 gap-3">
        <p className="text-sm text-red-400">Failed to load data: {dataError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 flex-1 min-h-0 ${dragging ? "ring-2 ring-accent ring-offset-4 rounded-3xl" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ─── Page content (hidden when editor is open) ─── */}
      {!editorOpen && <>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-4">
        {/* Left — Back + Logo + Title + Stats */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => router.push("/")}
            className="p-1.5 rounded-xl glass-subtle hover:bg-hover-row transition text-text2 hover:text-foreground"
            title="Back to boards"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
          </button>
          <span className="w-8 h-8 rounded-lg bg-accent/15 dark:bg-accent/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
          </span>
          <div>
            <h1 className="text-[22px] font-bold text-foreground tracking-tight leading-none">{boardName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text3">{total} <span className="text-text3/60">skits</span></span>
              <span className="w-px h-2.5 bg-border" />
              <span className="text-[10px] text-text3">{scriptsDone} <span className="text-text3/60">scripted</span></span>
              <span className="w-px h-2.5 bg-border" />
              <span className="text-[10px] text-text3">{filmed} <span className="text-text3/60">filmed</span></span>
            </div>
          </div>
        </div>

        {/* Center — Tool buttons (owner/editor only) */}
        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setInfluencerOpen(true)}
              className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
              title="Influencer Library"
            >
              <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
            </button>
            <button
              onClick={() => { setTranscriptOpen(true); setTranscriptText(""); setTranscriptProgress(""); setTranscriptUrl(""); }}
              className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
              title="Transcript extractor"
            >
              <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/></svg>
            </button>
            <button
              onClick={() => { setAiPopupOpen(true); setAiMessages([]); setAiDraft(""); }}
              className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
              title="AI Script Assistant"
            >
              <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
            </button>
          </div>
        )}

        {/* Right — Utility + User */}
        <div className="flex items-center gap-1 shrink-0">
          {readOnly && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-border/50 text-text3 text-xs font-medium mr-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              View only
            </span>
          )}
          {user && (
            <button
              onClick={() => setShareOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-subtle hover:bg-hover-row transition text-text2 hover:text-foreground text-xs font-medium mr-0.5"
              title="Share board"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
              Share
            </button>
          )}
          <button
            onClick={() => setShortcutsOpen(true)}
            className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
            title="Keyboard shortcuts"
          >
            <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="16" rx="2"/><path strokeLinecap="round" d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/></svg>
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-xl glass-subtle hover:bg-hover-row transition"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
            ) : (
              <svg className="w-4.5 h-4.5 text-text2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>
            )}
          </button>
          {/* User menu / Sign In */}
          {!user ? (
            <button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`)}
              className="ml-1 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition"
            >
              Sign In
            </button>
          ) : (
          <div className="relative ml-1" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-8 h-8 rounded-xl bg-accent/15 dark:bg-accent/20 flex items-center justify-center text-xs font-bold text-accent hover:bg-accent/25 transition"
              title={user.email ?? "Account"}
            >
              {(user.user_metadata?.display_name || user.email || "").slice(0, 2).toUpperCase()}
            </button>
            {userMenuOpen && createPortal(
              <>
                <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setUserMenuOpen(false)} />
                <div
                  className="fixed dropdown-menu rounded-xl shadow-2xl border border-border overflow-hidden animate-slide-up py-1 w-48"
                  style={{
                    zIndex: 9999,
                    top: (userMenuRef.current?.getBoundingClientRect().bottom ?? 0) + 6,
                    right: window.innerWidth - (userMenuRef.current?.getBoundingClientRect().right ?? 0),
                  }}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.user_metadata?.display_name || user?.email?.split("@")[0]}</p>
                    <p className="text-[10px] text-text3 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); router.push("/settings"); }}
                    className="w-full px-3 py-2 text-left text-sm text-text2 hover:bg-hover-row transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
                    Settings
                  </button>
                  <button
                    onClick={async () => { setUserMenuOpen(false); await signOut(); router.push("/login"); router.refresh(); }}
                    className="w-full px-3 py-2 text-left text-sm text-t-rose hover:bg-t-rose/10 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"/></svg>
                    Sign Out
                  </button>
                </div>
              </>,
              document.body
            )}
          </div>
          )}
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="glass-medium rounded-2xl px-3 lg:px-4 py-2 lg:py-2.5 relative">
        {/* Mobile search overlay */}
        {mobileSearchOpen && (
          <div className="lg:hidden absolute inset-0 z-20 flex items-center gap-2 px-3 py-2 bg-surface rounded-2xl border border-border-strong animate-slide-up">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></div>
              <input
                ref={mobileSearchRef}
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { if (!search) setMobileSearchOpen(false); else setSearch(""); } }}
                placeholder="Search skits..."
                className="w-full pl-9 pr-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
              />
            </div>
            <button
              onClick={() => { if (search) setSearch(""); else setMobileSearchOpen(false); }}
              className="p-2 rounded-xl text-text2 hover:text-foreground hover:bg-hover-row transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          {/* Mobile search button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className={`lg:hidden p-2 rounded-xl border transition ${
              search ? "bg-accent text-white border-accent" : "bg-input-bg text-text2 border-border hover:border-border-strong"
            }`}
          >
            <SearchIcon />
          </button>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0">
            <select
              value={searchField}
              onChange={e => { setSearchField(e.target.value as "all" | keyof Skit); setPage(0); }}
              className="shrink-0 h-[38px] px-2 pr-6 py-2 bg-input-bg border border-border rounded-xl text-xs font-medium text-text2 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition cursor-pointer appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
            >
              <option value="all">All Fields</option>
              <option value="inspiration">Title</option>
              <option value="script">Script</option>
              <option value="styleRef">Style Ref</option>
              <option value="environment">Environment</option>
              <option value="category">Category</option>
            </select>
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></div>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                placeholder={searchField === "all" ? "Search skits..." : `Search ${searchField === "styleRef" ? "Style Ref" : searchField === "inspiration" ? "Title" : searchField}...`}
                className="w-full pl-9 pr-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
              />
            </div>
          </div>

          {/* Category dropdown (custom) */}
          <div ref={catDropdownRef}>
            <button
              id="cat-dropdown-trigger"
              onClick={() => setCatDropdownOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                filterCat !== "All"
                  ? "bg-accent text-white border-accent"
                  : "bg-input-bg text-text2 border-border hover:border-border-strong"
              }`}
            >
              {filterCat === "All" ? `All Categories (${total})` : `${filterCat} (${skits.filter(s => s.category === filterCat).length})`}
              <svg className={`w-3.5 h-3.5 transition-transform ${catDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {catDropdownOpen && (() => {
              const trigger = document.getElementById("cat-dropdown-trigger");
              const rect = trigger?.getBoundingClientRect();
              return createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setCatDropdownOpen(false)} />
                  <div className="fixed w-56 dropdown-menu rounded-xl py-1 animate-slide-up" style={{ top: (rect?.bottom ?? 0) + 6, left: rect?.left ?? 0, zIndex: 9999 }}>
                    <button
                      onClick={() => { setFilterCat("All"); setCatDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        filterCat === "All" ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"
                      }`}
                    >
                      All Categories <span className="text-text3 ml-1">({total})</span>
                    </button>
                    {allCategories.map(c => {
                      const style = getCategoryStyle(c);
                      const count = skits.filter(s => s.category === c).length;
                      return (
                        <button
                          key={c}
                          onClick={() => { setFilterCat(c); setCatDropdownOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                            filterCat === c ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          {c} <span className="text-text3 ml-auto">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </>,
                document.body
              );
            })()}
          </div>

          {/* Status filter dropdown */}
          <div ref={statusDropdownRef}>
            <button
              id="status-dropdown-trigger"
              onClick={() => setStatusDropdownOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                filterStatus !== "All"
                  ? `${STATUS_STYLES[filterStatus]?.bg ?? "bg-input-bg"} ${STATUS_STYLES[filterStatus]?.text ?? "text-text2"} border-transparent`
                  : "bg-input-bg text-text2 border-border hover:border-border-strong"
              }`}
            >
              {filterStatus === "All"
                ? `All Status`
                : <>{STATUS_STYLES[filterStatus]?.icon} {filterStatus} <span className="opacity-60">({skits.filter(s => s.status === filterStatus).length})</span></>
              }
              <svg className={`w-3.5 h-3.5 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {statusDropdownOpen && (() => {
              const trigger = document.getElementById("status-dropdown-trigger");
              const rect = trigger?.getBoundingClientRect();
              return createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setStatusDropdownOpen(false)} />
                  <div className="fixed w-48 dropdown-menu rounded-xl py-1 animate-slide-up" style={{ top: (rect?.bottom ?? 0) + 6, left: rect?.left ?? 0, zIndex: 9999 }}>
                    <button
                      onClick={() => { setFilterStatus("All"); setStatusDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${filterStatus === "All" ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"}`}
                    >
                      All Statuses <span className="text-text3 ml-1">({total})</span>
                    </button>
                    {STATUSES.map(s => {
                      const st = STATUS_STYLES[s] || { icon: "", text: "text-text2" };
                      const count = skits.filter(sk => sk.status === s).length;
                      return (
                        <button
                          key={s}
                          onClick={() => { setFilterStatus(s); setStatusDropdownOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${filterStatus === s ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"}`}
                        >
                          <span className="text-sm">{st.icon}</span>
                          {s}
                          <span className="text-text3 ml-auto">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </>,
                document.body
              );
            })()}
          </div>

          {/* Approval filter dropdown */}
          <div ref={approvalDropdownRef}>
            <button
              id="approval-dropdown-trigger"
              onClick={() => setApprovalDropdownOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                filterApproval === "Active" || filterApproval === "All"
                  ? "bg-input-bg text-text2 border-border hover:border-border-strong"
                  : filterApproval === "Approved" ? "bg-t-green/15 text-t-green border-transparent"
                    : filterApproval === "Rejected" ? "bg-t-rose/15 text-t-rose border-transparent"
                    : "bg-t-amber/15 text-t-amber border-transparent"
              }`}
            >
              {filterApproval === "Active"
                ? "Approval"
                : filterApproval === "All"
                ? "All (incl. rejected)"
                : <>{filterApproval === "Approved" ? "✓" : filterApproval === "Rejected" ? "✕" : "◌"} {filterApproval} <span className="opacity-60">({skits.filter(s => filterApproval === "Pending" ? s.approved == null : filterApproval === "Approved" ? s.approved === true : s.approved === false).length})</span></>
              }
              <svg className={`w-3.5 h-3.5 transition-transform ${approvalDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {approvalDropdownOpen && (() => {
              const trigger = document.getElementById("approval-dropdown-trigger");
              const rect = trigger?.getBoundingClientRect();
              return createPortal(
                <>
                  <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setApprovalDropdownOpen(false)} />
                  <div className="fixed w-44 dropdown-menu rounded-xl py-1 animate-slide-up" style={{ top: (rect?.bottom ?? 0) + 6, left: rect?.left ?? 0, zIndex: 9999 }}>
                    {(["Active", "All", "Pending", "Approved", "Rejected"] as const).map(opt => {
                      const count = opt === "Active" ? skits.filter(s => s.approved !== false).length
                        : opt === "All" ? skits.length
                        : opt === "Pending" ? skits.filter(s => s.approved == null).length
                        : opt === "Approved" ? skits.filter(s => s.approved === true).length
                        : skits.filter(s => s.approved === false).length;
                      const icon = opt === "Active" ? "" : opt === "All" ? "" : opt === "Approved" ? "✓" : opt === "Rejected" ? "✕" : "◌";
                      const color = opt === "Approved" ? "text-t-green" : opt === "Rejected" ? "text-t-rose" : opt === "Pending" ? "text-t-amber" : "";
                      const label = opt === "Active" ? "Active (default)" : opt === "All" ? "All (incl. rejected)" : opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { setFilterApproval(opt); setApprovalDropdownOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${filterApproval === opt ? "bg-accent/10 text-accent" : "text-text2 hover:bg-hover-row"}`}
                        >
                          {icon && <span className={color}>{icon}</span>}
                          {label}
                          <span className="text-text3 ml-auto">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </>,
                document.body
              );
            })()}
          </div>

          {/* Category manager button (owner/editor only) */}
          {!readOnly && (
            <button
              onClick={() => setShowCatManager(true)}
              className="p-2 rounded-xl bg-input-bg border border-border text-text2 hover:border-border-strong hover:text-foreground transition focus:outline-none focus:ring-2 focus:ring-accent/20"
              title="Manage categories"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
            </button>
          )}

          {/* Cast filter */}
          <input
            type="number"
            min={1}
            placeholder="Cast #"
            value={filterCast}
            onChange={e => setFilterCast(e.target.value)}
            className="w-20 px-3 py-2 bg-input-bg border border-border rounded-xl text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Actions */}
          <div className="flex gap-2">
            {!readOnly && <button onClick={addRow} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover shadow-sm shadow-accent/20 transition">
              <PlusIcon /> Add
            </button>}
            {!readOnly && <button onClick={() => importFileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row hover:border-border-strong transition" title="Import CSV, Excel, or Reel Research files">
              <UploadIcon /> <span className="hidden lg:inline">Import</span>
            </button>}
            {!readOnly && <button onClick={() => setPasteLinksOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row hover:border-border-strong transition" title="Paste video URLs to import">
              <ClipboardIcon /> <span className="hidden lg:inline">Paste Links</span>
            </button>}
            <button onClick={downloadCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row hover:border-border-strong transition">
              <DownloadIcon /> <span className="hidden lg:inline">{selected.size > 0 ? `Export ${selected.size}` : "Export"}</span>
            </button>
            {!readOnly && selected.size > 0 && otherBoards.length > 0 && (
              <div className="relative">
                <button onClick={() => setBulkMoveOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-xs font-semibold rounded-lg border border-accent/30 hover:bg-accent/20 transition">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                  Move {selected.size}
                </button>
                {bulkMoveOpen && (
                  <>
                    <div className="fixed inset-0 z-[1]" onClick={() => setBulkMoveOpen(false)} />
                    <div className="dropdown-menu absolute right-0 top-full mt-1.5 z-[2] rounded-xl p-1.5 min-w-[200px] animate-slide-up">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-text3 uppercase tracking-wider">Move to board</div>
                      {otherBoards.map(b => (
                        <button key={b.id} onClick={() => {
                          const count = selected.size;
                          moveSkits(Array.from(selected), b.id);
                          setSelected(new Set());
                          setBulkMoveOpen(false);
                          showToast(`Moved ${count} row${count > 1 ? "s" : ""} to ${b.name}`);
                        }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-text2 hover:bg-hover-row transition truncate">
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {!readOnly && selected.size > 0 && (
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-t-rose/10 text-t-rose text-xs font-semibold rounded-lg border border-t-rose/30 hover:bg-t-rose/20 transition">
                <TrashIcon /> {selected.size}
              </button>
            )}
          </div>
          {!readOnly && <input ref={importFileRef} type="file" accept=".csv,.xlsx,.xls,.md,.txt,.markdown" onChange={handleUnifiedImport} className="hidden" />}
        </div>
      </div>

      {/* ─── Drag overlay ─── */}
      {!readOnly && dragging && (
        <div className="bg-accent/10 border-2 border-dashed border-accent/30 rounded-2xl py-8 text-center">
          <p className="text-accent font-semibold text-sm">Drop your CSV or Excel file here</p>
          <p className="text-accent/60 text-xs mt-1">CSV rows append directly · Excel files use AI Smart Import</p>
        </div>
      )}

      {/* ─── Table (desktop) ─── */}
      <div className="hidden lg:flex glass-strong rounded-2xl overflow-hidden flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <table
            ref={tableRef}
            tabIndex={0}
            onKeyDown={handleTableKeyDown}
            className="w-full outline-none table-fixed"
          >
            <colgroup>
              <col style={{ width: 40 }} />{/* checkbox */}
              <col style={{ width: 40 }} />{/* # */}
              {canReorder && <col style={{ width: 28 }} />}{/* drag handle */}
              {orderedColumns.map(col => (
                <col key={col.key} style={colWidths[col.key] ? { width: colWidths[col.key] } : undefined} />
              ))}
              <col style={{ width: 56 }} />{/* actions */}
            </colgroup>
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-center text-[11px] font-semibold text-text3 uppercase tracking-wider px-2 py-2.5 bg-page-bg/80 backdrop-blur-sm w-10 sticky top-0 z-10">
                  {!readOnly && (
                    <input
                      type="checkbox"
                      checked={selected.size === pageData.length && pageData.length > 0}
                      onChange={toggleSelectAll}
                      className="fancy-check"
                    />
                  )}
                </th>
                <th onClick={handleSortById} className="group/th text-center text-[11px] font-semibold text-text3 uppercase tracking-wider px-2 py-2.5 bg-page-bg/80 backdrop-blur-sm w-10 sticky top-0 z-10 select-none hover:text-text2 transition">
                  #
                  {sortById === "asc" ? <SortAsc /> : sortById === "desc" ? <SortDesc /> : <SortNeutral />}
                </th>
                {canReorder && <th className="w-7 bg-page-bg/80 backdrop-blur-sm sticky top-0 z-10" />}
                {orderedColumns.map(col => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData("text/plain", col.key); setDragColKey(col.key); }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverColKey(col.key); }}
                    onDragLeave={() => setDragOverColKey(null)}
                    onDrop={e => {
                      e.preventDefault(); e.stopPropagation();
                      const from = e.dataTransfer.getData("text/plain");
                      if (!from || from === col.key) { setDragColKey(null); setDragOverColKey(null); return; }
                      setColOrder(prev => {
                        const arr = [...prev];
                        const fi = arr.indexOf(from), ti = arr.indexOf(col.key);
                        if (fi < 0 || ti < 0) return prev;
                        arr.splice(fi, 1);
                        arr.splice(ti, 0, from);
                        return arr;
                      });
                      setDragColKey(null); setDragOverColKey(null);
                    }}
                    onDragEnd={() => { setDragColKey(null); setDragOverColKey(null); }}
                    onClick={() => handleSort(col.key)}
                    className={`group/th relative text-left text-[11px] font-semibold text-text3 uppercase tracking-wider px-3 py-2.5 bg-page-bg/80 backdrop-blur-sm sticky top-0 z-10 select-none hover:text-text2 transition overflow-hidden whitespace-nowrap cursor-grab active:cursor-grabbing
                      ${dragColKey === col.key ? "opacity-40" : ""}
                      ${dragOverColKey === col.key && dragColKey !== col.key ? "border-l-2 border-accent" : ""}
                    `}
                  >
                    {col.label}
                    {sortCol === col.key ? (sortAsc ? <SortAsc /> : <SortDesc />) : <SortNeutral />}
                    {col.resizable && (
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-accent/40 transition-colors z-20"
                        onMouseDown={e => startResize(e, col.key)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </th>
                ))}
                <th className="w-8 bg-page-bg/80 backdrop-blur-sm sticky top-0 z-10" />
              </tr>
            </thead>
            <tbody>
              {pageData.map((skit, rowIdx) => {
                const globalIdx = (pageSize === 0 ? 0 : safePage * effectivePageSize) + rowIdx + 1;
                const isSelected = selected.has(skit.id);
                const isActiveRow = activeCell?.[0] === rowIdx;
                return (
                  <tr
                    key={skit.id}
                    draggable={canReorder}
                    onDragStart={canReorder ? (e) => { e.stopPropagation(); setDragRowId(skit.id); } : undefined}
                    onDragOver={canReorder ? (e) => { e.preventDefault(); e.stopPropagation(); setDragOverRowId(skit.id); } : undefined}
                    onDragLeave={canReorder ? () => setDragOverRowId(null) : undefined}
                    onDrop={canReorder ? (e) => {
                      e.preventDefault();
                      if (!dragRowId || dragRowId === skit.id) { setDragRowId(null); setDragOverRowId(null); return; }
                      const from = skits.findIndex(s => s.id === dragRowId);
                      const to = skits.findIndex(s => s.id === skit.id);
                      if (from < 0 || to < 0) { setDragRowId(null); setDragOverRowId(null); return; }
                      const reordered = [...skits];
                      const [moved] = reordered.splice(from, 1);
                      reordered.splice(to, 0, moved);
                      const withOrder = reordered.map((s, i) => ({ ...s, sort_order: i }));
                      persist(withOrder);
                      setDragRowId(null);
                      setDragOverRowId(null);
                    } : undefined}
                    onDragEnd={canReorder ? () => { setDragRowId(null); setDragOverRowId(null); } : undefined}
                    className={`border-b transition-colors group
                      ${dragOverRowId === skit.id ? "border-accent border-t-2" : "border-border/50"}
                      ${dragRowId === skit.id ? "opacity-40" : ""}
                      ${isActiveRow ? "bg-accent/5" : isSelected ? "bg-accent/5" : "bg-transparent"}
                      hover:bg-hover-row
                    `}
                  >
                    <td className="text-center px-2 py-2">
                      {!readOnly && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(skit.id)}
                          className="fancy-check"
                        />
                      )}
                    </td>
                    <td className="text-center px-2 py-2 text-[11px] text-text3 font-mono">{globalIdx}</td>
                    {canReorder && (
                      <td className="px-1 py-2 text-text3/40 cursor-grab active:cursor-grabbing select-none text-center text-sm">⠿</td>
                    )}
                    {orderedColumns.map((col, colIdx) => (
                      <td
                        key={col.key}
                        className="px-2 py-1.5 overflow-hidden"
                        onMouseEnter={TOOLTIP_COLS.has(col.key) && String(skit[col.key] ?? "").length > 6 ? (e) => {
                          clearTimeout(hoverTimer.current);
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const tipText = col.key === "styleRef"
                            ? (influencers.find(i => i.handle === skit.styleRef)?.name || skit.styleRef || "")
                            : String(skit[col.key] ?? "");
                          hoverTimer.current = setTimeout(() => setHoverTooltip({ text: tipText, x: rect.left, y: rect.bottom, col: col.key }), 600);
                        } : undefined}
                        onMouseMove={TOOLTIP_COLS.has(col.key) && String(skit[col.key] ?? "").length > 6 && !hoverTooltip ? (e) => {
                          if (hoverTimer.current) return;
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const tipText = col.key === "styleRef"
                            ? (influencers.find(i => i.handle === skit.styleRef)?.name || skit.styleRef || "")
                            : String(skit[col.key] ?? "");
                          hoverTimer.current = setTimeout(() => setHoverTooltip({ text: tipText, x: rect.left, y: rect.bottom, col: col.key }), 600);
                        } : undefined}
                        onMouseLeave={TOOLTIP_COLS.has(col.key) ? () => { clearTimeout(hoverTimer.current); hoverTimer.current = undefined; setHoverTooltip(null); } : undefined}
                      >
                        {renderCell(skit, colIdx, rowIdx)}
                      </td>
                    ))}
                    <td className="px-1 py-1.5">
                      {!readOnly && (
                        <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-all">
                          {otherBoards.length > 0 && (
                            <>
                              <button
                                onClick={() => setRowMoveId(prev => prev === skit.id ? null : skit.id)}
                                className="p-1.5 rounded-md text-text3 hover:text-accent hover:bg-accent/10 transition-all"
                                title="Move to board"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                              </button>
                              {rowMoveId === skit.id && (
                                <>
                                  <div className="fixed inset-0 z-[1]" onClick={() => setRowMoveId(null)} />
                                  <div className="dropdown-menu absolute right-0 top-full mt-1 z-[2] rounded-xl p-1.5 min-w-[180px] animate-slide-up">
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-text3 uppercase tracking-wider">Move to</div>
                                    {otherBoards.map(b => (
                                      <button key={b.id} onClick={() => {
                                        moveSkits([skit.id], b.id);
                                        setRowMoveId(null);
                                        showToast(`Moved to ${b.name}`);
                                      }} className="w-full text-left px-3 py-2 rounded-lg text-xs text-text2 hover:bg-hover-row transition truncate">
                                        {b.name}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => setDeleteRowId(skit.id)}
                            className="p-1.5 rounded-md text-text3 hover:text-t-rose hover:bg-t-rose/10 transition-all"
                            title="Delete row"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={orderedColumns.length + 3 + (canReorder ? 1 : 0)} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-text3/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                      <p className="text-sm text-text3">{skits.length === 0 ? "No skits yet" : "No skits match your filters"}</p>
                      {skits.length === 0 && <p className="text-xs text-text3/60">Click Add to get started</p>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar pageSize={pageSize} setPageSize={setPageSize} setPage={setPage} safePage={safePage} totalFiltered={totalFiltered} totalPages={totalPages} effectivePageSize={effectivePageSize} />
      </div>

      {/* ─── Mobile card list ─── */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col glass-strong rounded-2xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
          {pageData.map((skit, rowIdx) => {
            const globalIdx = (pageSize === 0 ? 0 : safePage * effectivePageSize) + rowIdx + 1;
            return <MobileSkitCard key={skit.id} skit={skit} globalIdx={globalIdx} />;
          })}
          {pageData.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <svg className="w-10 h-10 text-text3/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
              <p className="text-sm text-text3">{skits.length === 0 ? "No skits yet" : "No skits match your filters"}</p>
              {skits.length === 0 && <p className="text-xs text-text3/60">Tap Add to get started</p>}
            </div>
          )}
        </div>
        <PaginationBar pageSize={pageSize} setPageSize={setPageSize} setPage={setPage} safePage={safePage} totalFiltered={totalFiltered} totalPages={totalPages} effectivePageSize={effectivePageSize} />
      </div>


      </>}

      {/* ═══════════════════════════════════════════════
         FULL-SCREEN SCRIPT EDITOR
         ═══════════════════════════════════════════════ */}
      {editorOpen && (
        <div className="fixed inset-0 z-[999] bg-surface flex flex-col animate-editor-in overflow-hidden">
          {/* ══ TOP BAR ══ */}
          <div className="shrink-0 border-b border-border/50 bg-input-bg">
            {/* Row 1: Mobile = compact, Desktop = full */}
            <div className="px-3 lg:px-4 py-2 flex items-center gap-2">
              {/* Back */}
              <button onClick={() => { if (scriptEditing) setScriptEditing(false); setScriptEditorSkitId(null); }} className="p-1.5 -ml-1 rounded-lg hover:bg-hover-row transition text-text2" title="Close (Esc)">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
              </button>

              {/* Mobile: tappable title */}
              <button
                onClick={() => setShowDetails(d => !d)}
                className="lg:hidden flex-1 min-w-0 flex items-center gap-1 text-left"
              >
                <span className="text-sm font-semibold text-foreground truncate">{editingSkit.inspiration || "Untitled"}</span>
                <svg className={`w-3.5 h-3.5 text-text3 shrink-0 transition-transform ${showDetails ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>

              {/* Prev / Next nav */}
              <div className="flex items-center gap-0.5 border border-border rounded-lg px-0.5 py-0.5">
                <button onClick={() => prevSkitId && setScriptEditorSkitId(prevSkitId)} disabled={!prevSkitId} className="p-1 rounded hover:bg-hover-row transition text-text2 disabled:text-text3 disabled:cursor-not-allowed" title="Previous (Ctrl+↑)">
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/></svg>
                </button>
                <span className="text-[10px] text-text3 font-medium px-1 min-w-[2.5rem] lg:min-w-[3.5rem] text-center">{editorIdx + 1}/{filtered.length}</span>
                <button onClick={() => nextSkitId && setScriptEditorSkitId(nextSkitId)} disabled={!nextSkitId} className="p-1 rounded hover:bg-hover-row transition text-text2 disabled:text-text3 disabled:cursor-not-allowed" title="Next (Ctrl+↓)">
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
                </button>
              </div>

              {/* Public / Private toggle — owner/editor only */}
              {!readOnly && (
                <button
                  onClick={() => {
                    const updated = skits.map(s =>
                      s.id === editingSkit.id ? { ...s, isPublic: !editingSkit.isPublic } : s
                    );
                    persist(updated);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                    editingSkit.isPublic
                      ? "bg-t-green/15 text-t-green border-t-green/30"
                      : "bg-input-bg text-text2 hover:bg-hover-row border-border"
                  }`}
                  title={editingSkit.isPublic ? "Make private" : "Make public"}
                >
                  {editingSkit.isPublic ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                  )}
                  <span className="hidden lg:inline">{editingSkit.isPublic ? "Public" : "Private"}</span>
                </button>
              )}

              {/* Copy Script Link */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/script/${editingSkit.id}`;
                  navigator.clipboard.writeText(url);
                  setScriptLinkCopied(true);
                  setTimeout(() => setScriptLinkCopied(false), 2000);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  scriptLinkCopied
                    ? "bg-t-green/15 text-t-green"
                    : "bg-input-bg text-text2 hover:bg-hover-row border border-border"
                }`}
                title="Copy script link"
              >
                {scriptLinkCopied ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
                )}
                <span className="hidden lg:inline">{scriptLinkCopied ? "Copied!" : "Copy Link"}</span>
              </button>

              {/* Desktop spacer */}
              <div className="hidden lg:block flex-1" />

              {/* Character filter pills (desktop only) */}
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[10px] text-text3 uppercase tracking-wider mr-1">Filter:</span>
                <button onClick={() => setCharFilter("All")} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${charFilter === "All" ? "bg-accent text-white shadow-sm" : "bg-input-bg text-text2 hover:bg-hover-row"}`}>All</button>
                {editorChars.map(c => (
                  <button key={c} onClick={() => setCharFilter(f => f === c ? "All" : c)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${charFilter === c ? "bg-accent text-white shadow-sm" : "bg-input-bg text-text2 hover:bg-hover-row"}`}>{c}</button>
                ))}
                <button onClick={() => setCharFilter(f => f === "[Direction]" ? "All" : "[Direction]")} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${charFilter === "[Direction]" ? "bg-t-amber text-white shadow-sm" : "bg-input-bg text-text2 hover:bg-hover-row"}`}>Directions</button>
              </div>

              {/* Template (desktop only — owner/editor only) */}
              {!readOnly && (
                <button
                  onClick={() => { if (!editingSkit.script) { updateSkit(editingSkit.id, "script", SCRIPT_TEMPLATE); showToast("Template inserted"); } else { setShowTemplate(t => !t); } }}
                  className={`hidden lg:block p-1.5 rounded-lg transition ${showTemplate ? "bg-accent/10 text-accent" : "hover:bg-hover-row text-text2"}`}
                  title={editingSkit.script ? "Show template reference" : "Insert template"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                </button>
              )}

              {/* Edit / Save / Cancel (owner/editor only) */}
              {!readOnly && scriptEditing ? (
                <div className="hidden lg:flex items-center gap-1.5">
                  <button
                    onClick={() => { setScriptEditing(false); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-text2 hover:bg-hover-row transition"
                  >Cancel</button>
                  <button
                    onClick={() => { updateSkit(editingSkit.id, "script", scriptDraft); setScriptEditing(false); showToast("Script saved"); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-t-green text-white hover:bg-t-green/80 shadow-sm transition"
                  >Save</button>
                </div>
              ) : !readOnly ? (
                <button
                  onClick={() => { setScriptDraft(editingSkit.script); setScriptEditing(true); }}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-white hover:bg-accent-hover shadow-sm transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                  Edit
                </button>
              ) : null}

              {/* Close */}
              <button onClick={() => { if (scriptEditing) { setScriptEditing(false); } setScriptEditorSkitId(null); }} className="p-1.5 rounded-lg hover:bg-hover-row transition text-text2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Desktop Row 2: Title + metadata (hidden on mobile) */}
            <div className="hidden lg:flex px-4 pb-2.5 items-center gap-2.5 flex-wrap">
              <h2 className="text-sm font-semibold text-foreground truncate max-w-[400px]">{editingSkit.inspiration || "Untitled Skit"}</h2>
              {editingSkit.category && (() => { const cs = getCategoryStyle(editingSkit.category); return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cs.bg} ${cs.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />{editingSkit.category}
                </span>
              ); })()}
              {(() => { const ss = STATUS_STYLES[editingSkit.status]; return ss ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${ss.bg} ${ss.text}`}>
                  <span className="text-[10px]">{ss.icon}</span>{editingSkit.status}
                </span>
              ) : null; })()}
              <span className="text-[11px] text-text3">{editingSkit.castSize} cast &middot; {editingSkit.characters}</span>
              {editingSkit.styleRef && (() => { const inf = influencers.find(i => i.handle === editingSkit.styleRef); return <span className="inline-flex items-center gap-1 text-[11px] text-text2">{inf ? <><span className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-[7px] font-bold text-accent">{inf.avatar}</span>{inf.handle}</> : editingSkit.styleRef}</span>; })()}
              <span className="text-[11px] text-text3">
                {activeScript ? `${activeScript.split("\n").filter((l: string) => l.trim()).length} lines · ${activeScript.split(/\s+/).filter(Boolean).length} words` : "Empty"}
              </span>
            </div>

            {/* Mobile: Collapsible detail card */}
            {showDetails && (
              <div className="lg:hidden px-3 pb-2.5 animate-slide-up">
                <div className="flex items-center gap-2 flex-wrap">
                  {editingSkit.category && (() => { const cs = getCategoryStyle(editingSkit.category); return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cs.bg} ${cs.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />{editingSkit.category}
                    </span>
                  ); })()}
                  {(() => { const ss = STATUS_STYLES[editingSkit.status]; return ss ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${ss.bg} ${ss.text}`}>
                      <span className="text-[10px]">{ss.icon}</span>{editingSkit.status}
                    </span>
                  ) : null; })()}
                  <span className="text-[11px] text-text3">{editingSkit.castSize} cast &middot; {editingSkit.characters}</span>
                  {editingSkit.styleRef && (() => { const inf = influencers.find(i => i.handle === editingSkit.styleRef); return <span className="inline-flex items-center gap-1 text-[11px] text-text2">{inf ? <><span className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-[7px] font-bold text-accent">{inf.avatar}</span>{inf.handle}</> : editingSkit.styleRef}</span>; })()}
                  {editingSkit.environment && <span className="text-[11px] text-text3">{editingSkit.environment}</span>}
                  <span className="text-[11px] text-text3">
                    {activeScript ? `${activeScript.split("\n").filter((l: string) => l.trim()).length}L · ${activeScript.split(/\s+/).filter(Boolean).length}W` : "Empty"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Template reference overlay ── */}
          {showTemplate && editingSkit.script && (
            <div className="shrink-0 border-b border-t-amber/30 bg-t-amber/10 px-3 lg:px-4 py-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-t-amber">Script Template Reference</span>
                <button onClick={() => setShowTemplate(false)} className="text-t-amber hover:text-t-amber text-xs">Dismiss</button>
              </div>
              <pre className="text-xs text-t-amber font-mono whitespace-pre-wrap leading-relaxed">{SCRIPT_TEMPLATE}</pre>
            </div>
          )}

          {/* ══ MAIN CONTENT ══ */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Textarea / Filtered view */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {charFilter === "All" ? (
                scriptEditing ? (
                  <textarea
                    ref={scriptTextareaRef}
                    value={scriptDraft}
                    onChange={e => setScriptDraft(e.target.value)}
                    onFocus={() => setShowDetails(false)}
                    onPaste={e => {
                      const text = e.clipboardData.getData("text/plain");
                      if (text) {
                        e.preventDefault();
                        const cleaned = text
                          .replace(/\r\n/g, "\n").replace(/\r/g, "\n")
                          .replace(/[•●◦▪▸►⁃]/g, "-")
                          .replace(/\n{3,}/g, "\n\n")
                          .split("\n").map(l => l.trimEnd()).join("\n");
                        const ta = e.currentTarget;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const newVal = ta.value.slice(0, start) + cleaned + ta.value.slice(end);
                        setScriptDraft(newVal);
                        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + cleaned.length; });
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const ta = e.currentTarget;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const newVal = ta.value.slice(0, start) + "  " + ta.value.slice(end);
                        setScriptDraft(newVal);
                        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
                      }
                    }}
                    placeholder={"Write your script here...\n\nA: First character line\nB: Second character line"}
                    className="flex-1 w-full resize-none p-3 lg:p-6 text-base leading-relaxed font-mono bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-text3 text-foreground"
                    autoFocus
                  />
                ) : (
                  /* Read-only view */
                  <div className="flex-1 overflow-y-auto p-3 lg:p-6">
                    {editingSkit.script ? (
                      <pre className="text-base leading-relaxed font-mono whitespace-pre-wrap text-foreground">{editingSkit.script}</pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-16">
                        <svg className="w-12 h-12 text-text3 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                        <p className="text-sm text-text3 mb-3">No script yet</p>
                        {!readOnly && (
                          <button
                            onClick={() => { setScriptDraft(""); setScriptEditing(true); }}
                            className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg shadow hover:bg-accent-hover transition"
                          >
                            Start Writing
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Filtered view */
                <div className="flex-1 overflow-y-auto p-3 lg:p-6">
                  {/* Filter header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <span className="text-xs font-semibold text-text2">
                      {charFilter === "[Direction]" ? "Directions" : `${charFilter}'s lines`}
                    </span>
                    <span className="text-[10px] text-text3 bg-input-bg px-1.5 py-0.5 rounded-full">{filteredLines.length}</span>
                    <div className="flex-1" />
                    <button onClick={() => setCharFilter("All")} className="text-[11px] text-accent hover:text-accent-hover font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                      Clear
                    </button>
                  </div>
                  {filteredLines.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-10 h-10 text-text3 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
                      <p className="text-sm text-text3">No lines for &ldquo;{charFilter}&rdquo;</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredLines.map((pl, i) => (
                        <div key={`${pl.lineNum}-${i}`} className="flex gap-2 py-1 rounded hover:bg-hover-row transition">
                          <span className="hidden lg:block text-[10px] text-text3 font-mono w-5 text-right shrink-0 pt-0.5">{pl.lineNum + 1}</span>
                          <span className={`text-sm font-mono leading-relaxed ${pl.char === "[Direction]" ? "text-t-amber italic" : "text-foreground"}`}>
                            {pl.line}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Character line viewer (desktop only) */}
            {charFilter === "All" && (
              <div className="hidden lg:flex flex-col w-80 border-l border-border bg-transparent overflow-hidden">
                <div className="shrink-0 px-4 py-3 border-b border-border glass-subtle">
                  <p className="text-xs font-semibold text-text2 uppercase tracking-wider">Character Lines</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {editorChars.map(c => {
                      const count = parsedLines.filter(l => l.char === c).length;
                      return (
                        <button key={c} onClick={() => setCharFilter(c)} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-input-bg text-text2 hover:bg-accent/15 hover:text-accent transition">{c} ({count})</button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {parsedLines.length === 0 ? (
                    <p className="text-xs text-text3 text-center py-8">Script is empty</p>
                  ) : (
                    <div className="space-y-0.5">
                      {parsedLines.map((pl, i) => (
                        <div key={`${pl.lineNum}-${i}`} className={`text-[11px] font-mono leading-relaxed px-2 py-1 rounded transition ${pl.char === "[Direction]" ? "text-t-amber/60 italic" : "text-text2"}`}>
                          <span className={`font-bold ${pl.char === "[Direction]" ? "text-t-amber" : "text-accent"}`}>{pl.char === "[Direction]" ? "▸" : pl.char + ":"}</span>{" "}
                          {pl.char === "[Direction]" ? pl.line : pl.line.replace(/^\s*[^:]+:\s*/, "")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══ BOTTOM BAR — Mobile only ══ */}
          <div className="lg:hidden shrink-0 border-t border-border glass-subtle pb-[env(safe-area-inset-bottom)]">
            {/* Character filter dropdown */}
            <div className="px-3 pt-2 pb-1.5">
              <button
                id="char-dropdown-trigger"
                onClick={() => setShowCharDropdown(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-input-bg border border-border text-sm font-medium text-foreground transition hover:border-border-strong"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>
                  {charFilter === "All" ? "All Characters" : charFilter === "[Direction]" ? "Directions" : charFilter}
                  {charFilter !== "All" && (
                    <span className="text-[11px] text-text3 font-normal">
                      ({parsedLines.filter(l => l.char === charFilter).length} lines)
                    </span>
                  )}
                </span>
                <svg className={`w-4 h-4 text-text3 transition-transform ${showCharDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {showCharDropdown && (() => {
                const trigger = document.getElementById("char-dropdown-trigger");
                const rect = trigger?.getBoundingClientRect();
                return createPortal(
                  <>
                    <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setShowCharDropdown(false)} />
                    <div className="fixed dropdown-menu rounded-xl py-1 max-h-52 overflow-y-auto animate-slide-up" style={{ bottom: window.innerHeight - (rect?.top ?? 0) + 6, left: rect?.left ?? 12, width: (rect?.width ?? 300), zIndex: 9999 }}>
                      <button
                        onClick={() => { setCharFilter("All"); setShowCharDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition ${charFilter === "All" ? "bg-accent/10 text-accent font-semibold" : "text-text2 hover:bg-hover-row"}`}
                      >
                        <span>All Characters</span>
                        <span className="text-[11px] text-text3">{parsedLines.length} lines</span>
                      </button>
                      {editorChars.map(c => {
                        const count = parsedLines.filter(l => l.char === c).length;
                        return (
                          <button
                            key={c}
                            onClick={() => { setCharFilter(c); setShowCharDropdown(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition ${charFilter === c ? "bg-accent/10 text-accent font-semibold" : "text-text2 hover:bg-hover-row"}`}
                          >
                            <span>{c}</span>
                            <span className="text-[11px] text-text3">{count} lines</span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => { setCharFilter("[Direction]"); setShowCharDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition ${charFilter === "[Direction]" ? "bg-t-amber/10 text-t-amber font-semibold" : "text-text2 hover:bg-hover-row"}`}
                      >
                        <span>Directions</span>
                        <span className="text-[11px] text-text3">{parsedLines.filter(l => l.char === "[Direction]").length} lines</span>
                      </button>
                    </div>
                  </>,
                  document.body
                );
              })()}
            </div>
            {/* Actions row */}
            <div className="flex items-center gap-2 px-3 pb-3">
              <span className="text-[11px] text-text3">
                {activeScript ? `${activeScript.split("\n").filter((l: string) => l.trim()).length}L · ${activeScript.split(/\s+/).filter(Boolean).length}W` : "Empty"}
              </span>
              <div className="flex-1" />
              {!readOnly && (
                <button
                  onClick={() => { if (!editingSkit.script) { updateSkit(editingSkit.id, "script", SCRIPT_TEMPLATE); showToast("Template inserted"); } else { setShowTemplate(t => !t); } }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${showTemplate ? "bg-accent/10 text-accent" : "bg-input-bg text-text2"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
                  Template
                </button>
              )}
              {!readOnly && scriptEditing ? (
                <>
                  <button onClick={() => setScriptEditing(false)} className="px-3 py-1.5 text-xs font-medium text-text2 rounded-lg hover:bg-hover-row transition">
                    Cancel
                  </button>
                  <button onClick={() => { updateSkit(editingSkit.id, "script", scriptDraft); setScriptEditing(false); showToast("Script saved"); }} className="px-4 py-1.5 bg-t-green text-white text-xs font-semibold rounded-lg shadow hover:bg-t-green/80 transition">
                    Save
                  </button>
                </>
              ) : (
                <>
                  {!readOnly && (
                    <button
                      onClick={() => { setScriptDraft(editingSkit.script); setScriptEditing(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg shadow hover:bg-accent-hover transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                      Edit
                    </button>
                  )}
                  <button onClick={() => { if (scriptEditing) setScriptEditing(false); setScriptEditorSkitId(null); }} className="px-4 py-1.5 bg-input-bg text-text2 text-xs font-semibold rounded-lg hover:bg-hover-row transition">
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteConfirm && selected.size > 0 && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-sm dropdown-menu rounded-2xl shadow-2xl animate-slide-up" style={{ pointerEvents: "auto" }}>
              <div className="px-5 pt-5 pb-4 text-center">
                <div className="w-12 h-12 rounded-full bg-t-rose/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-t-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">Delete {selected.size} skit{selected.size > 1 ? "s" : ""}?</h3>
                <p className="text-xs text-text3 mt-1.5">This action can be undone with the undo button in the toast notification.</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); if (!readOnly) deleteSelected(); }}
                  className="flex-1 px-4 py-2 bg-t-rose text-white text-xs font-bold rounded-lg hover:bg-t-rose/90 shadow-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Single Row Delete Confirmation ─── */}
      {deleteRowId && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setDeleteRowId(null)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-sm dropdown-menu rounded-2xl shadow-2xl animate-slide-up" style={{ pointerEvents: "auto" }}>
              <div className="px-5 pt-5 pb-4 text-center">
                <div className="w-12 h-12 rounded-full bg-t-rose/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-t-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">Delete this skit?</h3>
                <p className="text-xs text-text2 mt-1.5 truncate max-w-[260px] mx-auto">{skits.find(s => s.id === deleteRowId)?.inspiration || "Untitled"}</p>
              </div>
              <div className="flex gap-2 px-5 pb-5">
                <button
                  onClick={() => setDeleteRowId(null)}
                  className="flex-1 px-4 py-2 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!readOnly) {
                      const snapshot = [...skits];
                      if (deleteRowId) deleteSkits([deleteRowId]);
                      setExpandedCardId(null);
                      showToast("Row deleted", () => persist(snapshot));
                    }
                    setDeleteRowId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-t-rose text-white text-xs font-bold rounded-lg hover:bg-t-rose/90 shadow-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Category Manager Modal ─── */}
      {showCatManager && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => { setShowCatManager(false); setEditingCatIdx(null); setNewCatName(""); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-md dropdown-menu rounded-2xl shadow-2xl" style={{ pointerEvents: "auto" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Manage Categories</h3>
                  <p className="text-[11px] text-text3 mt-0.5">{categories.length} categories</p>
                </div>
                <button
                  onClick={() => { setShowCatManager(false); setEditingCatIdx(null); setNewCatName(""); }}
                  className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Category list */}
              <div className="px-3 pb-2 max-h-[50vh] overflow-y-auto">
                {categories.map((cat, idx) => {
                  const style = getCategoryStyle(cat);
                  const count = skits.filter(s => s.category === cat).length;
                  const isEditing = editingCatIdx === idx;

                  return (
                    <div key={idx} className="group flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-hover-row transition">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingCatName}
                          onChange={e => setEditingCatName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && editingCatName.trim()) {
                              const oldName = categories[idx];
                              const newName = editingCatName.trim();
                              if (newName !== oldName) {
                                const newCats = [...categories];
                                newCats[idx] = newName;
                                persistCategories(newCats);
                                // Update all skits with old category name
                                persist(skits.map(s => s.category === oldName ? { ...s, category: newName } : s));
                                showToast(`Renamed "${oldName}" → "${newName}"`);
                              }
                              setEditingCatIdx(null);
                            } else if (e.key === "Escape") {
                              setEditingCatIdx(null);
                            }
                          }}
                          onBlur={() => {
                            if (editingCatName.trim() && editingCatName.trim() !== categories[idx]) {
                              const oldName = categories[idx];
                              const newName = editingCatName.trim();
                              const newCats = [...categories];
                              newCats[idx] = newName;
                              persistCategories(newCats);
                              persist(skits.map(s => s.category === oldName ? { ...s, category: newName } : s));
                              showToast(`Renamed "${oldName}" → "${newName}"`);
                            }
                            setEditingCatIdx(null);
                          }}
                          className="flex-1 px-2 py-1 bg-input-bg border border-accent rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      ) : (
                        <span className="flex-1 text-xs font-medium text-foreground">{cat}</span>
                      )}
                      {!isEditing && (
                        <span className="text-[10px] text-text3 tabular-nums mr-1">{count}</span>
                      )}
                      {!isEditing && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Rename */}
                          <button
                            onClick={() => { setEditingCatIdx(idx); setEditingCatName(cat); }}
                            className="p-1.5 rounded-lg text-text3 hover:text-accent hover:bg-accent/10 transition"
                            title="Rename"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              const catName = categories[idx];
                              const newCats = categories.filter((_, i) => i !== idx);
                              persistCategories(newCats);
                              // Reset affected skits to first available category
                              const fallback = newCats[0] || "Uncategorized";
                              persist(skits.map(s => s.category === catName ? { ...s, category: fallback } : s));
                              if (filterCat === catName) setFilterCat("All");
                              showToast(`Deleted "${catName}" — ${skits.filter(s => s.category === catName).length} skits moved to "${fallback}"`);
                            }}
                            className="p-1.5 rounded-lg text-text3 hover:text-t-rose hover:bg-t-rose/10 transition"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add new category */}
              <div className="px-5 pb-5 pt-2 border-t border-border">
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-text3 flex-shrink-0" />
                  <input
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && newCatName.trim()) {
                        const name = newCatName.trim();
                        if (categories.includes(name)) {
                          showToast(`"${name}" already exists`);
                          return;
                        }
                        persistCategories([...categories, name]);
                        setNewCatName("");
                        showToast(`Added "${name}"`);
                      }
                    }}
                    placeholder="New category name..."
                    className="flex-1 px-2 py-1.5 bg-input-bg border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition"
                  />
                  <button
                    onClick={() => {
                      if (!newCatName.trim()) return;
                      const name = newCatName.trim();
                      if (categories.includes(name)) {
                        showToast(`"${name}" already exists`);
                        return;
                      }
                      persistCategories([...categories, name]);
                      setNewCatName("");
                      showToast(`Added "${name}"`);
                    }}
                    disabled={!newCatName.trim()}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Keyboard Shortcuts Modal ─── */}
      {shortcutsOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setShortcutsOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-sm dropdown-menu rounded-2xl shadow-2xl animate-slide-up" style={{ pointerEvents: "auto" }} onKeyDown={e => { if (e.key === "Escape") setShortcutsOpen(false); }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="16" rx="2"/><path strokeLinecap="round" d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/></svg>
                  Keyboard Shortcuts
                </h3>
                <button onClick={() => setShortcutsOpen(false)} className="p-1 rounded-lg hover:bg-hover-row text-text3 hover:text-foreground transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-5 pb-4 space-y-3">
                {/* Script Editor */}
                <div>
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1.5">Script Editor</p>
                  <div className="space-y-1">
                    {([["Ctrl + \u2191", "Previous skit"], ["Ctrl + \u2193", "Next skit"], ["Ctrl + Enter", "Save & close"], ["Escape", "Close editor"], ["Tab", "Insert indent"]] as const).map(([key, desc]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1">{key.split(" + ").map(k => <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-input-bg border border-border rounded text-text2">{k}</kbd>)}</span>
                        <span className="text-[11px] text-text3">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Table Navigation */}
                <div>
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1.5">Table Navigation</p>
                  <div className="space-y-1">
                    {([["Tab", "Next cell"], ["Shift + Tab", "Previous cell"], ["\u2191 / \u2193", "Move between rows"], ["Enter", "Next row / open script"], ["Escape", "Deselect cell"]] as const).map(([key, desc]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1">{key.includes(" / ") ? key.split(" / ").map((k, i) => <span key={k} className="inline-flex items-center gap-1">{i > 0 && <span className="text-text3 text-[10px]">/</span>}<kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-input-bg border border-border rounded text-text2">{k}</kbd></span>) : key.split(" + ").map(k => <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-input-bg border border-border rounded text-text2">{k}</kbd>)}</span>
                        <span className="text-[11px] text-text3">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dropdowns */}
                <div>
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1.5">Dropdowns</p>
                  <div className="space-y-1">
                    {([["\u2191 / \u2193", "Navigate options"], ["Enter / Space", "Select option"], ["Escape", "Close dropdown"]] as const).map(([key, desc]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1">{key.includes(" / ") ? key.split(" / ").map((k, i) => <span key={k} className="inline-flex items-center gap-1">{i > 0 && <span className="text-text3 text-[10px]">/</span>}<kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-input-bg border border-border rounded text-text2">{k}</kbd></span>) : key.split(" + ").map(k => <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-input-bg border border-border rounded text-text2">{k}</kbd>)}</span>
                        <span className="text-[11px] text-text3">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── AI Script Assistant Modal — Chat UI ─── */}
      {aiPopupOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setAiPopupOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-5xl dropdown-menu rounded-2xl shadow-2xl animate-slide-up flex flex-col" style={{ pointerEvents: "auto", height: "90vh" }} onKeyDown={e => { if (e.key === "Escape") setAiPopupOpen(false); }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
                  AI Script Assistant
                </h3>
                <div className="flex items-center gap-1.5">
                  {aiMessages.length > 0 && (
                    <button onClick={() => setAiMessages([])} className="px-2 py-1 rounded-lg text-[10px] font-semibold text-text3 hover:text-foreground hover:bg-hover-row transition" title="New Chat">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                    </button>
                  )}
                  <button onClick={() => setAiPopupOpen(false)} className="p-1 rounded-lg hover:bg-hover-row text-text3 hover:text-foreground transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              {/* Task selector */}
              <div className="px-5 pb-2 flex items-center gap-2 shrink-0">
                <div className="relative">
                  <button
                    ref={aiTaskBtnRef}
                    onClick={() => setAiTaskDropdownOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-input-bg text-text2 border border-border hover:border-border-strong focus:outline-none transition cursor-pointer"
                  >
                    {aiTask === "custom" ? "Custom Prompt" : SCRIPT_PROMPTS.find(p => p.id === aiTask)?.label || "Custom Prompt"}
                    <svg className={`w-3 h-3 text-text3 transition-transform ${aiTaskDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {aiTaskDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-[1]" onClick={() => setAiTaskDropdownOpen(false)} />
                      <div className="dropdown-menu absolute left-0 top-full mt-1.5 z-[2] rounded-xl p-1.5 min-w-[220px] animate-slide-up space-y-1">
                        {[{ id: "custom", label: "Custom Prompt", description: "Free-form chat — ask anything about comedy writing" }, ...SCRIPT_PROMPTS].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => { setAiTask(opt.id); setAiMessages([]); setAiDraft(""); setAiShowGuide(false); setAiTaskDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition ${aiTask === opt.id ? "bg-accent/15 text-accent" : "text-text2 hover:bg-hover-row"}`}
                          >
                            <div className="text-[11px] font-semibold">{opt.label}</div>
                            <div className="text-[10px] text-text3 mt-0.5">{opt.description}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {aiTask !== "custom" && (
                  <button
                    onClick={() => setAiShowGuide(v => !v)}
                    className={`ml-auto px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition flex items-center gap-1 ${aiShowGuide ? "bg-accent/15 text-accent border border-accent/30" : "bg-input-bg text-text3 border border-border hover:text-foreground hover:border-border-strong"}`}
                    title="View the writing guide used by the AI"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
                    Writing Guide
                  </button>
                )}
              </div>
              {/* Niche / personality selector — only for Generate Script */}
              {aiTask === "generate" && (
                <div className="px-5 pb-2 shrink-0">
                  <div className="flex flex-wrap gap-1.5">
                    {SCRIPT_NICHES.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setAiNiche(prev => prev === n.id ? "" : n.id)}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition ${aiNiche === n.id ? "bg-accent/15 text-accent border-accent/30" : "bg-input-bg text-text3 border-border hover:border-border-strong hover:text-text2"}`}
                      >
                        {n.emoji} {n.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setAiNiche(prev => prev === "custom" ? "" : "custom")}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition ${aiNiche === "custom" ? "bg-accent/15 text-accent border-accent/30" : "bg-input-bg text-text3 border-border hover:border-border-strong hover:text-text2"}`}
                    >
                      {aiNiche === "custom" ? "\u{270F}\u{FE0F} Custom" : "+ Custom"}
                    </button>
                    {aiNiche === "custom" && (
                      <input
                        type="text"
                        value={aiNicheCustom}
                        onChange={e => setAiNicheCustom(e.target.value)}
                        placeholder="e.g. Real Estate Agents"
                        className="px-2.5 py-1 text-[10px] rounded-full bg-input-bg border border-accent/30 text-foreground placeholder:text-text3 focus:outline-none focus:border-accent w-40"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              )}
              {/* Writing Guide panel */}
              {aiShowGuide && aiTask !== "custom" && (() => {
                const guidePrompt = SCRIPT_PROMPTS.find(p => p.id === aiTask);
                if (!guidePrompt) return null;
                const filename = `${aiTask}-guide.md`;
                return (
                  <div className="mx-5 mb-2 border border-border rounded-xl bg-input-bg/50 flex flex-col max-h-[50%] min-h-0">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-border shrink-0">
                      <p className="text-[11px] text-text3">{guidePrompt.description}</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { navigator.clipboard.writeText(guidePrompt.prompt); showToast("Copied to clipboard!"); }}
                          className="px-2 py-1 text-[10px] font-semibold text-text3 hover:text-foreground rounded-md hover:bg-hover-row transition flex items-center gap-1"
                          title="Copy prompt"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([guidePrompt.prompt], { type: "text/markdown" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url; a.download = filename; a.click();
                            URL.revokeObjectURL(url);
                            showToast("Downloaded " + filename);
                          }}
                          className="px-2 py-1 text-[10px] font-semibold text-text3 hover:text-foreground rounded-md hover:bg-hover-row transition flex items-center gap-1"
                          title="Download as .md"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto min-h-0 p-4">
                      <pre className="text-[10px] leading-relaxed text-text2 whitespace-pre-wrap font-mono">{guidePrompt.prompt}</pre>
                    </div>
                  </div>
                );
              })()}
              {/* Chat messages area */}
              <div ref={aiChatRef} className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0">
                {aiMessages.length === 0 && !aiLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    {aiTask === "custom" ? (
                      <>
                        <svg className="w-8 h-8 text-accent/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM16.5 7.5l.338 1.182a2.25 2.25 0 0 0 1.48 1.48L19.5 10.5l-1.182.338a2.25 2.25 0 0 0-1.48 1.48L16.5 13.5l-.338-1.182a2.25 2.25 0 0 0-1.48-1.48L13.5 10.5l1.182-.338a2.25 2.25 0 0 0 1.48-1.48L16.5 7.5Z"/></svg>
                        <p className="text-[11px] text-text3 mb-4">Pick a writing skill to get started</p>
                        <div className="space-y-1.5 w-full max-w-[240px]">
                          {SCRIPT_PROMPTS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setAiTask(p.id); setAiMessages([]); setAiDraft(""); setAiShowGuide(false); }}
                              className="w-full text-left px-3 py-2.5 rounded-xl bg-input-bg/60 border border-border hover:border-border-strong hover:bg-hover-row transition group"
                            >
                              <div className="text-[11px] font-semibold text-text2 group-hover:text-foreground">{p.label}</div>
                              <div className="text-[10px] text-text3 mt-0.5">{p.description}</div>
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-text3 mt-4 opacity-60">Or just type below for free-form chat</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-accent/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
                        {aiTask === "generate" && !aiNiche ? (
                          <>
                            <p className="text-[11px] text-text3 mb-1">Pick a personality above to tailor your scripts</p>
                            <p className="text-[10px] text-text3 opacity-50">Or just describe your concept below for a general audience</p>
                          </>
                        ) : aiTask === "generate" && aiNiche ? (
                          <>
                            <p className="text-[11px] text-text2 font-medium mb-1">Writing for {aiNiche === "custom" ? aiNicheCustom || "..." : SCRIPT_NICHES.find(n => n.id === aiNiche)?.label}</p>
                            <p className="text-[10px] text-text3 opacity-60">Describe your skit concept to get started</p>
                          </>
                        ) : (
                          <p className="text-[11px] text-text3 opacity-60">
                            {SCRIPT_PROMPTS.find(p => p.id === aiTask)?.hint || "Write your prompt..."}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
                      </div>
                    )}
                    <div className={`max-w-[85%] relative group ${msg.role === "user" ? "bg-accent/10 text-foreground rounded-2xl rounded-tr-md px-3.5 py-2" : "bg-input-bg border border-border rounded-2xl rounded-tl-md px-3.5 py-2"}`}>
                      {msg.role === "assistant" ? (
                        <>
                          <pre className="text-[11px] leading-relaxed text-text2 whitespace-pre-wrap font-mono">{msg.content}</pre>
                          <button
                            onClick={() => { navigator.clipboard.writeText(msg.content); showToast("Copied!"); }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-surface/80 border border-border text-text3 hover:text-foreground hover:bg-hover-row opacity-0 group-hover:opacity-100 transition"
                            title="Copy"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                        </>
                      ) : (
                        <p className="text-[11px] leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
                      </div>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg>
                    </div>
                    <div className="bg-input-bg border border-border rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-text3 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-text3 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-text3 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Input bar */}
              <div className="px-4 pb-4 pt-2 shrink-0 border-t border-border">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={aiDraft}
                    onChange={e => setAiDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (aiDraft.trim() && !aiLoading) handleAiSend(aiTask, aiDraft, aiMessages); } }}
                    placeholder={SCRIPT_PROMPTS.find(p => p.id === aiTask)?.hint || "Write your prompt..."}
                    rows={1}
                    className="flex-1 px-3 py-2 bg-input-bg border border-border rounded-xl text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition resize-none max-h-24"
                    style={{ minHeight: "36px" }}
                  />
                  <button
                    onClick={() => handleAiSend(aiTask, aiDraft, aiMessages)}
                    disabled={aiLoading || !aiDraft.trim()}
                    className="p-2 bg-accent text-white rounded-xl hover:bg-accent-hover shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {aiLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/></svg>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-text3/50 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Influencer Library Modal ─── */}
      {influencerOpen && createPortal(
        (() => {
          const searchLower = influencerSearch.toLowerCase();
          const filtered = influencers.filter(inf => {
            if (influencerFavOnly && !inf.favorite) return false;
            if (!searchLower) return true;
            return inf.name.toLowerCase().includes(searchLower) || inf.handle.toLowerCase().includes(searchLower) || inf.tags.some(t => t.toLowerCase().includes(searchLower));
          });
          return <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setInfluencerOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
              <div className="w-full max-w-2xl dropdown-menu rounded-2xl shadow-2xl animate-slide-up flex flex-col" style={{ pointerEvents: "auto", height: "min(85vh, 720px)" }} onKeyDown={e => { if (e.key === "Escape") setInfluencerOpen(false); }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
                    Influencer Library
                    <span className="text-[10px] font-normal text-text3 ml-1">({influencers.length})</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setAddingInfluencer(true); setEditingInfluencerId(null); setInfForm({ name: "", handle: "", tags: "", platformUrl: "", guideContent: "" }); }} className="px-2.5 py-1 text-[10px] font-semibold text-accent bg-accent/10 rounded-lg hover:bg-accent/20 transition flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                      Add
                    </button>
                    <button onClick={() => setInfluencerOpen(false)} className="p-1 rounded-lg hover:bg-hover-row text-text3 hover:text-foreground transition">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
                {/* Search + Fav filter */}
                <div className="px-5 pb-3 flex gap-2 shrink-0">
                  <div className="flex-1 relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
                    <input value={influencerSearch} onChange={e => setInfluencerSearch(e.target.value)} placeholder="Search by name, handle, or tag..." className="w-full pl-8 pr-3 py-1.5 bg-input-bg border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition" />
                  </div>
                  <button onClick={() => setInfluencerFavOnly(v => !v)} className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition flex items-center gap-1 ${influencerFavOnly ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-input-bg text-text3 border border-border hover:text-text2"}`}>
                    <svg className="w-3.5 h-3.5" fill={influencerFavOnly ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
                    Favs
                  </button>
                </div>
                {/* Add/Edit form */}
                {(addingInfluencer || editingInfluencerId) && (
                  <div className="px-5 pb-3 shrink-0">
                    <div className="bg-input-bg border border-border rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input value={infForm.name} onChange={e => setInfForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="flex-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 transition" />
                        <input value={infForm.handle} onChange={e => setInfForm(f => ({ ...f, handle: e.target.value }))} placeholder="@handle" className="w-32 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 transition" />
                      </div>
                      <input value={infForm.tags} onChange={e => setInfForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma separated)" className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 transition" />
                      <input value={infForm.platformUrl} onChange={e => setInfForm(f => ({ ...f, platformUrl: e.target.value }))} placeholder="Social links (space separated URLs)" className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 transition" />
                      <textarea value={infForm.guideContent} onChange={e => setInfForm(f => ({ ...f, guideContent: e.target.value }))} placeholder="Style guide (markdown)..." rows={3} className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 transition resize-none font-mono" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setAddingInfluencer(false); setEditingInfluencerId(null); }} className="px-3 py-1 text-[10px] font-semibold text-text3 hover:text-foreground transition">Cancel</button>
                        <button onClick={() => {
                          if (!infForm.name.trim() || !infForm.handle.trim()) { showToast("Name and handle are required"); return; }
                          const parsePlatforms = (urls: string) => urls.split(/\s+/).filter(u => /^https?:\/\//.test(u)).map(u => {
                            let p = "link";
                            try { const h = new URL(u).hostname.replace("www.", ""); if (h.includes("instagram")) p = "instagram"; else if (h.includes("tiktok")) p = "tiktok"; else if (h.includes("youtube") || h.includes("youtu.be")) p = "youtube"; else if (h.includes("twitter") || h.includes("x.com")) p = "twitter"; } catch {}
                            return { platform: p, url: u };
                          });
                          if (editingInfluencerId) {
                            const updated = influencers.map(inf => inf.id === editingInfluencerId ? { ...inf, name: infForm.name.trim(), handle: infForm.handle.trim(), avatar: infForm.name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(), tags: infForm.tags.split(",").map(t => t.trim()).filter(Boolean), platforms: parsePlatforms(infForm.platformUrl), guideContent: infForm.guideContent } : inf);
                            setInfluencersAndPersist(updated);
                            setEditingInfluencerId(null);
                            showToast("Updated!");
                          } else {
                            const newInf: Influencer & { isPrivate: boolean } = { id: crypto.randomUUID(), name: infForm.name.trim(), handle: infForm.handle.trim(), avatar: infForm.name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(), platforms: parsePlatforms(infForm.platformUrl), tags: infForm.tags.split(",").map(t => t.trim()).filter(Boolean), favorite: false, guideContent: infForm.guideContent, isPrivate: false };
                            setInfluencersAndPersist([newInf, ...influencers]);
                            setAddingInfluencer(false);
                            showToast("Added!");
                          }
                          setInfForm({ name: "", handle: "", tags: "", platformUrl: "", guideContent: "" });
                        }} className="px-3 py-1 bg-accent text-white text-[10px] font-semibold rounded-lg hover:bg-accent-hover shadow-sm transition">
                          {editingInfluencerId ? "Update" : "Add Influencer"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* List */}
                <div className="flex-1 overflow-y-auto px-5 pb-4 min-h-0">
                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                      <svg className="w-8 h-8 text-text3 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>
                      <p className="text-xs text-text3">{influencerFavOnly ? "No favorites yet." : "No influencers found."}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    {filtered.map(inf => (
                      <div key={inf.id} className="rounded-xl border border-border hover:border-border-strong transition group">
                        {/* Card header */}
                        <div className="flex items-start gap-3 px-3.5 py-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-accent">{inf.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground truncate">{inf.name}</span>
                              <span className="text-[10px] text-text3 font-mono">{inf.handle}</span>
                            </div>
                            {inf.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {inf.tags.map((tag, ti) => (
                                  <span key={ti} className="px-1.5 py-0.5 text-[9px] font-medium text-text3 bg-input-bg rounded-md">{tag}</span>
                                ))}
                              </div>
                            )}
                            {inf.platforms.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {inf.platforms.map((p, pi) => {
                                  const c = PLATFORM_COLORS[p.platform] || PLATFORM_COLORS.link;
                                  return (
                                    <a key={pi} href={p.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${c.bg} ${c.text} ${c.hover} transition`}>
                                      <PlatformIcon platform={p.platform} size={10} />
                                      {p.platform === "link" ? "Link" : p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setExpandedInfluencerId(expandedInfluencerId === inf.id ? null : inf.id)} className={`px-2 py-1 text-[9px] font-semibold rounded-md transition ${expandedInfluencerId === inf.id ? "bg-accent/15 text-accent" : "text-text3 hover:text-text2 hover:bg-input-bg"}`}>
                              {expandedInfluencerId === inf.id ? "Hide" : "Guide"}
                            </button>
                            <button onClick={() => { const updated = influencers.map(i => i.id === inf.id ? { ...i, favorite: !i.favorite } : i); setInfluencersAndPersist(updated); }} className="p-1 rounded-md hover:bg-input-bg transition" title={inf.favorite ? "Unfavorite" : "Favorite"}>
                              <svg className={`w-3.5 h-3.5 ${inf.favorite ? "text-amber-500 fill-amber-500" : "text-text3/40 hover:text-amber-500/60"}`} fill={inf.favorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>
                            </button>
                            <button onClick={() => {
                              if (editingInfluencerId === inf.id) { setEditingInfluencerId(null); return; }
                              setEditingInfluencerId(inf.id);
                              setAddingInfluencer(false);
                              setInfForm({ name: inf.name, handle: inf.handle, tags: inf.tags.join(", "), platformUrl: inf.platforms.map(p => p.url).join(" "), guideContent: inf.guideContent });
                            }} className="p-1 rounded-md hover:bg-input-bg text-text3/40 hover:text-text2 transition opacity-0 group-hover:opacity-100" title="Edit">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
                            </button>
                            <button onClick={() => {
                              if (confirm(`Remove ${inf.name}?`)) {
                                deleteInf(inf.id);
                                if (expandedInfluencerId === inf.id) setExpandedInfluencerId(null);
                                showToast("Removed");
                              }
                            }} className="p-1 rounded-md hover:bg-t-red/10 text-text3/40 hover:text-t-red transition opacity-0 group-hover:opacity-100" title="Remove">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                            </button>
                          </div>
                        </div>
                        {/* Expanded guide */}
                        {expandedInfluencerId === inf.id && inf.guideContent && (
                          <div className="px-3.5 pb-3 border-t border-border/50">
                            <div className="flex items-center justify-end gap-1.5 pt-2 pb-1.5">
                              <button onClick={() => { navigator.clipboard.writeText(inf.guideContent); showToast("Guide copied!"); }} className="px-2 py-0.5 text-[9px] font-semibold text-accent bg-accent/10 rounded-md hover:bg-accent/20 transition flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                Copy
                              </button>
                              <button onClick={() => {
                                const blob = new Blob([inf.guideContent], { type: "text/markdown" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url; a.download = `${inf.handle.replace("@", "")}-guide.md`; a.click();
                                URL.revokeObjectURL(url);
                                showToast("Downloaded!");
                              }} className="px-2 py-0.5 text-[9px] font-semibold text-text3 bg-input-bg rounded-md hover:text-text2 hover:bg-hover-row transition flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                                .md
                              </button>
                            </div>
                            <pre className="text-[10px] leading-relaxed text-text2 bg-input-bg border border-border rounded-lg p-3 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{inf.guideContent}</pre>
                          </div>
                        )}
                        {expandedInfluencerId === inf.id && !inf.guideContent && (
                          <div className="px-3.5 pb-3 border-t border-border/50 pt-2">
                            <p className="text-[10px] text-text3 italic">No guide yet. Click edit to add one.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>;
        })(),
        document.body
      )}

      {/* ─── Transcript Extractor Modal ─── */}
      {transcriptOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => setTranscriptOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-lg dropdown-menu rounded-2xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col" style={{ pointerEvents: "auto" }} onKeyDown={e => { if (e.key === "Escape") setTranscriptOpen(false); }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/></svg>
                  Transcript Extractor
                </h3>
                <button onClick={() => setTranscriptOpen(false)} className="p-1 rounded-lg hover:bg-hover-row text-text3 hover:text-foreground transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Tabs */}
              <div className="px-5 pb-2 flex gap-2 shrink-0">
                <button
                  onClick={() => setTranscriptTab("upload")}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition ${transcriptTab === "upload" ? "bg-accent text-white shadow-sm" : "bg-input-bg text-text2 border border-border hover:border-border-strong"}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setTranscriptTab("url")}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition ${transcriptTab === "url" ? "bg-accent text-white shadow-sm" : "bg-input-bg text-text2 border border-border hover:border-border-strong"}`}
                >
                  Paste URL
                </button>
              </div>
              {/* Tab content */}
              <div className="px-5 pb-3 shrink-0">
                {transcriptTab === "upload" ? (
                  <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 transition cursor-pointer ${transcriptLoading ? "border-accent/30 bg-accent/5" : "border-border hover:border-accent/40 hover:bg-hover-row"}`}>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*,audio/*,.mp4,.mp3,.wav,.webm,.m4a,.ogg"
                      disabled={transcriptLoading}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleTranscriptFile(f);
                        e.target.value = "";
                      }}
                    />
                    <svg className="w-8 h-8 text-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
                    <span className="text-xs text-text2 font-medium">Drop video/audio here or click to browse</span>
                    <span className="text-[10px] text-text3">.mp4 .mp3 .wav .webm .m4a .ogg</span>
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={transcriptUrl}
                        onChange={e => setTranscriptUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleTranscriptUrl(); }}
                        placeholder="Paste YouTube URL..."
                        disabled={transcriptLoading}
                        className="flex-1 px-3 py-2 bg-input-bg border border-border rounded-xl text-sm text-foreground placeholder:text-text3 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition"
                      />
                      <button
                        onClick={handleTranscriptUrl}
                        disabled={transcriptLoading || !transcriptUrl.trim()}
                        className="px-3 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Extract
                      </button>
                    </div>
                    <p className="text-[10px] text-text3 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/></svg>
                      For TikTok / Instagram, save the video to your device and use the Upload tab.
                    </p>
                  </div>
                )}
              </div>
              {/* Progress */}
              {transcriptProgress && (
                <div className="px-5 pb-2 shrink-0">
                  <div className="flex items-center gap-2 text-[11px] text-accent">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {transcriptProgress}
                  </div>
                </div>
              )}
              {/* Transcript output */}
              {transcriptText && (
                <div className="px-5 pb-3 overflow-y-auto min-h-0 flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-text3 uppercase tracking-wider">Transcript</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(transcriptText); showToast("Copied to clipboard!"); }}
                      className="px-2.5 py-1 bg-accent text-white text-[10px] font-semibold rounded-lg hover:bg-accent-hover shadow-sm transition flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy
                    </button>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-text2 bg-input-bg border border-border rounded-xl p-4 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">{transcriptText}</pre>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Cell Hover Tooltip ─── */}
      {hoverTooltip && createPortal(<CellTooltip text={hoverTooltip.text} x={hoverTooltip.x} y={hoverTooltip.y} col={hoverTooltip.col} />, document.body)}

      {/* ─── Smart Import Modal ─── */}
      {smartImportOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => { if (!smartImportLoading) resetSmartImport(); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-2xl dropdown-menu rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up" style={{ pointerEvents: "auto" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                    <SparklesIcon />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Smart Import</h3>
                    {smartImportFile && <p className="text-[11px] text-text3 mt-0.5">{smartImportFile.name}</p>}
                  </div>
                </div>
                {!smartImportLoading && (
                  <button onClick={resetSmartImport} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>

              {/* Loading state */}
              {smartImportLoading && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 px-5">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-foreground">AI is analyzing your data...</p>
                  <p className="text-xs text-text3 mt-1">Mapping columns to the skit planner format</p>
                </div>
              )}

              {/* Error state */}
              {smartImportError && !smartImportLoading && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-5">
                  <div className="w-12 h-12 rounded-full bg-t-rose/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-t-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Import Failed</p>
                  <p className="text-xs text-text3 text-center max-w-sm">{smartImportError}</p>
                  <div className="flex gap-2 mt-5">
                    <button onClick={resetSmartImport} className="px-4 py-2 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row transition">Cancel</button>
                    {smartImportFile && (
                      <button onClick={() => processSmartImport(smartImportFile)} className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover shadow-sm transition">Try Again</button>
                    )}
                  </div>
                </div>
              )}

              {/* Preview state */}
              {smartImportPreview && !smartImportLoading && !smartImportError && (
                <>
                  {/* Mapping summary */}
                  <div className="px-5 pb-3 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-t-green bg-t-green/10 px-2 py-0.5 rounded-full">{smartImportPreview.length} rows ready</span>
                      {smartImportMapping && (
                        <span className="text-xs text-text3">{Object.values(smartImportMapping).filter(v => v).length} columns mapped</span>
                      )}
                    </div>
                    {smartImportReasoning && <p className="text-[11px] text-text3 italic">{smartImportReasoning}</p>}

                    {/* Column mapping pills */}
                    {smartImportMapping && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(smartImportMapping).map(([src, target]) => (
                          <span key={src} className={`text-[10px] px-2 py-0.5 rounded-full border ${target ? "bg-accent/5 border-accent/20 text-accent" : "bg-input-bg border-border text-text3 line-through"}`}>
                            {src} {target ? `\u2192 ${target}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preview table */}
                  <div className="flex-1 min-h-0 overflow-auto mx-5 mb-3 border border-border rounded-xl">
                    <table className="w-full text-[11px]">
                      <thead className="sticky top-0">
                        <tr className="bg-hover-row">
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">#</th>
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">Inspiration</th>
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">Cast</th>
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">Category</th>
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">Script</th>
                          <th className="text-left px-2 py-1.5 text-[10px] uppercase tracking-wider text-text3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smartImportPreview.slice(0, 20).map((skit, i) => (
                          <tr key={skit.id} className="border-t border-border/50 hover:bg-hover-row/50">
                            <td className="px-2 py-1.5 text-text3">{i + 1}</td>
                            <td className="px-2 py-1.5 text-foreground max-w-[200px] truncate">{skit.inspiration}</td>
                            <td className="px-2 py-1.5 text-text2">{skit.castSize}</td>
                            <td className="px-2 py-1.5 text-text2">{skit.category}</td>
                            <td className="px-2 py-1.5 text-text3 max-w-[150px] truncate">{skit.script || "\u2014"}</td>
                            <td className="px-2 py-1.5 text-text2">{skit.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {smartImportPreview.length > 20 && (
                      <p className="text-[10px] text-text3 text-center py-2 border-t border-border/50">...and {smartImportPreview.length - 20} more rows</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 px-5 pb-5 shrink-0">
                    <button onClick={resetSmartImport} className="flex-1 px-4 py-2.5 bg-input-bg text-text2 text-xs font-semibold rounded-lg border border-border hover:bg-hover-row transition">
                      Cancel
                    </button>
                    <button onClick={confirmSmartImport} className="flex-1 px-4 py-2.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover shadow-sm shadow-accent/20 transition flex items-center justify-center gap-1.5">
                      <SparklesIcon /> Import {smartImportPreview.length} Row{smartImportPreview.length > 1 ? "s" : ""}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Reel Import Preview Modal ─── */}
      {reelImportOpen && reelImportData && createPortal(
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 10000 }} onClick={() => { setReelImportOpen(false); setReelImportData(null); }} />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10001, pointerEvents: "none" }}>
            <div className="w-full max-w-lg dropdown-menu rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up" style={{ pointerEvents: "auto" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-t-purple/15 flex items-center justify-center text-t-purple">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Import Reel Research</h3>
                    <p className="text-[11px] text-text3 mt-0.5">{reelImportData.length} creator{reelImportData.length > 1 ? "s" : ""} &middot; {reelImportData.reduce((sum, c) => sum + c.reels.length, 0)} reels</p>
                  </div>
                </div>
                <button onClick={() => { setReelImportOpen(false); setReelImportData(null); }} className="p-1.5 rounded-lg text-text3 hover:text-foreground hover:bg-hover-row transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>
              {/* Creator list */}
              <div className="flex-1 overflow-y-auto px-5 pb-3">
                <div className="space-y-2">
                  {reelImportData.map((creator, i) => (
                    <div key={i} className="rounded-lg border border-border bg-input-bg/50 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <PlatformIcon platform={creator.platform} size={14} />
                        <span className="text-xs font-semibold text-foreground">{creator.handle}</span>
                        <span className="text-[10px] text-text3">{creator.realName}</span>
                        <span className="ml-auto text-[10px] text-text3 bg-page-bg px-1.5 py-0.5 rounded-full">{creator.reels.length} reels</span>
                      </div>
                      <div className="space-y-0.5">
                        {creator.reels.map((reel, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-text3 shrink-0">&bull;</span>
                            <a href={reel.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate" onClick={e => e.stopPropagation()}>{reel.title || reel.url.split("/").pop() || reel.url}</a>
                            {reel.likes && <span className="text-text3 shrink-0 ml-auto">{reel.likes} likes</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Footer */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-between shrink-0">
                <p className="text-[11px] text-text3">Category, cast &amp; characters can be set per-row after import</p>
                <button
                  onClick={confirmReelImport}
                  className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover shadow-sm shadow-accent/20 transition"
                >
                  Import {reelImportData.reduce((sum, c) => sum + c.reels.length, 0)} Rows
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Paste Links Modal ─── */}
      {pasteLinksOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={() => { setPasteLinksOpen(false); setPasteLinksText(""); }} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="bg-card-bg border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Paste Video Links</h3>
                <p className="text-[11px] text-text3 mt-0.5">Paste TikTok, Instagram Reel, or YouTube Shorts URLs</p>
              </div>
              {/* Body */}
              <div className="px-5 py-4">
                <textarea
                  value={pasteLinksText}
                  onChange={e => setPasteLinksText(e.target.value)}
                  placeholder={"https://www.tiktok.com/@creator/video/123...\nhttps://www.instagram.com/reel/abc...\nhttps://www.youtube.com/shorts/xyz..."}
                  className="w-full h-48 px-3 py-2.5 bg-input-bg border border-border rounded-xl text-xs text-foreground placeholder:text-text3/60 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/50 transition resize-none font-mono"
                  autoFocus
                />
                {pasteUrlCount > 0 && (
                  <p className="text-[11px] text-accent mt-2">{pasteUrlCount} video URL{pasteUrlCount !== 1 ? "s" : ""} detected</p>
                )}
              </div>
              {/* Footer */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  onClick={() => { setPasteLinksOpen(false); setPasteLinksText(""); }}
                  className="px-4 py-2 text-xs font-medium text-text2 hover:text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteLinksConfirm}
                  disabled={pasteUrlCount === 0}
                  className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover shadow-sm shadow-accent/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Import {pasteUrlCount > 0 ? `${pasteUrlCount} URL${pasteUrlCount !== 1 ? "s" : ""}` : "URLs"}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── Share Modal ─── */}
      {shareOpen && user && (
        <ShareModal
          boardId={boardId}
          boardName={boardName}
          isOwner={true}
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* ─── Toasts ─── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} onUndo={handleUndo} />

    </div>
  );
}
