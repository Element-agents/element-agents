import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type {
  AvatarColor,
  CentralAuthUser,
  GoogleSignInInput,
  PasswordSignInInput,
  PasswordSignUpInput,
} from "@openbot/contracts/ipc";
import { createOpenBotLogger } from "@openbot/logging";

const logger = createOpenBotLogger("local-auth-store");

export interface StoredLocalUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  chatColor?: AvatarColor | null;
  passwordHash?: string;
  salt?: string;
  provider: "local" | "google";
  googleId?: string;
  createdAt: number;
  updatedAt: number;
}

interface LocalAuthFileStructure {
  version: 1;
  users: StoredLocalUser[];
}

export class LocalAuthStore {
  readonly #filePath: string;
  #users = new Map<string, StoredLocalUser>();

  constructor(filePath: string) {
    this.#filePath = filePath;
    this.#load();
  }

  #load(): void {
    if (!existsSync(this.#filePath)) {
      return;
    }
    try {
      const content = readFileSync(this.#filePath, "utf8");
      const data = JSON.parse(content);
      if (data && typeof data === "object" && "users" in data && Array.isArray(data.users)) {
        for (const item of data.users) {
          if (item && typeof item === "object" && typeof item.id === "string" && typeof item.email === "string") {
            const user: StoredLocalUser = {
              id: item.id,
              email: item.email,
              name: typeof item.name === "string" ? item.name : null,
              avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : null,
              chatColor: item.chatColor ?? null,
              passwordHash: item.passwordHash,
              salt: item.salt,
              provider: item.provider === "google" ? "google" : "local",
              googleId: item.googleId,
              createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
              updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : Date.now(),
            };
            this.#users.set(user.id, user);
          }
        }
      }
    } catch (error) {
      logger.warn("Could not read local auth users file, starting with empty store.", error);
    }
  }

  #save(): void {
    try {
      const dir = dirname(this.#filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const data: LocalAuthFileStructure = {
        version: 1,
        users: Array.from(this.#users.values()),
      };
      writeFileSync(this.#filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (error) {
      logger.warn("Could not save local auth users file.", error);
    }
  }

  #hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString("hex");
  }

  #verifyPassword(password: string, salt: string, expectedHash: string): boolean {
    const hash = this.#hashPassword(password, salt);
    try {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
    } catch {
      return false;
    }
  }

  #toCentralAuthUser(user: StoredLocalUser): CentralAuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      chatColor: user.chatColor ?? null,
    };
  }

  getUser(id: string): CentralAuthUser | null {
    const user = this.#users.get(id);
    return user ? this.#toCentralAuthUser(user) : null;
  }

  findByEmail(email: string): StoredLocalUser | null {
    const normalized = email.trim().toLowerCase();
    for (const user of this.#users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  signInWithPassword(input: PasswordSignInInput): CentralAuthUser {
    const email = input.email.trim().toLowerCase();
    const existing = this.findByEmail(email);

    if (!existing) {
      throw new Error("No account found with this email. Please create an account.");
    }

    if (!existing.passwordHash || !existing.salt) {
      if (existing.provider === "google") {
        throw new Error("This account was created with Google. Please continue with Google.");
      }
      throw new Error("Invalid email or password.");
    }

    if (!this.#verifyPassword(input.password, existing.salt, existing.passwordHash)) {
      throw new Error("Incorrect password. Please try again.");
    }

    return this.#toCentralAuthUser(existing);
  }

  signUpWithPassword(input: PasswordSignUpInput): CentralAuthUser {
    const email = input.email.trim().toLowerCase();
    if (!email?.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    if (!input.password || input.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const existing = this.findByEmail(email);
    if (existing) {
      throw new Error("An account with this email already exists. Please sign in.");
    }

    const salt = randomBytes(16).toString("hex");
    const passwordHash = this.#hashPassword(input.password, salt);
    const now = Date.now();

    const newUser: StoredLocalUser = {
      id: `usr_${randomUUID()}`,
      email,
      name: input.name?.trim() || null,
      avatarUrl: null,
      passwordHash,
      salt,
      provider: "local",
      createdAt: now,
      updatedAt: now,
    };

    this.#users.set(newUser.id, newUser);
    this.#save();
    return this.#toCentralAuthUser(newUser);
  }

  signInWithGoogle(input?: GoogleSignInInput): CentralAuthUser {
    const email = (input?.email?.trim() || "user@gmail.com").toLowerCase();
    const name = input?.name?.trim() || (email === "user@gmail.com" ? "Google User" : email.split("@")[0]);
    const avatarUrl = input?.avatarUrl?.trim() || null;

    const existing = this.findByEmail(email);
    const now = Date.now();

    if (existing) {
      let changed = false;
      if (!existing.name && name) {
        existing.name = name;
        changed = true;
      }
      if (!existing.avatarUrl && avatarUrl) {
        existing.avatarUrl = avatarUrl;
        changed = true;
      }
      if (changed) {
        existing.updatedAt = now;
        this.#save();
      }
      return this.#toCentralAuthUser(existing);
    }

    const newUser: StoredLocalUser = {
      id: `usr_${randomUUID()}`,
      email,
      name: null,
      avatarUrl,
      provider: "google",
      createdAt: now,
      updatedAt: now,
    };

    this.#users.set(newUser.id, newUser);
    this.#save();
    return this.#toCentralAuthUser(newUser);
  }

  saveOrUpdateUser(user: CentralAuthUser): void {
    const existing = this.#users.get(user.id);
    const now = Date.now();
    if (existing) {
      if (user.name) existing.name = user.name;
      if (user.avatarUrl) existing.avatarUrl = user.avatarUrl;
      if (user.chatColor !== undefined) existing.chatColor = user.chatColor;
      existing.updatedAt = now;
    } else {
      this.#users.set(user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        chatColor: user.chatColor,
        provider: "local",
        createdAt: now,
        updatedAt: now,
      });
    }
    this.#save();
  }

  updateName(userId: string, name: string): CentralAuthUser {
    const user = this.#users.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    user.name = name.trim();
    user.updatedAt = Date.now();
    this.#save();
    return this.#toCentralAuthUser(user);
  }

  updateAvatar(userId: string, avatarUrl: string | null): CentralAuthUser {
    const user = this.#users.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    user.avatarUrl = avatarUrl;
    user.updatedAt = Date.now();
    this.#save();
    return this.#toCentralAuthUser(user);
  }

  updateChatColor(userId: string, chatColor: AvatarColor | null): CentralAuthUser {
    const user = this.#users.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    user.chatColor = chatColor;
    user.updatedAt = Date.now();
    this.#save();
    return this.#toCentralAuthUser(user);
  }
}
