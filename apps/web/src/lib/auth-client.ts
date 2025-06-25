import { createAuthClient } from "better-auth/client";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000",
  plugins: [anonymousClient()],
});
