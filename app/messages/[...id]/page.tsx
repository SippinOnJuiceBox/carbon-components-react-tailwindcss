"use client";
import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Message, Profile } from "@/stores/types";
import { User } from "@supabase/supabase-js";
import router from "next/router";
import { useProfileStore } from "@/stores/stores";
import Link from "next/link";

const ChatSessionPage = ({ params }: { params: { id: string } }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatPartner, setChatPartner] = useState<Profile>();
  const supabase = createClient();
  const messagingChannel = params.id[0];

  const { profile, setProfile, updateProfile } = useProfileStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data.user) {
        router.push("/login");
      } else {
        setCurrentUser(userResponse.data.user);
        setLoading(false);
      }
    };

    fetchUser();

    const getSessionData = async () => {
      const currentUser = supabase.auth.getUser();
      let { data: chat_session, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("chat_session_id", messagingChannel);

      if (chat_session) {
        const partnerId =
          chat_session[0].user_1 === (await currentUser).data.user?.id
            ? chat_session[0].user_2
            : chat_session[0].user_1;

        let { data: partner } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", partnerId);
        partner && setChatPartner(partner[0]);
        console.log(chatPartner?.display_name);
      }
    };

    getSessionData();
  }, []);

  const msgChannel = supabase.channel(messagingChannel);
  msgChannel
    .on("broadcast", { event: "msg" }, (payload) => {
      const newMessage = payload.payload as Message;
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    })
    .subscribe();

  function handleSendMessage() {
    if (!newMessage.trim()) return;
    const msgChannel = supabase.channel(messagingChannel);
    msgChannel.send({
      type: "broadcast",
      event: "msg",
      payload: {
        sender_id: currentUser?.id,
        sender_name: profile.display_name,
        content: newMessage.trim(),
        chat_session_id: messagingChannel,
      },
    });
    setNewMessage("");
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
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <div
        className={`animate-in flex flex-col justify-between p-4 shadow-xl max-w-xs h-full w-full`}
      >
        {/* <div className="flex flex-row"></div> */}
        <div className="p-4 flex items-center justify-center align-middle">
          <Link href="/map" className="animate-in text-dark-purple">
            <ArrowLeft weight="bold" size={32} />
          </Link>
          <h1 className="bold flex-1 text-center text-dark-purple">
            {chatPartner?.display_name}
          </h1>
          <div className="w-10 h-8 rounded-full flex items-center justify-center overflow-hidden"></div>
        </div>
        {/* <button className="animate-in text-dark-purple mb-4">
          <ArrowLeft weight="bold" size={32} />
        </button>
        <p className="text-dark-purple">{chatPartner?.display_name}</p> */}
        <div className="flex-1 overflow-y-auto overflow-auto">
          {messages.map((message) => (
            <div
              className={`flex ${
                message.sender_id === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              } my-1`}
              key={message.content}
            >
              <div className="flex flex-col">
                <p
                  className={`px-4 py-2 rounded-lg ${
                    message.sender_id === currentUser?.id
                      ? "bg-dark-purple rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                      : "rounded-br-3xl rounded-tr-3xl rounded-tl-xl bg-gray-200 text-dark-purple"
                  } break-words max-w-60 animate-slide-up-fade`}
                >
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex flex-row mb-12 gap-2">
          <Input
            className="border-gray-300 focus:ring-dark-purple focus:border-dark-purple rounded-full w-full py-2 px-4 text-dark-purple"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(key) => key.code === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-dark-purple rounded-full text-white p-3 transition active:scale-95 active:bg-dark-purple/80"
          >
            <PaperPlaneTilt weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSessionPage;
