import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import AuthButton from "@/components/AuthButton";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/map");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect(
      "/login?message=Check your email to continue sign in process"
    );
  };

  return (
    <div className="max-w-md mx-auto flex flex-col w-full gap-20 items-center bg-white h-screen py-8">
      <form className="w-4/5 animate-in flex-1 flex flex-col gap-2 text-dark-purple justify-between">
        <div className="flex flex-col">
          <Link href="/" className="text-dark-purple mb-4">
            <ArrowLeft weight="bold" size={32} />
          </Link>
          {/* <AuthButton /> */}
          <h1 className="text-md font-bold text-dark-purple">
            Login or Sign up
          </h1>
          <p className="text-dark-purple mb-4 text-xs">
            Tell your friends about Swibe!
          </p>
          <label className="text-sm" htmlFor="email">
            Email
          </label>
          <input
            className="flex h-10 w-full rounded-md border active:bg-white border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-sm mt-2" htmlFor="password">
            Password
          </label>
          <input
            className="flex h-10 w-full rounded-md border active:bg-white border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-dark-purple/10 text-dark-purple text-center">
              {searchParams.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* <SubmitButton
            formAction={signIn}
            className="w-full inline-flex h-12 items-center justify-center rounded-lg border-dark-purple border-2 text-dark-purple font-medium bg-white transition active:scale-95"
            pendingText="Signing In..."
          >
            Sign In
          </SubmitButton> */}
          <SubmitButton
            formAction={signIn}
            className="w-full inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
            pendingText="Signing In..."
          >
            Sign In
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
