import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import { Smile, Paperclip, X } from "lucide-react";
import { API_BASE_URL } from "@/config";

const POLLING_RATE = 3000;

const Chat = ({ requestId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/messages/${requestId}`, {
        credentials: "include",
      });
      if (resp.ok) {
        const data = await resp.json();

        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLLING_RATE); // Poll every POLLING_RATE ms
    return () => clearInterval(interval);
  }, [requestId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("content", newMessage || " ");
      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const resp = await fetch(`${API_BASE_URL}/api/messages/${requestId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (resp.ok) {
        setNewMessage("");
        setSelectedFile(null);
        fetchMessages(); // Refresh immediately
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (loading) return <div>Loading chat...</div>;

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.userId;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                {/* image */}
                <img
                  src={`${API_BASE_URL}/public/${msg.senderPic}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border"
                />

                {/* msg bubble + timestamp */}
                <div
                  className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`rounded-lg p-3 break-words ${isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {msg.attachment && (
                      <img
                        src={`${API_BASE_URL}/public/${msg.attachment}`}
                        alt="attachment"
                        className="mb-2 rounded-md max-w-full max-h-60 object-cover"
                      />
                    )}
                    <p className="text-sm break-words overflow-wrap-anywhere whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {isMe ? "You" : msg.senderName} •{" "}
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center gap-2 relative">
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-md hover:bg-accent ${selectedFile ? "text-blue-500" : "text-muted-foreground"
              }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {selectedFile && (
            <div className="absolute bottom-16 left-0 bg-background border p-2 rounded shadow-lg flex items-center gap-2">
              <span className="text-xs truncate max-w-[150px]">
                {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showPicker && (
            <div className="absolute bottom-16 right-4 z-50">
              <EmojiPicker
                onEmojiClick={(emojiObj) => {
                  setNewMessage((prev) => prev + emojiObj.emoji);
                  setShowPicker(false);
                }}
                theme="light"
              />
            </div>
          )}

          <Button type="submit" disabled={!newMessage.trim() && !selectedFile}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
