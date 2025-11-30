import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const Chat = ({ requestId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const resp = await fetch(`/api/messages/${requestId}`, {
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
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const resp = await fetch(`/api/messages/${requestId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ content: newMessage }),
            });

            if (resp.ok) {
                setNewMessage("");
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
                    <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === user.userId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${isMe
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {isMe ? "You" : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
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
                <Button type="submit" disabled={!newMessage.trim()}>
                    Send
                </Button>
            </form>
        </div>
    );
};

export default Chat;
