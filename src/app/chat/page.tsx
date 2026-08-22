import type { Metadata } from "next";
import { ChatPanel } from "@/components/chat/ChatPanel";

export const metadata: Metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <div className="mx-auto flex h-full min-h-0 max-w-2xl flex-col">
      <ChatPanel />
    </div>
  );
}
