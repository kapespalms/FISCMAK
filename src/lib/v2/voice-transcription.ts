/**
 * OpenAI Whisper transcription for Mak voice capture.
 * Falls back to client-side SpeechRecognition when key is missing.
 */

export async function transcribeAudioBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured for Whisper transcription");
  }

  const bytes = Uint8Array.from(buffer);
  const blob = new Blob([bytes], { type: mimeType });
  const form = new FormData();
  form.append("file", blob, "audio.webm");
  form.append("model", "whisper-1");
  form.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper API failed: ${err}`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text?.trim() ?? "";
}

export function isWhisperConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
