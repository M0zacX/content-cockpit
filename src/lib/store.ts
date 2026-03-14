export interface Post {
  id: string;
  date: string;
  platform: "instagram" | "linkedin" | "story" | "reel";
  title: string;
  caption: string;
  photos: string;
  hashtags: string;
  notes: string;
}

export interface Idea {
  id: string;
  title: string;
  platform: "instagram" | "linkedin" | "story" | "reel";
  desc: string;
  photos: string;
}

export interface Inspo {
  id: string;
  title: string;
  platform: "instagram" | "linkedin" | "tiktok" | "general";
  link: string;
  desc: string;
  tags: string[];
}

export interface Skit {
  id: string;
  inspiration: string;
  links: string;
  castSize: string;
  characters: string;
  category: string;
  styleRef: string;
  script: string;
  environment: string;
  status: string;
  approved?: boolean | null;
  favorite?: boolean;
  isPublic?: boolean;
  sort_order?: number;
}

const isBrowser = typeof window !== "undefined";

function getStore<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem("zain_planner_" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, val: T): void {
  if (!isBrowser) return;
  localStorage.setItem("zain_planner_" + key, JSON.stringify(val));
}

// Default data
const defaultIdeas: Idea[] = [
  {
    id: "1",
    title: "Chiang Mai Culture Carousel",
    platform: "instagram",
    desc: "Slide 1: Portrait at Thai wooden house (hero shot)\nSlide 2: Traditional house with lanterns\nSlide 3: Garden pathway\nSlide 4: Wooden cafe terrace\nSlide 5: Cafe entrance with ferns\n\nCaption angle: \"Got lost in Chiang Mai and found paradise\"",
    photos: "01-portrait, 02-traditional-house, 04-lanterns, 06-cafe-terrace, 07-cafe-entrance",
  },
  {
    id: "2",
    title: "Thai Food Heaven Carousel",
    platform: "instagram",
    desc: 'Slide 1: Mango sticky rice close-up\nSlide 2: Colorful fruit platter (top-down)\nSlide 3: Thai fried rice\nSlide 4: Night market food stalls\n\nCaption angle: "Thailand did NOT disappoint (swipe for proof)"',
    photos: "08-mango-sticky-rice, 09-fruit-platter, 10-fried-rice, 17-night-market",
  },
  {
    id: "3",
    title: "Bangkok Nightlife Carousel",
    platform: "instagram",
    desc: 'Slide 1: Tuk-tuk ride with purple neon\nSlide 2: Born to be Wild graffiti\nSlide 3: Giant Christmas tree at Maya\nSlide 4: Club atmosphere shot\n\nCaption angle: "Bangkok at night hits different"',
    photos: "15-tuk-tuk-neon, 16-graffiti, 11-christmas-tree, club-scene",
  },
  {
    id: "4",
    title: "Thailand Airbnb Tour Reel",
    platform: "reel",
    desc: "Quick cuts showing:\n- Marble kitchen reveal\n- Kitchen garden view\n- Living room\n- Christmas tree with cat\n- Hotel towel art\n\nAudio: trending \"luxury on a budget\" or \"POV: your Airbnb in Thailand\"\nKeep cuts to 1-2 seconds each, end on cat shot",
    photos: "18-marble-kitchen, 19-kitchen-garden, 14-christmas-cat, 13-towel-art",
  },
  {
    id: "5",
    title: "Tuk-Tuk Ride Reel",
    platform: "reel",
    desc: "Use the tuk-tuk video clips + photos.\nPurple neon lighting is amazing.\nTrending audio idea: \"take me back\"\nShow the motion, the lights, the Bangkok streets.\nEnd with the skyline building shot.",
    photos: "15-tuk-tuk-neon + MOV clips from Reels-Clips folder",
  },
  {
    id: "6",
    title: "Boat Day Carousel",
    platform: "instagram",
    desc: "Slide 1: Boat ride with Pattaya skyline\nSlide 2-4: Use video stills from boat clips\n\nCaption: \"Ocean views and city skylines. Pattaya, you beautiful thing.\"",
    photos: "12-boat-ride-pattaya-skyline + boat clips",
  },
  {
    id: "7",
    title: "LinkedIn Travel Post",
    platform: "linkedin",
    desc: "Professional angle: \"What 10 days in Thailand taught me about work-life balance\"\n\nUse the portrait at Thai wooden house as the cover image.\nTalk about disconnecting, cultural experiences, and coming back refreshed.\n\nAdam Zane style - personal story with a professional takeaway.",
    photos: "01-portrait-thai-wooden-house-golden-hour",
  },
  {
    id: "8",
    title: "LinkedIn Carousel - Travel Lessons",
    platform: "linkedin",
    desc: "Slide-by-slide carousel (design in Canva):\nSlide 1: \"7 Things Thailand Taught Me About Life\" (hook)\nSlide 2: Slow down (cafe terrace photo)\nSlide 3: Try new things (food photos)\nSlide 4: Adventure > comfort (tuk-tuk photo)\nSlide 5: Beauty is everywhere (garden/lantern photos)\nSlide 6: People make the trip (group selfie)\nSlide 7: Come back different (portrait)\n\nStyle: Clean text overlay on photo backgrounds",
    photos: "Mix of best carousel photos",
  },
];

const defaultInspos: Inspo[] = [
  {
    id: "1",
    title: "Adam Zane - LinkedIn Style",
    platform: "linkedin",
    link: "https://www.linkedin.com/in/realadamzane/recent-activity/all/",
    desc: "Study his carousel format, hook writing, and how he blends personal travel stories with professional insights. His carousels typically use clean backgrounds with bold text overlays.",
    tags: ["carousel", "storytelling", "hooks", "personal-brand"],
  },
  {
    id: "2",
    title: "Travel Reels - Trending Audio",
    platform: "instagram",
    link: "",
    desc: "Check Instagram Reels explore page for trending travel audio. Popular formats:\n- POV transitions\n- \"Take me back\" montages\n- Before/after travel glow-ups\n- Quick-cut destination reveals",
    tags: ["reels", "trending-audio", "transitions"],
  },
  {
    id: "3",
    title: "Food Carousel Inspo",
    platform: "instagram",
    link: "",
    desc: "Top-down food shots perform best. Use natural lighting. First slide should be the most colorful/appetizing. Include a \"making of\" or street vendor shot for authenticity.",
    tags: ["food", "carousel", "photography-tips"],
  },
];

export function getPosts(): Post[] {
  return getStore<Post[]>("posts", []);
}
export function setPosts(posts: Post[]): void {
  setStore("posts", posts);
}
export function getIdeas(): Idea[] {
  return getStore<Idea[]>("ideas", defaultIdeas);
}
export function setIdeas(ideas: Idea[]): void {
  setStore("ideas", ideas);
}
export function getInspos(): Inspo[] {
  return getStore<Inspo[]>("inspos", defaultInspos);
}
export function setInspos(inspos: Inspo[]): void {
  setStore("inspos", inspos);
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platforms: { platform: string; url: string }[];
  tags: string[];
  favorite: boolean;
  guideContent: string;
}

export function getInfluencers(): Influencer[] {
  return getStore<Influencer[]>("influencers", []);
}
export function setInfluencers(influencers: Influencer[]): void {
  setStore("influencers", influencers);
}

export function getSkits(): Skit[] {
  return getStore<Skit[]>("skits", []);
}
export function setSkits(skits: Skit[]): void {
  setStore("skits", skits);
}

const DEFAULT_CATEGORIES = ["Killer Script", "AI Agent", "Corporate", "Tech/Startup"];
export function getCategories(): string[] {
  return getStore<string[]>("categories", DEFAULT_CATEGORIES);
}
export function setCategories(cats: string[]): void {
  setStore("categories", cats);
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      posts: getPosts(),
      ideas: getIdeas(),
      inspos: getInspos(),
      skits: getSkits(),
      exportDate: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.posts) setPosts(data.posts);
    if (data.ideas) setIdeas(data.ideas);
    if (data.inspos) setInspos(data.inspos);
    if (data.skits) setSkits(data.skits);
    return true;
  } catch {
    return false;
  }
}
