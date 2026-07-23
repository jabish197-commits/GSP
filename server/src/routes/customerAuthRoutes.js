import { Router } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import Customer from "../models/Customer.js";
import { requireCustomer } from "../middleware/customerAuth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { clearSessionCookieOptions, sessionCookieOptions } from "../utils/cookieOptions.js";
import { deleteMedia, uploadBuffer } from "../services/mediaService.js";
import { sendRegistrationWelcome } from "../services/whatsappService.js";
import {
  customerAuthRedirect,
  findOrCreateOAuthCustomer,
  oauthAuthorizationUrl,
  oauthProfile,
  oauthProviderName,
  oauthState,
} from "../services/customerOAuthService.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE_MB || 5) * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar || { url: "", publicId: "" },
    profileComplete: Boolean(customer.phone),
  };
}

function setSession(response, customer) {
  const token = jwt.sign(
    { sub: customer.id, role: "customer" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "7d" },
  );
  response.cookie("sj_customer_token", token, sessionCookieOptions(7 * 24 * 60 * 60 * 1000));
}

function oauthCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/customer-auth/oauth",
    ...(maxAge ? { maxAge } : {}),
  };
}

router.get("/oauth/:provider/start", asyncHandler(async (request, response) => {
  const provider = String(request.params.provider || "").toLowerCase();
  const state = oauthState();
  const authorizationUrl = oauthAuthorizationUrl(provider, state);
  response.cookie("sj_oauth_state", `${provider}:${state}`, oauthCookieOptions(10 * 60 * 1000));
  response.redirect(authorizationUrl);
}));

router.get("/oauth/:provider/callback", async (request, response) => {
  const provider = String(request.params.provider || "").toLowerCase();
  const providerName = oauthProviderName(provider);
  const fail = (message) => response.redirect(
    customerAuthRedirect(`/login?oauthError=${encodeURIComponent(message)}`),
  );

  try {
    if (!["google", "facebook"].includes(provider)) return fail("Unsupported social login provider.");
    if (request.query.error) {
      return fail(`${providerName} sign-in was cancelled or not approved.`);
    }
    const expectedState = request.cookies?.sj_oauth_state;
    const receivedState = String(request.query.state || "");
    response.clearCookie("sj_oauth_state", oauthCookieOptions());
    if (!expectedState || expectedState !== `${provider}:${receivedState}`) {
      return fail("The social login request expired. Please try again.");
    }
    const code = String(request.query.code || "");
    if (!code) return fail(`${providerName} did not return a login code.`);
    const profile = await oauthProfile(provider, code);
    const customer = await findOrCreateOAuthCustomer(profile);
    setSession(response, customer);
    return response.redirect(customerAuthRedirect(`/auth/callback?provider=${provider}`));
  } catch (error) {
    return fail(error.message || `${providerName} sign-in failed.`);
  }
});

router.post("/register", asyncHandler(async (request, response) => {
  const name = String(request.body.name || "").trim();
  const email = String(request.body.email || "").toLowerCase().trim();
  const phone = String(request.body.phone || "").trim();
  const password = String(request.body.password || "");
  const whatsappOptIn = request.body.whatsappOptIn === true;
  if (name.length < 2) return response.status(400).json({ message: "Enter your full name." });
  if (!emailPattern.test(email)) return response.status(400).json({ message: "Enter a valid email address." });
  if (phone.length < 7) return response.status(400).json({ message: "Enter a valid phone or WhatsApp number." });
  if (password.length < 8) return response.status(400).json({ message: "Password must contain at least 8 characters." });
  if (await Customer.exists({ email })) return response.status(409).json({ message: "An account already exists for this email." });
  const customer = await Customer.create({
    name,
    email,
    phone,
    password,
    whatsappOptIn,
    whatsappOptInAt: whatsappOptIn ? new Date() : undefined,
  });
  setSession(response, customer);
  let whatsappWelcomeSent = false;
  if (whatsappOptIn) {
    try {
      const delivery = await sendRegistrationWelcome({ name, phone });
      whatsappWelcomeSent = delivery.sent;
      if (delivery.sent) {
        customer.whatsappWelcomeSentAt = new Date();
        customer.whatsappWelcomeMessageId = delivery.messageId;
        await customer.save();
      }
    } catch (error) {
      console.warn("WhatsApp registration welcome was not sent:", error.message);
    }
  }
  response.status(201).json({
    customer: publicCustomer(customer),
    message: whatsappWelcomeSent
      ? "Registration successful. A welcome message was sent to your WhatsApp."
      : "Registration successful.",
    whatsappWelcomeSent,
  });
}));

router.post("/login", asyncHandler(async (request, response) => {
  const email = String(request.body.email || "").toLowerCase().trim();
  const customer = await Customer.findOne({ email, active: true }).select("+password");
  if (!customer || !(await customer.matchesPassword(String(request.body.password || "")))) {
    return response.status(401).json({ message: "Incorrect email or password." });
  }
  customer.lastLoginAt = new Date();
  await customer.save();
  setSession(response, customer);
  response.json({ customer: publicCustomer(customer) });
}));

router.get("/me", requireCustomer, (request, response) => {
  response.json({ customer: publicCustomer(request.customer) });
});

router.patch("/profile", requireCustomer, avatarUpload.single("avatar"), asyncHandler(async (request, response) => {
  const name = String(request.body.name || "").trim();
  const phone = String(request.body.phone || "").trim();
  if (name.length < 2) return response.status(400).json({ message: "Enter your full name." });
  if (phone.length < 7) return response.status(400).json({ message: "Enter a valid phone or WhatsApp number." });

  const customer = request.customer;
  customer.name = name;
  customer.phone = phone;

  if (request.file) {
    const previousAvatar = customer.avatar?.publicId ? { ...customer.avatar, type: "image" } : null;
    const uploaded = await uploadBuffer(request.file);
    customer.avatar = { url: uploaded.url, publicId: uploaded.publicId };
    await customer.save();
    if (previousAvatar) await deleteMedia(previousAvatar).catch(() => {});
  } else {
    await customer.save();
  }

  response.json({ customer: publicCustomer(customer), message: "Profile updated successfully." });
}));

router.post("/logout", (_request, response) => {
  response.clearCookie("sj_customer_token", clearSessionCookieOptions()).json({ message: "Logged out." });
});

export default router;
