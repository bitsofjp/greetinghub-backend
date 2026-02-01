import GreetingPage from "#greetings/models/greetingPage.model.js";
import crypto from "crypto";

export async function archiveGreetingPage(pageId: string, ownerId: string) {
  const page = await GreetingPage.findOne({
    _id: pageId,
    ownerId,
  });

  if (!page) {
    throw new Error("Greeting page not found or now owned by user");
  }

  page.status = "archived";
  await page.save();

  return page;
}

export async function createGreetingPage(ownerId: string, title: string) {
  const accessCode = generateAccessCode();

  return GreetingPage.create({
    accessCode,
    ownerId,
    status: "active",
    title,
  });
}

export async function listGreetingPagesByOwner(ownerId: string) {
  return GreetingPage.find({
    ownerId,
    status: { $ne: "archived" },
  }).sort({ createdAt: -1 });
}

function generateAccessCode(): string {
  return crypto.randomBytes(6).toString("base64url");
}
