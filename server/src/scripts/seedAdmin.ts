// Creates or updates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
// The server does the same thing on every start; this script is for running it by hand:
//   npm run seed:admin
import { config } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { ensureAdmin } from "../services/admin/adminAccount.service.js";

const main = async () => {
  if (!config.admin) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (optionally ADMIN_NAME, ADMIN_PHONE) first.");
  }

  const result = await ensureAdmin(config.admin);
  console.log(`[admin] ${result} (${config.admin.email})`);
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
