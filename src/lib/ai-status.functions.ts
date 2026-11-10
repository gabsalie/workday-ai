import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

/** Reports whether live AI is configured, without exposing the key. */
export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { live: Boolean(process.env["LOVABLE_API_KEY"]?.trim()) };
});

export const aiStatusQuery = queryOptions({
  queryKey: ["ai-status"],
  queryFn: () => getAiStatus(),
  staleTime: 5 * 60 * 1000,
});
