"use client";
import { TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { ChatRequest } from "@/stores/types";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { User } from "@supabase/supabase-js";
import router from "next/router";
import React from "react";
import { useState, useEffect } from "react";

export default function MessagesPage() {
  const supabase = createClient();
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();

  const chatRequestsChannel = supabase.channel("chat-requests");

  useEffect(() => {
    const fetchUser = async () => {
      const userResponse = await supabase.auth.getUser();
      if (!userResponse.data.user) {
        router.push("/login");
      } else {
        setUser(userResponse.data.user);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      const chatRequestsChannel = supabase
        .channel("chat-requests")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_requests" },
          (payload) => {
            if (payload.new && payload.new.receiver_id === user.id) {
              setChatRequests((currentRequests) => [
                ...currentRequests,
                {
                  // Ensure that the object structure matches the ChatRequest type
                  id: payload.new.id,
                  sender_id: payload.new.sender_id,
                  receiver_id: payload.new.receiver_id,
                  status: payload.new.status,
                  display_name: payload.new.display_name,
                  bio: payload.new.bio,
                  latitude: payload.new.latitude,
                  longitude: payload.new.longitude,
                  chat_session_id: payload.new.chat_session_id,
                },
              ]);
            }
          }
        )
        .subscribe();

      return () => {
        chatRequestsChannel.unsubscribe();
      };
    }
  }, [user]);

  // async function handleAcceptRequest(requestId: number) {
  //   const { error } = await supabase
  //     .from("chat_requests")
  //     .update({ status: "accepted" })
  //     .eq("id", requestId);

  //   if (error) {
  //     console.error("Error accepting chat request:", error);
  //   } else {
  //     router.push(`/chat/${requestId}`); // Assuming the chat page uses the request ID
  //   }
  // }

  // async function handleDenyRequest(requestId: number) {
  //   const { error } = await supabase
  //     .from("chat_requests")
  //     .update({ status: "rejected" })
  //     .eq("id", requestId);

  //   if (error) {
  //     console.error("Error denying chat request:", error);
  //   }
  // }

  console.log(chatRequests);

  return (
    <div className="flex w-full bg-gray-50 h-screen items-center justify-center">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Tabs className="w-4/5 h-full flex flex-col gap-2 items-center">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            {chatRequests.length === 0 ? (
              <p className="text-dark-purple">No chat requests</p>
            ) : (
              <div className="w-full h-full flex flex-col">
                {chatRequests.map((request) => {
                  if (request.status === "pending")
                    return (
                      <div
                        key={request.id}
                        className="flex flex-row justify-between items-center p-4 bg-white shadow rounded mb-2"
                      >
                        <div className="w-full flex flex-col">
                          <div>
                            <p className="text-black">
                              Request from {request.display_name}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-row justify-end">
                            <button
                              // onClick={() => handleDenyRequest(request.id)}
                              className="py-2 px-4 border-2 border-dark-purple text-dark-purple rounded"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => {
                                // handleAcceptRequest(request.id);
                              }}
                              className="py-2 px-4 bg-dark-purple text-white rounded"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="messages"></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
