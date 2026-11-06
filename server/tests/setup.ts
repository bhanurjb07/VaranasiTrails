import { afterAll, beforeAll, vi } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import { startHttpServer, stopHttpServer } from "./httpServer.js";

// Brevo is never called in tests; every email is captured by this mock.
vi.mock("../src/lib/mailer.js", () => ({
  sendEmail: vi.fn(async () => undefined),
}));

// R2 is never called either. The fakes are steerable: headObject resolves null
// ("file not uploaded") until a test says otherwise. R2_PUBLIC_BASE_URL is
// https://media.test in the test environment.
vi.mock("../src/lib/r2.js", () => ({
  publicUrl: (key: string) => `https://media.test/${key.replace(/^\/+/, "")}`,
  createUploadUrl: vi.fn(async (key: string) => `https://upload.test/${key}?signature=test`),
  headObject: vi.fn(async () => null),
  deleteObject: vi.fn(async () => undefined),
}));

beforeAll(startHttpServer);

afterAll(async () => {
  await stopHttpServer();
  await prisma.$disconnect();
});
