import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract video ID from various YouTube URL formats
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please paste a valid YouTube video link." },
        { status: 400 }
      );
    }

    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      return NextResponse.json(
        { error: "No captions found for this video. The video may not have subtitles enabled." },
        { status: 404 }
      );
    }

    // Join all transcript segments into a single text
    const transcript = transcriptItems.map((item) => item.text).join(" ");

    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare video ID
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
