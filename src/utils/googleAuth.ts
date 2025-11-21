import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    audience: process.env.GOOGLE_CLIENT_ID,
    idToken,
  });

  const payload = ticket.getPayload();

  return payload;
};
