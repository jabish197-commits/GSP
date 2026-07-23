import { createHmac, randomBytes } from "node:crypto";
import Customer from "../models/Customer.js";

const providerNames = {
  google: "Google",
  facebook: "Facebook",
};

function customerAppUrl() {
  return String(process.env.CUSTOMER_APP_URL || "http://localhost:5173").replace(/\/$/, "");
}

function callbackBaseUrl() {
  if (process.env.OAUTH_CALLBACK_BASE_URL) {
    return String(process.env.OAUTH_CALLBACK_BASE_URL).replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") return `${customerAppUrl()}/api`;
  return `http://localhost:${process.env.PORT || 5000}/api`;
}

function callbackUrl(provider) {
  return `${callbackBaseUrl()}/customer-auth/oauth/${provider}/callback`;
}

function providerConfiguration(provider) {
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (provider === "facebook") {
    return {
      clientId: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    };
  }
  return null;
}

function requireProvider(provider) {
  const configuration = providerConfiguration(provider);
  if (!configuration) throw new Error("Unsupported social login provider.");
  if (!configuration.clientId || !configuration.clientSecret) {
    throw new Error(`${providerNames[provider]} login is not configured yet.`);
  }
  return configuration;
}

async function responseJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error?.message || data.error || fallbackMessage);
  }
  return data;
}

async function googleProfile(code) {
  const { clientId, clientSecret } = requireProvider("google");
  const redirectUri = callbackUrl("google");
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await responseJson(tokenResponse, "Google could not complete sign-in.");
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await responseJson(profileResponse, "Google profile information was unavailable.");
  if (!profile.email || profile.email_verified !== true) {
    throw new Error("Google did not provide a verified email address.");
  }
  return {
    provider: "google",
    providerId: String(profile.sub),
    name: String(profile.name || profile.email.split("@")[0]),
    email: String(profile.email).toLowerCase(),
    picture: String(profile.picture || ""),
  };
}

async function facebookProfile(code) {
  const { clientId, clientSecret } = requireProvider("facebook");
  const version = process.env.FACEBOOK_GRAPH_VERSION || "v25.0";
  const redirectUri = callbackUrl("facebook");
  const tokenUrl = new URL(`https://graph.facebook.com/${version}/oauth/access_token`);
  tokenUrl.search = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  }).toString();
  const tokenResponse = await fetch(tokenUrl);
  const tokens = await responseJson(tokenResponse, "Facebook could not complete sign-in.");
  const proof = createHmac("sha256", clientSecret).update(tokens.access_token).digest("hex");
  const profileUrl = new URL(`https://graph.facebook.com/${version}/me`);
  profileUrl.search = new URLSearchParams({
    fields: "id,name,email,picture.type(large)",
    access_token: tokens.access_token,
    appsecret_proof: proof,
  }).toString();
  const profileResponse = await fetch(profileUrl);
  const profile = await responseJson(profileResponse, "Facebook profile information was unavailable.");
  if (!profile.email) {
    throw new Error("Allow Facebook to share your email address, then try again.");
  }
  return {
    provider: "facebook",
    providerId: String(profile.id),
    name: String(profile.name || profile.email.split("@")[0]),
    email: String(profile.email).toLowerCase(),
    picture: String(profile.picture?.data?.url || ""),
  };
}

export function oauthState() {
  return randomBytes(32).toString("hex");
}

export function oauthCallbackUrl(provider) {
  return callbackUrl(provider);
}

export function oauthAuthorizationUrl(provider, state) {
  const { clientId } = requireProvider(provider);
  const redirectUri = callbackUrl(provider);
  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    }).toString();
    return url.toString();
  }
  const version = process.env.FACEBOOK_GRAPH_VERSION || "v25.0";
  const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state,
  }).toString();
  return url.toString();
}

export async function oauthProfile(provider, code) {
  if (provider === "google") return googleProfile(code);
  if (provider === "facebook") return facebookProfile(code);
  throw new Error("Unsupported social login provider.");
}

export async function findOrCreateOAuthCustomer(profile) {
  const providerField = profile.provider === "google" ? "googleId" : "facebookId";
  let customer = await Customer.findOne({ [providerField]: profile.providerId })
    .select("+googleId +facebookId");

  if (!customer) {
    customer = await Customer.findOne({ email: profile.email }).select("+googleId +facebookId");
  }

  if (customer) {
    if (!customer.active) throw new Error("This customer account is disabled.");
    if (customer[providerField] && customer[providerField] !== profile.providerId) {
      throw new Error("This email is already connected to another social account.");
    }
    customer[providerField] = profile.providerId;
    if (!customer.avatar?.url && profile.picture) {
      customer.avatar = { url: profile.picture, publicId: "" };
    }
    customer.lastLoginAt = new Date();
    await customer.save();
    return customer;
  }

  return Customer.create({
    name: profile.name,
    email: profile.email,
    phone: "",
    avatar: { url: profile.picture, publicId: "" },
    [providerField]: profile.providerId,
    lastLoginAt: new Date(),
  });
}

export function oauthProviderName(provider) {
  return providerNames[provider] || "Social";
}

export function customerAuthRedirect(path = "/auth/callback") {
  return `${customerAppUrl()}${path}`;
}
