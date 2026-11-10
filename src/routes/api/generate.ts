import { createFileRoute } from "@tanstack/react-router";
import type { ModelMessage } from "ai";
import { z } from "zod";

import {
  createResponsesCall,
  getApiKey,
  jsonError,
  toUserErrorMessage,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/responses.server";
import {
  REFINE_PREFIX,
  meetingInstructions,
  researchInstructions,
} from "@/lib/ai/prompts.server";
import { MAX_INPUT_CHARS } from "@/lib/tools";

const bodySchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("meeting"),
    prompt: z.string().trim().min(1).max(MAX_INPUT_CHARS),
    options: z.object({
      detail: z.enum(["brief", "standard", "detailed"]),
      tone: z.enum(["neutral and professional", "friendly", "formal"]),
      includeFollowUp: z.boolean(),
    }),
    previous: z.string().max(MAX_INPUT_CHARS).optional(),
    refinement: z.string().max(2000).optional(),
  }),
  z.object({
    tool: z.literal("research"),
    prompt: z.string().trim().min(1).max(MAX_INPUT_CHARS),
    options: z.object({
      mode: z.enum(["topic", "article"]),
      depth: z.enum(["brief", "standard", "deep"]),
      audience: z.string().trim().min(1).max(200),
    }),
    previous: z.string().max(MAX_INPUT_CHARS).optional(),
    refinement: z.string().max(2000).optional(),
  }),
]);

async function handleGenerate(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) return jsonError("AI is not configured. The app is running in demo mode.", 503);

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return jsonError("Invalid request.", 400);
  }
  if (!parsed.success) return jsonError("Please check your input and try again.", 400);
  const body = parsed.data;

  const instructions =
    body.tool === "meeting" ? meetingInstructions(body.options) : researchInstructions(body.options);

  const firstTurn =
    body.tool === "meeting"
      ? `Summarise these meeting notes:\n\n"""\n${body.prompt}\n"""`
      : body.options.mode === "article"
        ? `Analyse this article/content:\n\n"""\n${body.prompt}\n"""`
        : `Research topic: ${body.prompt}`;

  const messages: ModelMessage[] = [{ role: "user", content: firstTurn }];
  if (body.previous && body.refinement) {
    messages.push({ role: "assistant", content: body.previous });
    messages.push({ role: "user", content: `${REFINE_PREFIX}\n${body.refinement}` });
  }

  const { result, runIdFetch } = createResponsesCall(request, apiKey, messages, instructions);
  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      sendReasoning: false,
      onError: (error) => {
        console.error("generate error", error);
        return toUserErrorMessage(error);
      },
    }),
    runIdFetch,
  );
}

export const Route = createFileRoute("/api/generate")({
  server: { handlers: { POST: ({ request }) => handleGenerate(request) } },
});
