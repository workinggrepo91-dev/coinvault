import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";

/**
 * Creates an OTPAuth.TOTP instance for CoinVault.
 */
export function createTotpInstance(email: string, secretBase32?: string) {
  const secret = secretBase32
    ? OTPAuth.Secret.fromBase32(secretBase32)
    : new OTPAuth.Secret({ size: 20 });

  return new OTPAuth.TOTP({
    issuer: "CoinVault",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });
}

/**
 * Generates initial TOTP setup credentials:
 * - base32 secret
 * - otpauth:// URI
 * - High-res QR code as a PNG data URL
 */
export async function generateTotpSetup(email: string) {
  const totp = createTotpInstance(email);
  const secret = totp.secret.base32;
  const uri = totp.toString();

  const qrCodeDataUrl = await QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: {
      dark: "#020617",
      light: "#FFFFFF",
    },
  });

  return {
    secret,
    uri,
    qrCodeDataUrl,
  };
}

/**
 * Validates a 6-digit TOTP token against a base32 secret.
 * Allows a clock drift window of +/- 1 period (30 seconds).
 */
export function verifyTotpCode(secretBase32: string, token: string): boolean {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(cleanToken)) return false;

  try {
    const totp = new OTPAuth.TOTP({
      issuer: "CoinVault",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    const delta = totp.validate({
      token: cleanToken,
      window: 1,
    });

    return delta !== null;
  } catch (err) {
    return false;
  }
}

/**
 * Generates secure, formatted backup codes (e.g., "A1B2-C3D4")
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    codes.push(formatted);
  }
  return codes;
}

/**
 * Validates whether an entered code matches one of the user's remaining backup codes.
 * Returns whether it's valid and the updated list of remaining codes.
 */
export function verifyAndConsumeBackupCode(
  inputCode: string,
  backupCodes: string[]
): { isValid: boolean; remainingCodes: string[] } {
  if (!inputCode || !Array.isArray(backupCodes)) {
    return { isValid: false, remainingCodes: backupCodes || [] };
  }

  const cleanInput = inputCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleanInput.length !== 8) {
    return { isValid: false, remainingCodes: backupCodes };
  }

  const matchIndex = backupCodes.findIndex((c) => {
    const cleanStored = c.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    return cleanStored === cleanInput;
  });

  if (matchIndex === -1) {
    return { isValid: false, remainingCodes: backupCodes };
  }

  const remainingCodes = [...backupCodes];
  remainingCodes.splice(matchIndex, 1);

  return { isValid: true, remainingCodes };
}
