import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import { seedChatMessages } from "@/lib/mock/seedData";
import type { ChatActionChip, ChatMessage, ChatRole } from "@/lib/store/types";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  setStreaming: (streaming: boolean) => void;
  addMessage: (
    role: ChatRole,
    content: string,
    actions?: ChatActionChip[]
  ) => ChatMessage;
  clearConversation: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: seedChatMessages,
      isStreaming: false,
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      addMessage: (role, content, actions) => {
        const newMessage: ChatMessage = {
          id: generateId("msg"),
          role,
          content,
          actions,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...get().messages, newMessage] });
        return newMessage;
      },
      clearConversation: () => set({ messages: [] }),
    }),
    { name: "acc-chat-store" }
  )
);
