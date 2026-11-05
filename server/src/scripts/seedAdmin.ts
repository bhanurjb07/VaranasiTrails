// Creates or promotes the admin account. Run manually: npm run seed:admin
// Needs ADMIN_EMAIL and ADMIN_PASSWORD (and optionally ADMIN_NAME, ADMIN_PHONE)
// in the environment. The server itself never reads them.
import { prisma } from "../lib/prisma.js";
import { emailField, passwordField, phoneField } from "../schemas/common/common.schemas.js";
import { hashPassword } from "../utils/password.js";

const main = async () => {
  const email = emailField.parse(process.env.ADMIN_EMAIL);
  const password = passwordField.parse(process.env.ADMIN_PASSWORD);
  const name = process.env.ADMIN_NAME?.trim() || "Admin";
  // Phone is required and unique; override this when creating the real admin.
  const phone = phoneField.parse(process.env.ADMIN_PHONE || "9999999999");

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "ADMIN", passwordHash, emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
    });
    console.log(`Promoted existing user ${email} to ADMIN and reset their password.`);
  } else {
    await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "ADMIN", emailVerifiedAt: new Date() },
    });
    console.log(`Created admin ${email}.`);
  }
};


main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
