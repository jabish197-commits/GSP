const configured = () => Boolean(
  process.env.WHATSAPP_ACCESS_TOKEN
  && process.env.WHATSAPP_PHONE_NUMBER_ID
  && process.env.WHATSAPP_WELCOME_TEMPLATE,
);

function normalizeWhatsAppNumber(value) {
  let digits = String(value || "").replace(/\D/g, "");
  const countryCode = String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "91").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `${countryCode}${digits}`;
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("The customer WhatsApp number is invalid.");
  }
  return digits;
}

export async function sendRegistrationWelcome({ name, phone }) {
  if (!configured()) return { sent: false, reason: "WhatsApp Business is not configured." };

  const version = process.env.WHATSAPP_GRAPH_VERSION || "v25.0";
  const response = await fetch(
    `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizeWhatsAppNumber(phone),
        type: "template",
        template: {
          name: process.env.WHATSAPP_WELCOME_TEMPLATE,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
          components: [{
            type: "body",
            parameters: [{ type: "text", text: String(name || "Customer").slice(0, 80) }],
          }],
        },
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "WhatsApp rejected the welcome message.");
  }
  return { sent: true, messageId: data.messages?.[0]?.id || "" };
}
