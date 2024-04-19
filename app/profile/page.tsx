"use client";
import AuthButton from "@/components/AuthButton";
// import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CardContent, CardFooter, Card } from "@/components/ui/card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/stores";

export default function profile() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<string>();

  const { profile, setProfile, updateProfile } = useProfileStore();

  useEffect(() => {
    // Fetch the profile data on mount
    setLoading(true);
    fetchProfile();
  }, []);

  // async function fetchProfile() {
  //   const user = supabase.auth.getUser();
  //   if (!user) {
  //     router.push("/login");
  //   } else {
  //     let { data, error } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", (await user).data.user?.id)
  //       .single();

  //     if (error) {
  //       console.error("Error fetching profile:", error);
  //     } else {
  //       setProfile(data);
  //       setLoading(false);
  //     }
  //   }
  // }

  // async function fetchProfile() {
  //   const user = await supabase.auth.getUser();
  //   if (!user.data.user) {
  //     router.push("/login");
  //   } else {
  //     // Fetch profile information
  //     let { data: profileData, error: profileError } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", user.data.user.id)
  //       .single();

  //     if (profileError) {
  //       console.error("Error fetching profile:", profileError);
  //       return;
  //     }

  //     // Fetch avatar URL from storage
  //     const avatarPath = `avatars/${user.data.user.id}/avatar`;
  //     const { data: avatarData, error: avatarError } = await supabase.storage
  //       .from("avatars")
  //       .list(user.data.user.id)

  //     if (avatarError) {
  //       console.error("Error fetching avatar:", avatarError);
  //     } else {
  //       console.log(avatarData[0].id);

  //       setMedia(avatarData[0].id);
  //     }

  //     setProfile(profileData);
  //     setLoading(false);
  //   }
  // }

  async function fetchProfile() {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      router.push("/login");
    } else {
      // Fetch profile information
      // console.log(user.data.user.id);
      let { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Fetch avatar URL from storage
      const avatarPath = `avatars/${user.data.user.id}/avatar`;
      const { data: avatarData, error: avatarError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(`${user.data.user.id}/avatar`, 60);

      if (avatarError) {
        console.error("Error fetching avatar:", avatarError);
      } else {
        // console.log(avatarData);
        setMedia(avatarData.signedUrl);
      }

      setProfile(profileData);
      setLoading(false);
    }
  }

  async function saveProfile() {
    // Update profile information in Supabase
    const user = supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...profile })
        .eq("id", (await user).data.user?.id);

      if (error) {
        console.error("Error updating profile:", error);
      } else {
        console.log("Profile updated successfully:", data);
      }
    }
  }

  function handleChange(e: { target: { name: any; value: any } }) {
    const { name, value } = e.target;
    updateProfile({ [name]: value });
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="flex w-full bg-gray-50 h-screen items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-gray-200 animate-spin fill-dark-purple"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 h-screen">
      <Card className=" bg-gray-50 w-full h-full max-w-3xl rounded-none flex flex-col justify-between">
        <CardContent className="animate-in space-y-4 flex flex-col items-center">
          <div className="space-y-2 w-fullitems-center mt-4">
            {media ? (
              <Image
                src={media}
                alt="User Avatar"
                width={120}
                height={120}
                className="rounded-full w-24 h-24 flex"
              />
            ) : (
              <div className="bg-gray-500 rounded-full w-24 h-24 flex"></div>
            )}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="display_name">Name</Label>
            <Input
              id="display_name"
              name="display_name"
              value={profile.display_name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange} // This will call the handleChange method defined in the previous example
              placeholder="Create a short bio."
              maxLength={250}
            />
            <p className="text-dark-purple text-sm text-right mt-1">
              {profile.bio.length} / 250
            </p>
          </div>
          <div className="space-y-2 w-full flex flex-col gap-1">
            <Label>Actively Searching</Label>
            <Switch id="searching" />
          </div>
        </CardContent>
        <CardFooter className="animate-in mb-12 flex flex-col gap-1">
          <button
            onClick={signOut}
            className="w-full inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
          >
            Sign Out
          </button>
          <button
            onClick={saveProfile}
            className="w-full inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
          >
            Save
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
