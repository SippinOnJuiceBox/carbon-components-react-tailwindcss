export type Message = {
  id: number;
  sender_id: string; // UUID of the sender
  content: string;
  chat_session_id: string;
  sender_name: string;
};

export type ChatRequest = {
  id: number;
  display_name: string;
  bio: string;
  latitude: number;
  longitude: number;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  chat_session_id: string;
};

export interface Profile {
  display_name: string;
  bio: string;
  avatar_url: string;
  isincognito: string;
}
