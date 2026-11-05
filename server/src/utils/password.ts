import bcrypt from "bcryptjs";

import { config } from "../config/env.js";

export const hashPassword = (plain: string) => bcrypt.hash(plain, config.bcryptRounds);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

let dummyHash: Promise<string> | undefined;

/** Burns the same CPU as a real check, so unknown emails cannot be told apart by timing. */
export const fakeVerifyPassword = async (plain: string) => {
  dummyHash ??= hashPassword("timing-equaliser-password");
  await bcrypt.compare(plain, await dummyHash);
};
