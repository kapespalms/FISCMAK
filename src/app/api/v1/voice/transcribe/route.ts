import { NextResponse } from "next/server";
import { isWhisperConfigured, transcribeAudioBuffer } from "@/lib/v2/voice-transcription";

export async function POST(request: Request) {
  if (!isWhisperConfigured()) {
    return NextResponse.json(
      { error: "Whisper not configured", fallback: "browser_speech" },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "audio file required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await transcribeAudioBuffer(buffer, file.type || "audio/webm");

    return NextResponse.json({ text, source: "whisper" });
  } catch (e) {
    console.error("Voice transcription failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Transcription failed", fallback: "browser_speech" },
      { status: 500 },
    );
  }
}
