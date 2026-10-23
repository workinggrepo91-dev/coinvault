import nodemailer from "nodemailer";

interface SendCodeEmailParams {
  to: string;
  name?: string;
  code: string;
  action?: "change" | "reset";
}

/**
 * Creates a configured Nodemailer transporter using environment variables.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Useful for corporate/self-signed certs if needed
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

/**
 * Generates the CoinVault branded HTML template for verification codes.
 */
function generateEmailHtml(code: string, recipientName?: string, action: "change" | "reset" = "change") {
  const actionText = action === "reset" ? "Password Reset" : "Password Change";
  const greeting = recipientName ? `Hello ${recipientName},` : "Hello,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${actionText} Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020617; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 40px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; width: 44px; height: 44px; background-color: #020617; border-radius: 12px; line-height: 44px; font-weight: 800; font-size: 22px; color: #10b981; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                      V
                    </div>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                      COIN VAULT
                    </div>
                    <div style="font-size: 11px; letter-spacing: 1.5px; color: rgba(255,255,255,0.85); text-transform: uppercase; margin-top: 4px;">
                      Institutional Vault Security
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 36px 30px 36px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center;">
                ${actionText} Verification
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #94a3b8; text-align: center;">
                ${greeting} We received a request to update the security credentials for your CoinVault account. Use the authorization code below to complete this action:
              </p>

              <!-- Verification Code Display -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #020617; border: 2px dashed #10b981; border-radius: 16px; padding: 20px 30px; display: inline-block;">
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #10b981; text-align: center;">
                        ${code}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Details -->
              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 20px; color: #cbd5e1; text-align: center;">
                ⏱️ This authentication code will expire in <strong style="color: #ffffff;">15 minutes</strong>.
              </p>

              <!-- Warning Box -->
              <div style="margin-top: 30px; background-color: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 14px 18px;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #f87171;">
                  <strong>Security Advisory:</strong> If you did not initiate this request, someone may be attempting to access your account. Please log in and review your security settings immediately.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 18px;">
                CoinVault Automated Cryptographic Security System<br>
                Never share this code with anyone, including CoinVault support staff.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a 6-digit password verification code email to the specified user.
 * If SMTP credentials are not configured, prints the code to the console for development testing.
 */
export async function sendPasswordAuthenticationCode({
  to,
  name,
  code,
  action = "change",
}: SendCodeEmailParams): Promise<{ success: boolean; error?: string; devMode?: boolean }> {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    `"CoinVault Security" <${process.env.SMTP_USER || "security@coinvault.com"}>`;

  const transporter = createTransporter();

  // If no SMTP settings configured, gracefully log to console in dev mode
  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`🔒 [COINVAULT NODEMAILER SIMULATOR - DEV MODE]`);
    console.log(`Recipient: ${to}`);
    console.log(`Action: ${action.toUpperCase()} PASSWORD`);
    console.log(`Authentication Code: >>> ${code} <<<`);
    console.log(`Expires in: 15 minutes`);
    console.log(`To send real emails, add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to your .env file.`);
    console.log(`======================================================\n`);

    return {
      success: true,
      devMode: true,
    };
  }

  try {
    const subject =
      action === "reset"
        ? `${code} is your CoinVault password reset code`
        : `${code} is your CoinVault password change authentication code`;

    const html = generateEmailHtml(code, name, action);

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: `Your CoinVault verification code is: ${code}. This code expires in 15 minutes.`,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Nodemailer failed to send email:", err);
    return {
      success: false,
      error: err.message || "Failed to send email verification code.",
    };
  }
}
