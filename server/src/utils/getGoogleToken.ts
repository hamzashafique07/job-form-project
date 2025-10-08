/** @format */
// server/src/utils/getGoogleToken.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";

// 1️⃣ Read OAuth client credentials
const credentialsPath = path.join(__dirname, "../config/oauth-client.json");
const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
const { client_id, client_secret, redirect_uris } = credentials.web;

// 2️⃣ Create OAuth client
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// 3️⃣ Generate URL (IMPORTANT: force refresh_token issuance)
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // <— crucial: forces refresh_token every time
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

console.log("\n🔗 Visit this URL to authorize the app:\n");
console.log(authUrl);
console.log(
  "\nAfter granting permission, copy the `code` from the redirect URL and paste it below.\n"
);

// 4️⃣ Optional: auto-run if code provided manually below
const code =
  "4/0AVGzR1BDunCTndcSOFPK2p6dzHQRMeRR4BJyCSxkjIitKU7JT05qxNvYdBaUBB-blbhIFQ"; // <— paste code here after visiting link

async function main() {
  if (!code) {
    console.log("⚠️  No code provided yet. Paste it into `code` and re-run.");
    return;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log(
      "\n✅ Your token JSON (copy into .env as GOOGLE_OAUTH_TOKEN=...):"
    );
    console.log(JSON.stringify(tokens, null, 2));
  } catch (err) {
    console.error("❌ Token generation failed:", err);
  }
}

main();
