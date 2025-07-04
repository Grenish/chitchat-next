"use client";

import { useEffect, useState, useRef } from "react";
import {
  useSearchParams,
  useParams,
  useRouter,
  usePathname,
} from "next/navigation";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, Share2, ArrowLeft, Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  userName: string;
  message: string;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState(searchParams?.get("userName") || "");
  const [nameInput, setNameInput] = useState("");
  const [isNameSet, setIsNameSet] = useState(!!searchParams?.get("userName"));
  const [copied, setCopied] = useState(false);

  const roomId = params?.id as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userCount, setUserCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId || !isNameSet) return;
    const newSocket = io({ path: "/api/socket" });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-room", roomId);
    });

    newSocket.on("receive-message", (data: Message) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("user-count", (count: number) => {
      setUserCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, isNameSet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/chat/${roomId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my chat room!",
          text: `Join me in this chat room: ${roomId}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log("Error sharing", error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const messageData = {
        roomId,
        userName,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit("send-message", messageData);
      setNewMessage("");
    }
  };

  // Auto-resize textarea function
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    e.target.style.height = 'auto';
    
    const newHeight = Math.min(Math.max(e.target.scrollHeight, 44), 120);
    e.target.style.height = `${newHeight}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      const newUserName = nameInput.trim();
      setUserName(newUserName);
      setIsNameSet(true);
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      newSearchParams.set("userName", newUserName);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  };

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-surface-tonal-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-light-100/90 dark:bg-surface-tonal-200/95 backdrop-blur-sm rounded-2xl shadow-xl border border-surface-tonal-400/30 dark:border-surface-400/50 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-surface-100 dark:text-light-100">
              Join Room
            </h2>
            <p className="text-surface-500 dark:text-surface-600 text-sm">
              Room: <span className="font-mono font-medium">{roomId}</span>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="nameInput"
                className="text-sm font-medium text-surface-400 dark:text-surface-600 block"
              >
                Display Name
              </label>
              <Input
                id="nameInput"
                type="text"
                placeholder="Enter your display name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleNameSubmit()}
                className="h-11 px-4 bg-surface-tonal-600/20 dark:bg-surface-tonal-300/50 border-surface-tonal-400 dark:border-surface-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-100/20 focus:border-primary-100 dark:focus:border-primary-300 text-surface-100 dark:text-light-100"
              />
            </div>
            <Button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="w-full h-11 bg-primary-100 hover:bg-primary-200 dark:bg-primary-200 dark:hover:bg-primary-300 text-light-100 font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface-tonal-100">
      {/* Header */}
      <header className="bg-light-100/90 dark:bg-surface-tonal-200/95 backdrop-blur-sm border-b border-surface-tonal-400/30 dark:border-surface-400/50 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="border-surface-tonal-400 dark:border-surface-400 text-surface-400 dark:text-surface-600 hover:bg-surface-tonal-600/10 dark:hover:bg-surface-tonal-400"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-surface-100 dark:text-light-100">
                ChitChat
              </h1>
              <div className="flex items-center space-x-3 text-sm text-surface-500 dark:text-surface-600">
                <span className="font-mono">{roomId}</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{userCount} online</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-surface-tonal-400 dark:border-surface-400 text-surface-400 dark:text-surface-600 hover:bg-surface-tonal-600/10 dark:hover:bg-surface-tonal-400"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-100/20 dark:bg-primary-200/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary-100 dark:text-primary-200" />
              </div>
              <p className="text-surface-500 dark:text-surface-600 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.userName === userName;
              const prevMessage = messages[index - 1];
              const nextMessage = messages[index + 1];

              const isFirstInGroup = !prevMessage || prevMessage.userName !== msg.userName;
              const isLastInGroup = !nextMessage || nextMessage.userName !== msg.userName;

              const getBubbleRounding = () => {
                if (isOwnMessage) {
                  if (isFirstInGroup && isLastInGroup) return "rounded-2xl";
                  if (isFirstInGroup) return "rounded-2xl rounded-br-md";
                  if (isLastInGroup) return "rounded-2xl rounded-tr-md";
                  return "rounded-l-2xl rounded-r-md";
                } else {
                  if (isFirstInGroup && isLastInGroup) return "rounded-2xl";
                  if (isFirstInGroup) return "rounded-2xl rounded-bl-md";
                  if (isLastInGroup) return "rounded-2xl rounded-tl-md";
                  return "rounded-r-2xl rounded-l-md";
                }
              };

              return (
                <div key={index} className="space-y-1">
                  <div
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-lg">
                      {/* Message Content */}
                      <div
                        className={`px-4 py-3 ${
                          isOwnMessage
                            ? "bg-primary-100 text-light-100"
                            : "bg-light-100 dark:bg-surface-tonal-300 text-surface-100 dark:text-light-100 border border-surface-tonal-400/20 dark:border-surface-400/20"
                        } ${getBubbleRounding()} shadow-sm`}
                      >
                        <div className="text-sm leading-relaxed break-words">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isLastInGroup && (
                    <div
                      className={`flex items-center space-x-2 text-xs text-surface-400 dark:text-surface-500 px-1 ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="font-medium">
                        {isOwnMessage ? "You" : msg.userName}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  {isLastInGroup && index < messages.length - 1 && (
                    <div className="h-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-light-100/90 dark:bg-surface-tonal-200/95 backdrop-blur-sm border-t border-surface-tonal-400/30 dark:border-surface-400/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <Textarea
              placeholder="Type a message... (Shift+Enter for new line)"
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-11 max-h-30 px-4 py-3 bg-surface-tonal-600/20 dark:bg-surface-tonal-300/50 border-surface-tonal-400 dark:border-surface-400 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary-100/20 focus:border-primary-100 dark:focus:border-primary-300 text-surface-100 dark:text-light-100 resize-none overflow-y-auto leading-5"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-11 px-4 bg-primary-100 hover:bg-primary-200 dark:bg-primary-200 dark:hover:bg-primary-300 text-light-100 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
