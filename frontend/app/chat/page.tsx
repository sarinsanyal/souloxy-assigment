"use client";

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { io, Socket } from "socket.io-client"


interface Message {
  receiverId: any;
  id: number;
  content: string | null;
  type: "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "EMOJI";
  fileUrl?: string | null;
  isSender: boolean;
  createdAt: string;
  isRead: boolean
}

interface ChatUser {
  id: number;
  name: string;
}

interface DecodedUser {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: "PATIENT" | "THERAPIST";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const [localUser, setLocalUser] = useState<DecodedUser | null>(null);
  const [token, setToken] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized access");
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedUser>(token);
      setLocalUser(decoded);
      setToken(token);

      const storedReceiverId = localStorage.getItem("receiverId");
      if (storedReceiverId) setReceiverId(storedReceiverId);
    } catch (err) {
      toast.error("Invalid token");
      console.log("Something went wrong", err);
      router.push("/login");
    }
  }, []);

  //socket
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_BASE);
    }

    const socket = socketRef.current;
    if (!socket || !localUser) return;

    socket.on("connect", () => {
      console.log("Connected to socket server");
      if (localUser) {
        socket.emit("register", localUser.userId);
        console.log(`Registered user ${localUser.userId} to socket`);
      }
    })

    socket.on("receiveMessage", (msg) => {
      if (!msg || !msg.createdAt || !msg.senderId) return;
      if (msg.senderId === localUser?.userId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, isSender: false }];
      });
    });

    socket.on("readReceipt", ({ readerId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.isSender && String(msg.receiverId) === String(readerId) && !msg.isRead
            ? { ...msg, isRead: true }
            : msg
        )
      );
    });

    return () => {
      socket.disconnect();
    }
  }, [localUser]);

  useEffect(() => {
    if (token) {
      fetchChatUsers();
    }
  }, [token]);

  useEffect(() => {
    if (receiverId && token) {
      fetchMessages();
    }
  }, [receiverId, token]);

  useEffect(() => {
    const shouldScroll =
      messagesEndRef.current &&
      messagesEndRef.current.getBoundingClientRect().top - window.innerHeight < 200;

    if (shouldScroll) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!receiverId || !token || !localUser) return;

    const markMessagesAsRead = async () => {
      try {
        await fetch(`${API_BASE}/api/messages/read/${receiverId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        socketRef.current?.emit("messagesRead", {
          senderId: parseInt(receiverId),
          readerId: localUser?.userId,
        });
      } catch (err) {
        console.log("Error occured: ", err);
      }
    };

    markMessagesAsRead();
  }, [receiverId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/api/messages/${receiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data);
  };

  const fetchChatUsers = async () => {
    const res = await fetch(`${API_BASE}/api/users/chat-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setChatUsers(data);
    } else {
      toast.error(data.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiverId || !localUser) return;

    const message = {
      content: newMessage,
      type: "TEXT",
      receiverId: parseInt(receiverId),
      senderId: localUser.userId,
      createdAt: new Date().toISOString(),
    }

    const res = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });

    if (res.ok) {
      const resData = await res.json();

      socketRef.current?.emit("sendMessage", resData);
      setMessages((prev) => [...prev, resData]);

      setNewMessage("");
      scrollToBottom();

    } else {
      const data = await res.json();
      toast.error(data.message);
    }
  };

  const handleSelectUser = (id: number) => {
    localStorage.setItem("receiverId", String(id));
    setReceiverId(String(id));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("receiverId");
    router.push("/login");
    toast.success("Logged out successfully");
  }

  const handleFileUploadAndSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !receiverId || !localUser) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "useful_preset");
    formData.append("resource_type", "raw");
    formData.append("folder", "chat_uploads");

    toast.loading("Uploading file...");

    try {
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`, {
        method: "POST",
        body: formData,
      });

      const uploaded = await cloudinaryRes.json();
      const fileUrl = uploaded.secure_url;

      let type: Message["type"] = "FILE";
      if (file.type.startsWith("image/")) type = "IMAGE";
      else if (file.type.startsWith("video/")) type = "VIDEO";

      const message = {
        content: null,
        type,
        receiverId: parseInt(receiverId),
        fileUrl,
      };

      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      if (res.ok) {
        const resData = await res.json();
        socketRef.current?.emit("sendMessage", resData);
        setMessages((prev) => [...prev, resData]);
        scrollToBottom();
        toast.success("File sent");
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("File upload failed");
      console.error(error);
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <Toaster />

      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-300 p-4
        fixed z-20 top-0 left-0 h-full transition-transform duration-300
        md:static md:translate-x-0
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <h2 className="text-lg font-semibold mb-4">
          Your {localUser?.userRole === "PATIENT" ? "Therapist" : "Patients"}
        </h2>
        <div className="space-y-2">
          {chatUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                handleSelectUser(user.id);
                setShowSidebar(false);
              }}
              className={`p-2 rounded cursor-pointer hover:bg-blue-100 border-2 border-gray-500 ${receiverId === String(user.id) ? "bg-blue-200" : ""}`}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-gray-500 text-white px-3 py-2 rounded-full shadow"
        onClick={() => setShowSidebar((v) => !v)}
        aria-label="Toggle chat user list"
      >
        {showSidebar ? "Close" : "Users"}
      </button>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-blue-500 text-white font-semibold text-lg flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          <div className="w-full md:w-auto text-center md:text-left">
            {receiverId
              ? `Chat With: ${chatUsers.find((u) => String(u.id) === receiverId)?.name || "Unknown"}`
              : "Select a user to start chatting"}
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
            <HoverCard>
              <HoverCardTrigger className="bg-green-700 px-4 py-1 rounded w-full md:w-auto text-center">
                Your Profile
              </HoverCardTrigger>
              <HoverCardContent>
                <div>
                  Hello <b>{localUser?.userName}</b>
                </div>
                <div>
                  Your Email: <b>{localUser?.userEmail}</b>
                </div>
                <div>
                  Your Role: <b>{localUser?.userRole}</b>
                </div>
              </HoverCardContent>
            </HoverCard>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded cursor-pointer w-full md:w-auto"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* No USer selected */}
        {!receiverId ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500 text-lg">
            Please select a user to start chatting.
          </div>
        ) : (
          <>
            {/* User selected */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[40%] md:max-w-[20%] px-4 py-2 rounded-lg text-sm break-words ${msg.isSender ? "bg-green-400 text-black ml-auto" : "bg-gray-300 text-black"}`}
                >
                  {msg.type === "TEXT" && (
                    <p
                      dangerouslySetInnerHTML={{
                        __html: (msg.content ?? "").replace(
                          /((https?:\/\/[^\s]+))/g,
                          '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-blue-700 hover:text-blue-900">$1</a>'
                        ),
                      }}
                    />
                  )}
                  {(msg.type === "FILE" || msg.type === "IMAGE") && msg.fileUrl && (
                    <div className="flex flex-col gap-1">
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-700 hover:text-blue-900"
                      >
                        {msg.fileUrl.split("/").pop() || "Open file"}
                      </a>

                      {/* 👇 Preview handling */}
                      {msg.type === "IMAGE" ? (
                        <img
                          src={msg.fileUrl}
                          alt="Uploaded"
                          className="max-w-full h-40 object-contain rounded border"
                        />
                      ) : msg.fileUrl.endsWith(".pdf") ? (
                        <iframe
                          src={msg.fileUrl}
                          className="w-full h-40 rounded border"
                          title="PDF Preview"
                        />
                      ) : null}
                    </div>
                  )}
                  {msg.isSender && (
                    <div className="text-[10px] opacity-70 text-right mt-1">
                      {msg.isRead ? "✓✓ Read" : "✓ Sent"}
                    </div>
                  )}
                  <div className="text-[10px] opacity-70 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* input message */}
            <div className="flex p-4 border-t bg-white">
              <label className="mx-2 bg-gray-300 text-white px-4 py-2 rounded-full hover:bg-blue-600 cursor-pointer">
                Attach
                <input
                  type="file"
                  hidden
                  onChange={handleFileUploadAndSend}
                />
              </label>
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 cursor-pointer"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
