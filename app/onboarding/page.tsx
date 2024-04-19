// "use client";
// import { createClient } from "@/utils/supabase/client";
// import { redirect } from "next/navigation";
// import React from "react";

// export default async function onboarding() {
//   const supabase = createClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return redirect("/login");
//   }
//   return ;
// }

/* eslint-disable react/jsx-no-undef */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { FormEvent, use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Drawer } from "vaul";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/image-upload";
import { getURL } from "next/dist/shared/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { headers } from "next/headers";
import { redirect, useRouter } from "next/navigation";

// interface FirstTimeLoginProps {
//   onSubmit: (userProfileData: User) => void;
// } { onSubmit }: FirstTimeLoginProps

function FirstTimeLogin() {
  const [currentStep, setCurrentStep] = useState(1); // Start with ToS step
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [isToSAccepted, setIsToSAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrev = () => {
    // if (currentStep === 1) return;
    setCurrentStep((prevStep) => prevStep - 1);
  };

  // const handleSubmit = () => {
  //   // Assuming that accepting the ToS is required to proceed
  //   console.log("subit");
  //   if (!isToSAccepted) {
  //     alert("You must accept the Terms of Service to continue.");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const location = [position.coords.latitude, position.coords.longitude];
  //       console.log(location);
  //       const userProfileData = {
  //         name: name,
  //         interests: [],
  //         bio: bio,
  //         location: location,
  //         lastLoginDate: new Date(),
  //         isActive: false,
  //         meetups: 0,
  //       };

  //       // onSubmit(userProfileData);

  //     },
  //     (error) => {
  //       console.error("Error getting current location: ", error);
  //     }
  //   );
  // };

  // async function signUp() {
  //   console.log("signup");
  //   const { data, error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${origin}/auth/callback`,
  //       data: {
  //         display_name: name,
  //         bio: bio,
  //         isToSAccepted: isToSAccepted,
  //         friends: 0,
  //         meetups: 0,
  //       },
  //     },
  //   });

  //   if (error) setMessage("Could not authenticate user or missing information");
  //   if (data) setMessage("Check email to continue sign in process");
  // }

  // const signUp = async (formData: FormData) => {
  //   const supabase = createClient();

  //   const { data, error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${origin}/auth/callback`,
  //       data: {
  //         display_name: name,
  //         bio: bio,
  //         isToSAccepted: isToSAccepted,
  //         friends: 0,
  //         meetups: 0,
  //       },
  //     },
  //   });

  //   if (error) setMessage("Could not authenticate user or missing information");
  //   if (data) setMessage("Check email to continue sign in process");
  // };

  const router = useRouter();

  const supabase = createClient();

  const [file, setFile] = useState<File>();

  async function uploadFile(file: any, path: string) {
    // const { data, error } = await supabase.storage
    //   .from("avatars")
    //   .upload(path, file);
    // if (error) {
    //   console.log(error);
    // } else {
    //   console.log("success");
    // }
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${path}/avatar`, file, {
        // cacheControl: "3600",
        upsert: true,
      });

    if (data) {
      console.log("success");
    }
  }

  async function signUp(event: FormEvent) {
    const supabase = createClient();
    event.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: `${origin}auth/callback`,
        data: {
          display_name: name,
          bio: bio,
          isToSAccepted: true,
          friends: 0,
          meetups: 0,
        },
      },
    });

    if (error) setMessage("Could not authenticate user");
    // if (data) setMessage("Check email to continue sign in process");
    if (data) {
      // console.log(origin);
      // redirect(`${origin}/login`);
      if (data.user?.id) {
        console.log("uploading");
        uploadFile(file, data.user.id);
      }

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return redirect("/login?message=Could not authenticate user");
      }

      router.push("/map");
      // router.push("/login");
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h1 className="text-xl font-bold text-dark-purple">
              What’s your name?
            </h1>
            <p className="text-dark-purple mb-4">Tell us your first name.</p>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              required
            />
          </>
        );
      case 2:
        return (
          <>
            <h1 className="text-xl font-bold text-dark-purple">
              Tell us about yourself.
            </h1>
            <p className="text-dark-purple mb-4">Create a short bio.</p>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Create a short bio."
              maxLength={250}
              required
            />
            <p className="text-dark-purple text-sm text-right mt-1">
              {bio.length} / 250
            </p>
          </>
        );

      case 3:
        return (
          <>
            <h1 className="text-xl font-bold text-dark-purple">
              What’s your email?
            </h1>
            <p className="text-dark-purple mb-4">So we can contact you.</p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@email.com"
              required
            />
          </>
        );
      case 4:
        return (
          <>
            <h1 className="text-xl font-bold text-dark-purple">
              Create a password.
            </h1>
            <p className="text-dark-purple mb-4">Choose a secure password.</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </>
        );
      case 5:
        return (
          <>
            <h1 className="text-xl font-bold text-dark-purple">
              Upload a photo.
            </h1>
            <p className="text-dark-purple mb-4">Upload a photo of yourself.</p>
            <label
              htmlFor="doc"
              className="flex items-center p-4 gap-3 rounded-3xl border border-gray-300 border-dashed bg-gray-50 cursor-pointer"
            >
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-gray-700">
                  Upload a file
                </h4>
                <span className="text-sm text-gray-500">Max 2 MO</span>
              </div>
              <input
                onChange={(e) => {
                  const files = (e.target as HTMLInputElement).files;

                  if (files && files.length > 0) {
                    setFile(files[0]);
                    console.log("set file");
                  }
                }}
                type="file"
                id="doc"
                name="doc"
                accept="png, jpg"
                hidden
              />
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-dark-purple">
      <div
        className={`animate-in flex flex-col justify-between ${
          currentStep === 0 ? "bg-dark-purple" : "bg-white"
        } p-4 shadow-xl max-w-md h-full w-full`}
      >
        <div>
          {currentStep > 0 && (
            <button
              onClick={currentStep === 0 ? handlePrev : () => router.push("/")}
              className="animate-in text-dark-purple mb-4"
            >
              <ArrowLeft />
            </button>
          )}
          {renderStepContent()}
          {message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {message}
            </p>
          )}
        </div>
        {currentStep > 0 && (
          <button
            onClick={currentStep === 5 ? signUp : handleNext}
            className="w-full inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
          >
            {currentStep === 5 ? "Submit" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}

export default FirstTimeLogin;
