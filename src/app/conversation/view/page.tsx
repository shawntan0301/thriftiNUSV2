"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import ConversationList from "../../_components/ConversationList";
import ChatWindow from "../../_components/ChatWindow";

export default function ChatPageWithParams() {
  const params = useSearchParams();
  const conversationId = params.get("id");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId]);

  return (
    <MaxWidthWrapper>
      <div className="flex rounded-lg overflow-hidden h-[80vh] mt-6">
        <div className="w-[400px] bg-white border-r overflow-y-auto">
          <ConversationList
            onSelectConversation={setActiveConversationId}
            selectedId={activeConversationId ?? undefined}
          />
        </div>

        <div className="flex-1">
          {activeConversationId ? (
            <ChatWindow conversationId={activeConversationId} />
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
