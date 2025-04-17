"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MaxWidthWrapper from "../../_components/MaxWidthWrapper";
import ConversationList from "../../_components/ConversationList";
import ChatWindow from "../../_components/ChatWindow";

function ConversationViewPageContent() {
  const params = useSearchParams();
  const conversationId = params.get("id");
  const [ready, setReady] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      setReady(true);
    }
  }, [conversationId]);

  if (!ready) return <div>Loading chat...</div>;

  return (
    <MaxWidthWrapper>
      <div className="flex rounded-lg overflow-hidden h-[80vh] mt-6">
        {/* conversation list */}
        <div className="w-[400px] bg-white border-r overflow-y-auto">
          <ConversationList
            onSelectConversation={setActiveConversationId}
            selectedId={activeConversationId ?? undefined}
          />
        </div>

        {/* chat window */}
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

export default function ConversationViewPage() {
  return (
    <Suspense fallback={<div>Loading conversation...</div>}>
      <ConversationViewPageContent />
    </Suspense>
  );
}
