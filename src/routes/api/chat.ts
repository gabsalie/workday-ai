import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

import {
  createResponsesCall,
  getApiKey,
  jsonError,
  toUserErrorMessage,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/responses.server";
import { CHAT_INSTRUCTIONS } from "@/lib/ai/prompts.server";

const MAX_MESSAGES = 60;

async function handleChat(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) return jsonError("AI is not configured. The app is running in demo mode.", 503);

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonError("No messages provided.", 400);
    }
    messages = (body.messages as UIMessage[]).slice(-MAX_MESSAGES);
  } catch {
    return jsonError("Invalid request.", 400);
  }

  const { result, runIdFetch } = createResponsesCall(
    request,
    apiKey,
    await convertToModelMessages(messages),
    CHAT_INSTRUCTIONS,
  );

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (error) => {
        console.error("chat error", error);
        return toUserErrorMessage(error);
      },
    }),
    runIdFetch,
  );
}

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleChat(request) } },
});
