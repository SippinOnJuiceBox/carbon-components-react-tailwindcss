import { createClient } from "./supabase/client";

export default async function fetchAvatarFromUser(userId: string) {
  const supabase = createClient();
  const { data: avatarData, error: avatarError } = await supabase.storage
    .from("avatars")
    .createSignedUrl(`${userId}/avatar`, 60);

  if (avatarError) {
    console.error("Error fetching avatar:", avatarError);
  } else {
    return avatarData.signedUrl;
  }
}
