const production = process.env.NODE_ENV === "production";

export function sessionCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: production ? "none" : "lax",
    secure: production,
    maxAge,
    path: "/",
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: production ? "none" : "lax",
    secure: production,
    path: "/",
  };
}
