"use client";
import { House, MapTrifold, User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { JSX, SVGProps } from "react";
import { usePathname } from "next/navigation";
import { ChatCircleDots } from "@phosphor-icons/react";

export function BottomNavigation() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/" || pathname === "/onboarding") {
    return <></>;
  } else
    return (
      <nav
        style={{ zIndex: 9999999 }}
        className="max-w-xs mx-auto bg-white fixed bottom-0 inset-x-0 grid gap-0 w-full border-t-2 border-gray-100/20 dark:border-gray-850/50"
      >
        <div className="grid w-full py-2 grid-flow-col gap-0 items-center justify-evenly">
          <Link
            href="/home"
            className={`${
              pathname === "/home"
                ? "dark:text-dark-purple text-dark-purple"
                : "text-gray-500 dark:text-gray-400"
            } flex flex-col items-center text-xs transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-dark-purple transition-active:scale-95`}
          >
            {pathname === "/home" ? (
              <House className="h-5 w-5 text-dark-purple" weight="fill" />
            ) : (
              <House className="h-5 w-5" />
            )}
            Home
            <span className="sr-only">Home</span>
          </Link>
          <Link
            href="/map"
            className={`${
              pathname === "/map"
                ? "dark:text-dark-purple text-dark-purple"
                : "text-gray-500 dark:text-gray-400"
            } flex flex-col items-center text-xs transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-dark-purple transition-active:scale-95`}
          >
            {pathname === "/map" ? (
              <MapTrifold className="h-5 w-5 text-dark-purple" weight="fill" />
            ) : (
              <MapTrifold className="h-5 w-5" />
            )}
            Map
            <span className="sr-only">Map</span>
          </Link>
          <Link
            href="/profile"
            className={`${
              pathname === "/profile"
                ? "dark:text-dark-purple text-dark-purple"
                : "text-gray-500 dark:text-gray-400"
            } flex flex-col items-center text-xs transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-dark-purple transition-active:scale-95`}
          >
            {pathname === "/profile" ? (
              <User className="h-5 w-5 text-dark-purple" weight="fill" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Profile
            <span className="sr-only">Profile</span>
          </Link>
          <Link
            href="/messages"
            className={`${
              pathname === "/messages"
                ? "dark:text-dark-purple text-dark-purple"
                : "text-gray-500 dark:text-gray-400"
            } flex flex-col items-center text-xs transition-colors text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-dark-purple transition-active:scale-95`}
          >
            {pathname === "/messages" ? (
              <ChatCircleDots
                className="h-5 w-5 text-dark-purple"
                weight="fill"
              />
            ) : (
              <ChatCircleDots className="h-5 w-5" />
            )}
            Chats
            <span className="sr-only">Chats</span>
          </Link>
        </div>
      </nav>
    );
}
