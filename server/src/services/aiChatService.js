import OpenAI from "openai";
import Fish from "../models/Fish.js";

export default async function answerCustomer(message) {
  const fish = await Fish.find({ status: "available" }).select("name strain price quantity").limit(20).lean();
  if (!process.env.OPENAI_API_KEY) {
    const text = message.toLowerCase();
    if (text.includes("available") || text.includes("price")) {
      if (!fish.length) return "The latest guppy availability is being updated. Please request the breeder for confirmation.";
      return `Currently listed: ${fish.map((item) => `${item.name} at ₹${item.price}`).join(", ")}. Availability is confirmed before payment.`;
    }
    if (text.includes("care") || text.includes("feed")) return "Keep guppies in clean, cycled water around 24–28°C, feed small portions 1–2 times daily, and avoid overcrowding.";
    if (text.includes("delivery")) return "Delivery depends on your location and weather. Please request the breeder to confirm safe live-fish delivery.";
    return "I can help with availability, prices, guppy care, and delivery. You can also request a live chat with the breeder.";
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const catalogue = fish.map((item) => `${item.name} (${item.strain}), ₹${item.price}, quantity ${item.quantity}`).join("\n") || "No confirmed fish currently listed.";
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.2,
    max_tokens: 250,
    messages: [
      { role: "system", content: `You are the SJ Guppy Paradise assistant. Be concise and friendly. Never invent price, stock, payment confirmation, medical claims, or delivery promises. Catalogue:\n${catalogue}` },
      { role: "user", content: message },
    ],
  });
  return completion.choices[0]?.message?.content || "Please request the breeder for help.";
}

