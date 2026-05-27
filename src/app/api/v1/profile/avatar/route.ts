import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function avatarPath(userId: string, ext: string): string {
  return `${userId}/avatar.${ext}`;
}

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  const meta = (user?.onboarding_metadata ?? {}) as Record<string, unknown>;
  return jsonOk({
    profile_photo_url: (meta.profile_photo_url as string | undefined) ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonError("demo_mode", "Sign in with a full account to save a profile photo.", 400);
  }

  if (!isSupabaseConfigured()) {
    return jsonError("storage_unavailable", "Photo upload is not configured.", 503);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("validation_error", "Missing image file.", 400);
  }
  if (!ALLOWED.has(file.type)) {
    return jsonError("validation_error", "Use JPEG, PNG, WebP, or GIF.", 400);
  }
  if (file.size > MAX_BYTES) {
    return jsonError("validation_error", "Image must be under 2 MB.", 400);
  }

  const ext = extForMime(file.type);
  const path = avatarPath(auth.userId, ext);
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, buffer, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (uploadError) {
    console.error("avatar upload failed:", uploadError.message);
    return jsonError("storage_error", "Could not upload photo.", 500);
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const profile_photo_url = urlData.publicUrl;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = { ...(user?.onboarding_metadata ?? {}), profile_photo_url };
  await upsertAppUser(auth.userId, auth.email, { onboarding_metadata: meta }, auth.demo);

  return jsonOk({ profile_photo_url });
}

export async function DELETE() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = { ...(user?.onboarding_metadata ?? {}) };
  delete meta.profile_photo_url;
  await upsertAppUser(auth.userId, auth.email, { onboarding_metadata: meta }, auth.demo);

  if (!auth.demo && isSupabaseConfigured()) {
    const supabase = await createClient();
    for (const ext of ["jpg", "png", "webp", "gif"]) {
      await supabase.storage.from("avatars").remove([avatarPath(auth.userId, ext)]);
    }
  }

  return jsonOk({ profile_photo_url: null });
}
