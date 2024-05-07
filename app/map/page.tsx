"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  NearestUser,
  useLocationStore,
  useProfileStore,
} from "@/stores/stores";
import { haversineDistance } from "@/utils/haversine";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Drawer } from "vaul";
import Link from "next/link";
import { ChatRequest } from "@/stores/types";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import fetchAvatarFromUrl from "@/utils/avatar";
import fetchAvatarFromUser from "@/utils/avatar";

interface UserLocation {
  id: string; // Assuming IDs are strings, adjust according to your database schema
  display_name: string;
  bio: string;
  latitude: number;
  longitude: number;
}

const MapPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const { profile, setProfile, updateProfile } = useProfileStore();
  const { location, nearestUsers, setNearestUsers, setLocation } =
    useLocationStore();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<NearestUser | null>();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);

  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [media, setMedia] = useState<string>();
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 15,
  });

  const [user, setUser] = useState<User>();

  const chatRequestsChannel = supabase.channel("chat-requests");

  useEffect(() => {
    if (location) {
      setViewport({
        ...viewport,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        router.push("/login");
      } else {
        // Fetch profile information
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
        const { data: avatarData } = await supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.data.user.id}/avatar`);
        // .createSignedUrl(`${user.data.user.id}/avatar`, 60);
        setMedia(avatarData.publicUrl);

        setProfile(profileData);
        setUser(user.data.user);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchUserAndLocation = async () => {
      const user = supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (!location && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const locationData = { latitude, longitude };
            useLocationStore.getState().setLocation(locationData); // Save to Zustand store directly

            const { error: updateError } = await supabase
              .from("profiles")
              .update({ user_location: locationData })
              .eq("id", (await user).data.user?.id);

            if (updateError) {
              setError(updateError.message);
            }
            setLoading(false);
          },
          (locationError) => {
            setError(locationError.message);
          }
        );
      } else {
        setLoading(false);
      }
    };

    fetchUserAndLocation();
  }, [router, supabase]);

  useEffect(() => {
    const fetchNearestUsers = async () => {
      if (location) {
        const userLocations = await fetchUserLocations(); // Fetch all user locations
        const nearest = userLocations
          .filter((userLocation: UserLocation) => {
            const distance = haversineDistance(location, userLocation);
            return distance <= 1; // 5 km radius
          })
          .slice(0, 10); // top 10 nearest users

        setNearestUsers(nearest);
      }
      setLoading(false);
    };

    if (!nearestUsers.length && location) {
      fetchNearestUsers();
    }
  }, [location, nearestUsers.length, setNearestUsers]);

  useEffect(() => {
    async function fetchAvatar() {
      const supabase = createClient();
      const userId = selectedUser?.id ?? chatRequests[0]?.sender_id;
      const { data: avatarData } = await supabase.storage
        .from("avatars")
        .getPublicUrl(`${userId}/avatar`);
      // .createSignedUrl(`/${userId}/avatar`, 60);

      // console.log("set avatar to id", avatarData.publicUrl);
      setAvatarUrl(avatarData.publicUrl);
    }

    fetchAvatar();
  }, [selectedUser, chatRequests]);

  chatRequestsChannel
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_requests" },
      (payload) => {
        if (payload.new && payload.new.receiver_id === user?.id) {
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
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_requests",
      },
      (payload) => {
        if (
          payload.new.status === "accepted" &&
          (payload.new.receiver_id === user?.id ||
            payload.new.sender_id === user?.id)
        ) {
          // console.log("Redirecting to chat page");
          router.push(`/messages/${payload.new.chat_session_id}`);
        }
      }
    )
    .subscribe();

  async function sendChatRequest(receiverId: string) {
    // Send a new chat request
    const user = supabase.auth.getUser();
    const sessionId = uuidv4();
    const { data, error } = await supabase.from("chat_requests").insert([
      {
        sender_id: (await user).data.user?.id,
        receiver_id: receiverId,
        status: "pending",
        display_name: profile.display_name,
        bio: profile.bio,
        latitude: location?.latitude,
        longitude: location?.longitude,
        chat_session_id: sessionId,
      },
    ]);

    if (error) {
      console.error("Error sending chat request:", error);
    } else {
      // Broadcast the new request
      data &&
        chatRequestsChannel.send({
          type: "broadcast",
          event: "chat-requests-update",
          payload: { new: data[0] },
        });
    }
  }

  // Function to fetch all user locations
  async function fetchUserLocations(): Promise<UserLocation[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_location, display_name, bio")
      .not("user_location", "is", null) // Exclude profiles without locations
      .not("isincognito", "is", true);

    if (error) {
      console.error("Error fetching user locations:", error);
      return [];
    }

    // Transform data to have a flat structure with id, latitude, and longitude
    const locations = data.map((profile) => ({
      id: profile.id,
      display_name: profile.display_name,
      bio: profile.bio,
      latitude: profile.user_location.latitude,
      longitude: profile.user_location.longitude,
    }));

    return locations;
  }

  async function handleMeetNow() {
    const user = await supabase.auth.getUser();
    if (nearestUsers.length > 0) {
      // Get the current user's ID
      const currentUserId = user.data.user?.id;

      // Filter out the current user and any user who has already received a chat request
      const eligibleUsers = nearestUsers.filter((user) => {
        return (
          user.id !== currentUserId &&
          user.id !== selectedUser?.id &&
          !chatRequests.some((req) => {
            return (
              req.receiver_id === user.id && req.sender_id === currentUserId
            );
          })
        );
      });

      if (eligibleUsers.length > 0) {
        // Select a random user from the filtered list
        const randomUser =
          eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
        setSelectedUser(randomUser);
        setIsRequestSent(true);
      } else {
        alert("No eligible nearby users available");
      }
    } else {
      alert("No nearby users available");
    }
  }

  async function handleAcceptRequest(requestId: string) {
    // const sessionId = uuidv4();
    setLoading(true);
    const { error } = await supabase
      .from("chat_requests")
      .update({ status: "accepted" })
      .eq("chat_session_id", requestId);

    const { error: sessionError } = await supabase
      .from("chat_sessions")
      .insert([
        {
          chat_session_id: requestId,
          user_1: user?.id,
          user_2: chatRequests[0].sender_id,
        },
      ]);

    if (sessionError) {
      console.log(sessionError);
    }

    if (error) {
      console.error("Error accepting chat request:", error);
    } else {
      // Broadcast that the request has been accepted
      chatRequestsChannel.send({
        type: "broadcast",
        event: "chat-requests-update",
        payload: { accepted: requestId, status: "accepted" },
      });

      // Redirect to the chat page
      router.push(`/messages/${requestId}`);
    }
  }

  // function handleMeetNow() {
  //   if (nearestUsers.length > 0) {
  //     // Select a random user from the nearestUsers array
  //     const randomUser =
  //       nearestUsers[Math.floor(Math.random() * nearestUsers.length)];
  //     setSelectedUser(randomUser);
  //   } else {
  //     alert("No nearby users available");
  //   }
  // }

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

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full h-screen bg-gray-50 text-dark-purple">
      <Map
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onMove={(evt) => setViewport(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        // style={{ height: "100%" }}
      >
        {nearestUsers.map((user, index) => {
          const imageSize = Math.max(10, viewport.zoom * 3);
          return (
            <Marker
              key={index}
              latitude={user.latitude}
              longitude={user.longitude}
            >
              <button
                style={{ width: imageSize / 3, height: imageSize / 3 }}
                className="bg-[#332261] rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user);
                }}
              />
            </Marker>
          );
        })}
        {/* {selectedUser && (
          <Popup
            latitude={selectedUser.latitude}
            longitude={selectedUser.longitude}
            onClose={() => setSelectedUser(null)}
            style={{ borderRadius: "0.5rem", display: "flex" }}
          >
            <div className="flex flex-col items-center p-1">
              <h3 className="mt-2">{selectedUser.display_name}</h3>
              <p>Bio: {selectedUser.bio}</p>
              <button
                onClick={() => sendChatRequest(selectedUser.id)}
                className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 shadow-lg shadow-neutral-500/20 transition active:scale-95"
              >
                Request to meet
              </button>
            </div>
          </Popup>
        )} */}
      </Map>
      <Drawer.Root>
        <div className="items-center flex flex-col w-full justify-center">
          <Drawer.Trigger asChild>
            <button
              onClick={handleMeetNow}
              className="fixed p-4 px-12 bottom-16 inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
            >
              Meet Now
            </button>
          </Drawer.Trigger>
        </div>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 h-full w-full " />
          <Drawer.Content
            style={{ zIndex: 99999999 }}
            className="flex w-full h-screen flex-col fixed inset-0 mx-auto my-auto bg-gray-100 rounded-lg shadow-lg"
          >
            <div className="max-w-md w-full mx-auto flex flex-col overflow-auto p-4 rounded-t-[10px] items-center">
              <div className="overflow-auto">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                <header className="text-2xl text- mt-2 text-dark-purple justify-start flex">
                  Found nearby...
                </header>
                <Drawer.Title className="font-medium mb-4">
                  Meet Now
                </Drawer.Title>
              </div>
              {selectedUser ? (
                <>
                  <div className="w-4/5">
                    <div className="w-full overflow-hidden h-[128] flex rounded-lg">
                      <Image
                        src={avatarUrl}
                        alt="User Avatar"
                        width={150}
                        height={150}
                        unoptimized={true}
                        objectFit="cover"
                        loading="lazy"
                        className="w-full"
                      />
                    </div>
                    <header className="text-4xl text- mt-2 text-dark-purple">
                      {selectedUser.display_name}
                    </header>
                    <h3 className="mt-2 text-2xl text-dark-purple">
                      {selectedUser.bio}
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      selectedUser && sendChatRequest(selectedUser.id)
                    }
                    className="w-4/5 inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
                  >
                    Request to meet
                  </button>
                </>
              ) : (
                <div>loading</div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      {chatRequests.length > 0 && (
        <Drawer.Root
          open={chatRequests.length > 0}
          onClose={() => chatRequests.splice(0)}
        >
          <div className="items-center flex flex-col w-full justify-center"></div>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 h-full w-full " />
            <Drawer.Content
              style={{ zIndex: 99999999 }}
              className="flex w-full h-screen flex-col fixed inset-0 mx-auto my-auto bg-gray-100 rounded-lg shadow-lg"
            >
              <div className="max-w-md w-full mx-auto flex flex-col overflow-auto p-4 rounded-t-[10px] items-center">
                <div className="overflow-auto">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                  <header className="text-2xl text- mt-2 text-dark-purple justify-start flex">
                    Someone wants to meet you
                  </header>
                </div>
                <>
                  <div className="w-4/5">
                    <div className="w-full overflow-hidden flex rounded-lg">
                      <Image
                        src={avatarUrl}
                        alt="User Avatar"
                        width={150}
                        height={150}
                        unoptimized={true}
                        objectFit="cover"
                        loading="lazy"
                        className="w-full overflow-hidden"
                      />
                    </div>
                    <div className="w-full align-bottom justify-center">
                      <header className="text-4xl text- mt-2 text-dark-purple">
                        {chatRequests[0].display_name}
                      </header>
                      <h3 className="mt-2 text-2xl text-dark-purple">
                        {chatRequests[0].bio}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        handleAcceptRequest(chatRequests[0].chat_session_id)
                      }
                      className="w-full inline-flex h-12 items-center justify-center rounded-lg text-white font-medium bg-dark-purple transition active:scale-95"
                    >
                      Accept
                    </button>
                  </div>
                </>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </div>
  );
};

export default MapPage;
