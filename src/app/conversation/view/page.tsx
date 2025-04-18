"use client";

import { useEffect, useState } from "react";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import ConversationList from "../../_components/ConversationList";
import ChatWindow from "../../_components/ChatWindow";

export default function ConversationPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setConversationId(id);
    }
  }, []);

  return (
    <MaxWidthWrapper>
      <div className="flex rounded-lg overflow-hidden h-[80vh] mt-6">
        {/* Sidebar */}
        <div className="w-[400px] bg-white border-r overflow-y-auto">
          <ConversationList
            onSelectConversation={setConversationId}
            selectedId={conversationId ?? undefined}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {conversationId ? (
            <ChatWindow conversationId={conversationId} />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-600">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
