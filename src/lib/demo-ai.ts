import { demoAuth, demoDb } from "@/lib/demo-store";

export type DemoAiType = "general" | "news" | "technical" | "assistant";

function wait(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lastUserMessage(messages?: { role: string; content: string }[], fallback = "") {
  const last = [...(messages ?? [])].reverse().find((item) => item.role === "user");
  return last?.content ?? fallback;
}

export async function demoAiChat(input: {
  messages?: { role: string; content: string }[];
  message?: string;
  type?: DemoAiType;
  context?: Record<string, unknown>;
}): Promise<{ response: string; conversationId: string }> {
  await wait();

  const { data: { user } } = await demoAuth.getUser();
  const profile = user ? demoDb.getProfile(user.id) : null;
  const generation = profile?.generation || "genZ";
  const skill = (input.context?.skillLevel as string) || profile?.skill_level || "beginner";
  const question = input.message || lastUserMessage(input.messages);
  const type = input.type ?? "general";

  const casual = generation === "genAlpha" || generation === "genZ";
  const older = generation === "genX" || generation === "genY";

  let response: string;

  if (type === "news") {
    response = older
      ? "Demo news analysis: selected headlines currently lean constructive for risk assets, with crypto more sensitive than gold. Treat this as a website preview — no live news backend is connected. Watch BTC support, keep position sizes modest, and wait for confirmation rather than reacting to a single headline."
      : "Demo news take 📰 Overall vibe is mildly bullish, crypto reacting faster than gold. This is a frontend preview (no live backend). Watch BTC support, keep size small, and don’t FOMO a single headline.";
  } else if (type === "technical") {
    response = older
      ? "Demo technical analysis: trend is constructive on the selected timeframe. RSI is approaching stretched territory, so look for a pullback toward nearby support before adding. This website uses sample chart logic only — no live market data feed."
      : "Demo TA 📈 Trend looks constructive. RSI is getting stretched — wait for a dip into support before adding. Sample-data preview only, no live feed.";
  } else {
    const opener = casual
      ? "Demo assistant here — no live AI backend, just an adaptive frontend preview."
      : "This is a demonstration assistant. There is no live AI backend; answers are generated in the browser.";

    const body = skill === "beginner"
      ? " Combined sentiment is mildly constructive. A HOLD-to-light-BUY stance fits a cautious demo profile: keep size small and watch the risk gauge."
      : " Aggregated sample signals currently lean constructive with moderate confidence. A staged entry and a defined invalidation level fit this demo profile better than a full-size market order.";

    response = `${opener}${body}${question ? ` You asked: “${question.slice(0, 140)}”.` : ""}`;
  }

  const conversation = user
    ? demoDb.addConversation(user.id, input.messages ?? [{ role: "user", content: question }])
    : { id: `local_${Date.now()}` };

  return { response, conversationId: conversation.id };
}
