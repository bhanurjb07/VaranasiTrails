import { app } from "./app.js";
import { config } from "./config/env.js";
import { ensureAdminFromConfig } from "./services/admin/adminAccount.service.js";

// Optional bootstrap admin (ADMIN_EMAIL + ADMIN_PASSWORD). Idempotent and never fatal.
await ensureAdminFromConfig(config.admin);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} (${config.nodeEnv})`);
});
