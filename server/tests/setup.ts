import { vi } from "vitest";

// Brevo is never called in tests; every email is captured by this mock.
vi.mock("../src/lib/mailer.js", () => ({
  sendEmail: vi.fn(async () => undefined),
}));
