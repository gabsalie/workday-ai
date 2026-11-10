import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Check, Copy, MessageSquarePlus, PencilLine, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import logoMark from "@/assets/logo-mark.png";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { demoChatReply, simulateStream } from "@/lib/demo";
import { readableError } from "@/lib/errors";
import { CHAT_STORAGE_KEY, makeTitle, newId, removeHistory, upsertHistory } from "@/lib/storage";
import { CHAT_SAMPLES } from "@/lib/tools";

type StoredChat = { id: string; messages: UIMessage[] };

function loadChat(): StoredChat {
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredChat;
      if (parsed?.id && Array.isArray(parsed.messages)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return { id: newId(), messages: [] };
}

const textOf = (m: UIMessage) =>
  m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("\n\n");

/** Rendered client-side only (localStorage restores the single saved conversation). */
export function ChatView({ live }: { live: boolean }) {
  const [initial] = useState(loadChat);
  const [chatId, setChatId] = useState(initial.id);
  return (
    <ChatSession
      key={chatId}
      chatId={chatId}
      initialMessages={chatId === initial.id ? initial.messages : []}
      live={live}
      onNewChat={() => {
        window.localStorage.removeItem(CHAT_STORAGE_KEY);
        setChatId(newId());
      }}
    />
  );
}

function ChatSession({
  chatId,
  initialMessages,
  live,
  onNewChat,
}: {
  chatId: string;
  initialMessages: UIMessage[];
  live: boolean;
  onNewChat: () => void;
}) {
  const [demoStatus, setDemoStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const demoSignal = useRef({ cancelled: false });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, setMessages, sendMessage, status, stop, regenerate, error, clearError } =
    useChat({
      id: chatId,
      messages: initialMessages,
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      onError: (err) => toast.error(readableError(err)),
    });

  const effectiveStatus = live ? status : demoStatus;
  const busy = effectiveStatus === "submitted" || effectiveStatus === "streaming";

  // Persist the conversation and record it in recent activity once a turn settles.
  useEffect(() => {
    if (busy) return;
    if (messages.length === 0) {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ id: chatId, messages }));
    const firstUser = messages.find((m) => m.role === "user");
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (firstUser) {
      upsertHistory({
        id: chatId,
        tool: "chat",
        title: makeTitle(textOf(firstUser)),
        input: textOf(firstUser),
        output: lastAssistant ? textOf(lastAssistant) : "",
        demo: !live,
        updatedAt: Date.now(),
      });
    }
  }, [messages, busy, chatId, live]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  const runDemo = async (history: UIMessage[], question: string) => {
    demoSignal.current = { cancelled: false };
    setDemoStatus("submitted");
    const id = newId();
    const reply = demoChatReply(question);
    await simulateStream(
      reply,
      (partial) => {
        setDemoStatus("streaming");
        setMessages([...history, { id, role: "assistant", parts: [{ type: "text", text: partial }] }]);
      },
      demoSignal.current,
    );
    setDemoStatus("ready");
  };

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    clearError();
    if (live) {
      void sendMessage({ text: value });
      return;
    }
    const history: UIMessage[] = [
      ...messages,
      { id: newId(), role: "user", parts: [{ type: "text", text: value }] },
    ];
    setMessages(history);
    void runDemo(history, value);
  };

  const handleRegenerate = () => {
    if (busy) return;
    clearError();
    if (live) {
      void regenerate();
      return;
    }
    let lastUserIdx = -1;
    messages.forEach((m, i) => {
      if (m.role === "user") lastUserIdx = i;
    });
    const lastUser = messages[lastUserIdx];
    if (!lastUser) return;
    const history = messages.slice(0, lastUserIdx + 1);
    setMessages(history);
    void runDemo(history, textOf(lastUser));
  };

  const handleStop = () => {
    demoSignal.current.cancelled = true;
    setDemoStatus("ready");
    void stop();
  };

  const saveEdit = (id: string) => {
    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, parts: [{ type: "text" as const, text: editText }] } : m,
      ),
    );
    setEditingId(null);
    toast.success("Response updated");
  };

  const copy = async (m: UIMessage) => {
    await navigator.clipboard.writeText(textOf(m));
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const showThinking =
    effectiveStatus === "submitted" && messages[messages.length - 1]?.role === "user";

  return (
    <div className="mx-auto flex h-[calc(100svh-3.5rem)] w-full max-w-4xl flex-col px-3 sm:px-6">
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Workplace Assistant</span>
          <span className="hidden sm:inline">· remembers this conversation in your browser</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={messages.length === 0 || busy}
          onClick={() => {
            removeHistory(chatId);
            onNewChat();
          }}
        >
          <MessageSquarePlus /> New chat
        </Button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-card">
        {busy && <div className="loading-bar absolute inset-x-0 top-0 z-10 h-1" />}
        <Conversation className="h-full">
          <ConversationContent className="gap-6 p-4 sm:p-6">
            {messages.length === 0 && (
              <div className="animate-fade-up flex flex-col items-center gap-5 py-10 text-center">
                <img src={logoMark} alt="" width={64} height={64} className="size-16" />
                <div>
                  <h2 className="text-2xl font-bold">How can I help you work smarter?</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Draft emails and documents, plan your week, solve tricky workplace situations or
                    explain business concepts. Ask follow-ups to refine anything.
                  </p>
                </div>
                <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {CHAT_SAMPLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-xl border bg-background px-4 py-3 text-left text-sm text-foreground transition-all hover:-translate-y-px hover:border-brand-orange/50 hover:shadow-card"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <Message from={m.role} key={m.id}>
                {m.role === "assistant" && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <img src={logoMark} alt="" width={20} height={20} className="size-5" />
                    Workplace Assistant
                  </div>
                )}
                <MessageContent className="group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-md group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                  {editingId === m.id ? (
                    <div className="w-full min-w-[min(36rem,80vw)] space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-48 font-mono text-[0.82rem]"
                        aria-label="Edit response"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X /> Cancel
                        </Button>
                        <Button size="sm" variant="brand" onClick={() => saveEdit(m.id)}>
                          <Check /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return m.role === "assistant" ? (
                          <div key={i} className="prose-output">
                            <MessageResponse isAnimating={busy && m.id === lastAssistantId}>
                              {part.text}
                            </MessageResponse>
                          </div>
                        ) : (
                          <p key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </p>
                        );
                      }
                      if (part.type === "reasoning" && part.text.trim()) {
                        return (
                          <Reasoning
                            key={i}
                            isStreaming={part.state === "streaming"}
                            defaultOpen={false}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      }
                      return null;
                    })
                  )}
                </MessageContent>
                {m.role === "assistant" && editingId !== m.id && !(busy && m.id === lastAssistantId) && (
                  <MessageActions className="opacity-70 transition-opacity group-hover:opacity-100">
                    <MessageAction tooltip="Copy" onClick={() => copy(m)}>
                      {copiedId === m.id ? <Check className="text-success" /> : <Copy />}
                    </MessageAction>
                    <MessageAction
                      tooltip="Edit"
                      onClick={() => {
                        setEditText(textOf(m));
                        setEditingId(m.id);
                      }}
                    >
                      <PencilLine />
                    </MessageAction>
                    {m.id === lastAssistantId && (
                      <MessageAction tooltip="Regenerate" onClick={handleRegenerate}>
                        <RefreshCw />
                      </MessageAction>
                    )}
                  </MessageActions>
                )}
              </Message>
            ))}

            {showThinking && (
              <Message from="assistant">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <img src={logoMark} alt="" width={20} height={20} className="size-5" />
                  Workplace Assistant
                </div>
                <Shimmer className="text-sm">Thinking…</Shimmer>
              </Message>
            )}

            {error && !busy && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <p className="font-semibold">The assistant couldn't respond</p>
                <p className="mt-1">{readableError(error)}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={handleRegenerate}>
                  <RefreshCw /> Try again
                </Button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="space-y-2 py-3">
        {messages.length > 0 && !busy && (
          <Suggestions>
            {["Make it shorter", "Make it more formal", "Turn this into bullet points", "What should I do next?"].map(
              (s) => (
                <Suggestion key={s} suggestion={s} onClick={send} className="rounded-full" />
              ),
            )}
          </Suggestions>
        )}
        <PromptInput
          onSubmit={(msg) => send(msg.text)}
          className="rounded-2xl bg-card shadow-card"
        >
          <PromptInputTextarea
            ref={inputRef}
            autoFocus
            placeholder="Ask a workplace question, or ask me to draft something…"
          />
          <PromptInputFooter className="justify-between">
            <span className="pl-2 text-[0.7rem] text-muted-foreground">
              Enter to send · Shift + Enter for a new line
            </span>
            <PromptInputSubmit status={effectiveStatus} onStop={handleStop} />
          </PromptInputFooter>
        </PromptInput>
        <AiDisclaimer compact />
      </div>
    </div>
  );
}
