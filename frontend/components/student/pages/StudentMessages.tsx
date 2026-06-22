"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getConversations, getMessages, sendMessage } from "@/lib/api/chat";
import type { StudentProfile, Conversation, Message } from "@/types/student";
import { Send, MessageSquare } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

export default function StudentMessages({ token, profile }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations(token, true).then(d => setConversations(d.conversations || [])).catch(() => {});
  }, [token]);

  const loadMessages = useCallback(async (conv: Conversation) => {
    setActiveConv(conv);
    try {
      const data = await getMessages(token, conv._id, true);
      setMessages(data.messages || []);
    } catch {}
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const data = await sendMessage(token, activeConv._id, text, true);
      if (data.message) setMessages(m => [...m, data.message]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  const otherParticipant = activeConv?.participants.find(p => p.participantType !== "student");

  return (
    <div className="flex h-full" style={{ height: "calc(100vh - 73px)" }}>
      {/* Conversation list */}
      <div className={`flex flex-col border-r border-gray-100 bg-white ${activeConv ? "hidden md:flex w-72" : "flex-1 md:w-72 md:flex-none"}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h3 className="text-sm font-black text-[#00000F]">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-[#00000F]/40">
              <MessageSquare size={24} className="mx-auto mb-2 text-gray-200" />
              <p className="text-xs font-medium">No conversations yet</p>
            </div>
          ) : conversations.map(conv => {
            const other = conv.participants.find(p => p.participantType !== "student");
            return (
              <button key={conv._id} onClick={() => loadMessages(conv)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${activeConv?._id === conv._id ? "bg-[#FACE39]/5 border-l-2 border-l-[#FACE39]" : ""}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FACE39]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[#b08800]">{other?.name?.charAt(0) || "?"}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#00000F] truncate">{other?.name || conv.title}</p>
                    <p className="text-[10px] text-[#00000F]/40 capitalize">{other?.role}</p>
                    {conv.lastMessage && (
                      <p className="text-[10px] text-[#00000F]/40 truncate mt-0.5">{conv.lastMessage}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3">
            <button onClick={() => setActiveConv(null)} className="md:hidden text-sm text-[#b08800] font-bold">←</button>
            <div className="w-8 h-8 rounded-full bg-[#FACE39]/15 flex items-center justify-center">
              <span className="text-xs font-black text-[#b08800]">{otherParticipant?.name?.charAt(0) || "?"}</span>
            </div>
            <div>
              <p className="text-sm font-black text-[#00000F]">{otherParticipant?.name}</p>
              <p className="text-[10px] text-[#00000F]/40 capitalize">{otherParticipant?.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => {
              const isMe = msg.senderType === "student";
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                    isMe ? "bg-[#FACE39] text-[#00000F] rounded-br-none" : "bg-white border border-gray-100 text-[#00000F] rounded-bl-none"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-[#00000F]/50 text-right" : "text-[#00000F]/40"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition"
            />
            <button onClick={handleSend} disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-xl bg-[#FACE39] flex items-center justify-center hover:bg-[#f0c020] transition disabled:opacity-50 flex-shrink-0">
              <Send size={15} className="text-[#00000F]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-[#00000F]/30">
            <MessageSquare size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
