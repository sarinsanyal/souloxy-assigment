"use client";

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface Message {
  id: number;
  content: string | null;
  type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "EMOJI";
  fileUrl?: string | null;
  isSender: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const receiverId = typeof window !== "undefined" ? localStorage.getItem("receiverId") : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/api/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const res = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: newMessage,
        type: "TEXT",
        receiverId: parseInt(receiverId || "0"),
      }),
    });

    const sent = await res.json();
    setMessages((prev) => [...prev, sent]);
    setNewMessage("");
    scrollToBottom();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-blue-500 text-white font-semibold text-lg">
          Chat with your therapist
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                msg.isSender
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.type === "TEXT" && <p>{msg.content}</p>}
              {msg.type === "FILE" && (
                <a
                  href={msg.fileUrl || "#"}
                  target="_blank"
                  className="underline"
                  rel="noopener noreferrer"
                >
                  {msg.fileUrl}
                </a>
              )}
              <div className="text-[10px] opacity-70 text-right mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex p-4 border-t bg-white">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
