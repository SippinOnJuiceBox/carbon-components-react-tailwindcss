import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import TOSButton from "@/components/TOSButton";

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    // <div className="flex-1 w-full flex flex-col gap-20 items-center">
    //   <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
    //     <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
    //       <DeployButton />
    //       {isSupabaseConnected && <AuthButton />}
    //     </div>
    //   </nav>

    //   <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
    //     <Header />
    //     <main className="flex-1 flex flex-col gap-6">
    //       <h2 className="font-bold text-4xl mb-4">Next steps</h2>
    //       {isSupabaseConnected ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
    //     </main>
    //   </div>

    //   <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
    //     <p>
    //       Powered by{" "}
    //       <a
    //         href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
    //         target="_blank"
    //         className="font-bold hover:underline"
    //         rel="noreferrer"
    //       >
    //         Supabase
    //       </a>
    //     </p>
    //   </footer>
    // </div>
    <>
      <div className="flex flex-col w-full h-screen bg-dark-purple justify-center items-center">
        <Image
          className="mt-64 w-2/3"
          src="/images/logo.png"
          alt="Phone Screen"
          width={200}
          height={200}
          // objectFit="contain"
          objectPosition="center"
        />
        <div
          key="1"
          className="animate-in flex-grow flex flex-col justify-end w-full h-full items-center gap-2 mb-8"
        >
          {/* <AuthButton /> */}
          {/* <Link
            href="/onboarding"
            className="w-4/5 inline-flex h-12 items-center justify-center rounded-lg bg-white font-medium text-dark-purple transition active:scale-95"
          >
            Get Started
          </Link> */}
          <TOSButton />
          <div className="text-xs gap-1 flex flex-row">
            <p>Already have an account?</p>
            <Link className="font-semibold underline text-xs" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
