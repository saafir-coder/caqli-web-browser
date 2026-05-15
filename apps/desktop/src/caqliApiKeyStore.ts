import * as FS from "node:fs";
import * as Path from "node:path";

import type { CaqliDesktopAuthState } from "@t3tools/contracts";

import { maskCaqliApiKey } from "./caqliWorkspace";

export interface CaqliSecretStorage {
  readonly isEncryptionAvailable: () => boolean;
  readonly encryptString: (value: string) => Buffer;
  readonly decryptString: (value: Buffer) => string;
}

interface CaqliApiKeyDocument {
  readonly encryptedApiKey?: string;
}

function readDocument(filePath: string): CaqliApiKeyDocument {
  try {
    if (!FS.existsSync(filePath)) {
      return {};
    }
    const parsed = JSON.parse(FS.readFileSync(filePath, "utf8")) as CaqliApiKeyDocument;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeDocument(filePath: string, value: CaqliApiKeyDocument): void {
  const directory = Path.dirname(filePath);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  FS.mkdirSync(directory, { recursive: true });
  FS.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  FS.renameSync(tempPath, filePath);
}

export function readCaqliApiKey(
  filePath: string,
  secretStorage: CaqliSecretStorage,
): string | null {
  const encryptedApiKey = readDocument(filePath).encryptedApiKey;
  if (!encryptedApiKey || !secretStorage.isEncryptionAvailable()) {
    return null;
  }
  try {
    return secretStorage.decryptString(Buffer.from(encryptedApiKey, "base64"));
  } catch {
    return null;
  }
}

export function writeCaqliApiKey(
  filePath: string,
  apiKey: string,
  secretStorage: CaqliSecretStorage,
): CaqliDesktopAuthState {
  const normalizedKey = apiKey.trim();
  if (!normalizedKey.startsWith("caqli_")) {
    throw new Error("API key must start with caqli_.");
  }
  if (!secretStorage.isEncryptionAvailable()) {
    throw new Error("Secure desktop key storage is not available on this device.");
  }

  writeDocument(filePath, {
    encryptedApiKey: secretStorage.encryptString(normalizedKey).toString("base64"),
  });

  return {
    connected: true,
    maskedKey: maskCaqliApiKey(normalizedKey),
  };
}

export function clearCaqliApiKey(filePath: string): CaqliDesktopAuthState {
  writeDocument(filePath, {});
  return {
    connected: false,
    maskedKey: null,
  };
}

export function readCaqliAuthState(
  filePath: string,
  secretStorage: CaqliSecretStorage,
): CaqliDesktopAuthState {
  const apiKey = readCaqliApiKey(filePath, secretStorage);
  return {
    connected: apiKey !== null,
    maskedKey: maskCaqliApiKey(apiKey),
  };
}
