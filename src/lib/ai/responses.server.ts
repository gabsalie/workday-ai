import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText, type ModelMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server.ts";

export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const AI_MODEL = "openai/gpt-6-astra";

export function getApiKey() {
  return process.env["LOVABLE_API_KEY"]?.trim() || undefined;
}

/** Streams a Responses call through Lovable AI Gateway. Create one per request. */
export function createResponsesCall(
  request: Request,
  apiKey: string,
  messages: ModelMessage[],
  instructions: string,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: AI_GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(AI_MODEL),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return { result, runIdFetch };
}

export { withLovableAiGatewayRunIdHeader };

/** Maps gateway failures to safe, user-facing messages. */
export function toUserErrorMessage(error: unknown): string {
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status === 402)
    return "AI credits have run out for this workspace. Add credits in Lovable to keep generating.";
  if (status === 401) return "The AI service isn't configured correctly. Check the app's AI key.";
  if (status === 403) {
    const body = APICallError.isInstance(error) ? error.responseBody : undefined;
    return `The AI request was declined${body ? `: ${safeMessage(body)}` : "."}`;
  }
  if (status === 400) return "The request couldn't be processed. Try shortening or rephrasing your input.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again.";
  if (error instanceof Error && error.name === "AbortError") return "Generation stopped.";
  return "Something went wrong while generating. Please try again.";
}

function safeMessage(body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } };
    return (parsed.message ?? parsed.error?.message ?? "").slice(0, 200) || "access denied";
  } catch {
    return "access denied";
  }
}

export function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}
