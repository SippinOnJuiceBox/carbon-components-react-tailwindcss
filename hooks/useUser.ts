import { Profile } from "@/stores/types";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient();

const useUserProfile = () => {
  const [user, setUser] = useState<User>();
  const [profile, setProfile] = useState<Profile>();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      if (!userData.user) {
        setLoading(false);
        return;
      }

      setUser(userData.user);

      // Fetch profile information
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setProfile(profileData);

      // Fetch avatar URL from storage
      const { data: avatarData, error: avatarError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(`${userData.user.id}/avatar`, 60);

      if (avatarError) {
        console.error("Error fetching avatar:", avatarError);
      } else {
        setMedia(avatarData.signedUrl);
      }
    };

    fetchUser();
  }, []);

  return { user, profile, loading, media };
};

export default useUserProfile;
