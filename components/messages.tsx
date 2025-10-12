import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { ArrowDownIcon } from "lucide-react";
import { memo, useEffect } from "react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
};

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useDataStream();

  // Auto-scroll when status changes
  useEffect(() => {
    if (status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (status === "streaming") {
      const container = messagesContainerRef.current;
      if (!container) return;

      const scrollInterval = setInterval(() => {
        // Only auto-scroll if user is near the bottom
        const isNearBottom = 
          container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        
        if (isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100); // Check every 100ms

      return () => clearInterval(scrollInterval);
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-col gap-3 sm:gap-4 md:gap-6">
        <ConversationContent className="flex flex-col gap-3 px-2 py-3 sm:gap-4 sm:py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}
          
          {/* AJ STUDIOZ Branding with Logo */}
          <div className="flex items-center justify-center py-1.5 text-xs text-muted-foreground sm:py-2 sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img 
                src="https://z-cdn-media.chatglm.cn/files/797f27fe-c65b-4e25-91cd-3e0c6688287e_aj%20logo.jpg?auth_key=1791563173-34991f6fcb414a528e5e52039239c636-0-de0ec96ab994aea2993ad06289321950"
                alt="AJ STUDIOZ Logo"
                className="h-5 w-5 rounded sm:h-6 sm:w-6"
              />
              <span>Powered by <span className="font-semibold">AJ STUDIOZ</span></span>
            </div>
          </div>

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              regenerate={regenerate}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
              setMessages={setMessages}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {status === "submitted" &&
            messages.length > 0 &&
            messages.at(-1)?.role === "user" &&
            selectedModelId !== "chat-model-reasoning" && <ThinkingMessage />}

          <div
            className="min-h-[24px] min-w-[24px] shrink-0"
            ref={messagesEndRef}
          />
        </ConversationContent>
      </Conversation>

      {!isAtBottom && (
        <button
          aria-label="Scroll to bottom"
          className="absolute bottom-32 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-1.5 shadow-lg transition-colors hover:bg-muted sm:bottom-40 sm:p-2"
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDownIcon className="size-3.5 sm:size-4" />
        </button>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
