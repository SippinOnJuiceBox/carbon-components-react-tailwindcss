"use client";
import React from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function TOSButton() {
  return (
    <div className="flex flex-col justify-between w-4/5">
      <Drawer.Root>
        <div className="flex-grow flex flex-col justify-end mb-4 w-full h-full">
          <Drawer.Trigger asChild>
            <Button className="w-full shadow-lg bg-white text-dark-purple py-2 rounded-lg hover:bg-gray-200 transition active:scale-95">
              Get Started
            </Button>
          </Drawer.Trigger>
        </div>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 h-full" />
          <Drawer.Content className="flex w-screen h-screen flex-col fixed inset-0 mx-auto my-auto bg-gray-100 rounded-lg shadow-lg">
            <div className="max-w-md w-full mx-auto flex flex-col overflow-auto p-4 rounded-t-[10px] items-center">
              <div className="overflow-auto">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                <Drawer.Title className="font-medium mb-4">
                  Terms of service
                </Drawer.Title>
                <p className="text-base mb-2 text-dark-purple">
                  Last updated: March 10, 2024
                </p>

                <p className="text-base mb-4 text-dark-purple">
                  Welcome to Swibe! We are a social app that helps people meet
                  others and create meaningful connections. By using our app,
                  you agree to be bound by these Terms of Service and our
                  Privacy Policy. If you do not agree to these terms, please do
                  not use our app.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  1. Use of Our Service
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  Swibe provides a platform for users to interact, communicate,
                  and meet new people. You must use our service in a manner
                  consistent with any and all applicable laws and regulations.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  2. User Accounts
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  To use Swibe, you must create an account. You are responsible
                  for maintaining the confidentiality of your account and
                  password and for restricting access to your device. You agree
                  to accept responsibility for all activities that occur under
                  your account or password.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  3. User Conduct
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  You agree not to use the app to: Post or transmit any content
                  that is inappropriate, offensive, or violates any laws.
                  Harass, threaten, or intimidate other users. Engage in any
                  fraudulent or deceptive practices. Violate the intellectual
                  property rights of others.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  4. Content Ownership
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  You retain all rights in the content you post to Swibe.
                  However, by posting content, you grant us a non-exclusive,
                  royalty-free, perpetual, and worldwide license to use,
                  display, and distribute your content in connection with the
                  app.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  5. Privacy
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  Your privacy is important to us. Please review our Privacy
                  Policy for information on how we collect, use, and share your
                  information.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  6. Changes to the Terms
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  We reserve the right to modify these Terms of Service at any
                  time. We will notify you of any changes by posting the new
                  terms on our app. Your continued use of the app after any
                  changes indicates your acceptance of the new terms.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  7. Termination
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  We may terminate or suspend your access to the app at any
                  time, without notice, for any reason, including for violation
                  of these Terms of Service.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  8. Disclaimer of Warranties
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  The app is provided "as is" without any warranties of any
                  kind. We do not guarantee the accuracy, completeness, or
                  usefulness of any information on the app.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  9. Limitation of Liability
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  To the fullest extent permitted by law, we shall not be liable
                  for any damages arising out of or in connection with your use
                  of the app.
                </p>

                <p className="text-lg font-bold mb-2 text-dark-purple">
                  11. Contact Us
                </p>
                <p className="text-base mb-4 text-dark-purple">
                  If you have any questions about these Terms of Service, please
                  contact us at info@swibe.xyz
                </p>
              </div>
              <Link
                href="/onboarding"
                className="text-center w-4/5 shadow-lg bg-dark-purple text-white py-2 rounded-lg hover:bg-dark-purple/80 transition active:scale-95"
              >
                Agree
              </Link>
              {/* <div className="sticky bottom-0 left-0 right-0 bg-white">
              </div> */}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
