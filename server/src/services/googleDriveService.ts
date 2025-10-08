// server/src/services/googleDriveService.ts
/** @format */
import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

type DriveClient = ReturnType<typeof google.drive>;

let driveClient: DriveClient | null = null;

/**
 * Create a readable stream from a Buffer
 */
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

/**
 * Initialize Drive client. Tries OAuth token first (GOOGLE_OAUTH_TOKEN),
 * otherwise tries service account json at src/config/drive-service-account.json.
 */
async function initDriveClient(): Promise<DriveClient> {
  if (driveClient) return driveClient;

  // Try OAuth token from env
  if (process.env.GOOGLE_OAUTH_TOKEN) {
    try {
      const credentialsPath = path.join(
        __dirname,
        "../config/oauth-client.json"
      );
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
      const { client_id, client_secret, redirect_uris } = credentials.web;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );
      // The env var should be a JSON string: {"access_token":"...","scope":"...","token_type":"Bearer","expiry_date":...}
      const token = JSON.parse(process.env.GOOGLE_OAUTH_TOKEN);
      oAuth2Client.setCredentials(token);
      driveClient = google.drive({ version: "v3", auth: oAuth2Client });
      return driveClient;
    } catch (err) {
      console.warn("googleDriveService: failed to init OAuth2 client:", err);
      // fallthrough to try service account
    }
  }

  // Try service account
  const saPath = path.join(__dirname, "../config/drive-service-account.json");
  if (fs.existsSync(saPath)) {
    try {
      const sa = JSON.parse(fs.readFileSync(saPath, "utf8"));
      // Use JWT client
      const jwtClient = new google.auth.JWT({
        email: sa.client_email,
        key: sa.private_key,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      } as any);
      await jwtClient.authorize();
      driveClient = google.drive({ version: "v3", auth: jwtClient });
      return driveClient;
    } catch (err) {
      console.warn(
        "googleDriveService: failed to init service-account client:",
        err
      );
    }
  }

  throw new Error(
    "No Google Drive credentials found. Set GOOGLE_OAUTH_TOKEN env var or provide drive-service-account.json."
  );
}

/**
 * Upload base64 PNG to drive and return publicly-downloadable URL
 */
export async function uploadSignatureToDrive(
  base64Data: string,
  fileName: string
): Promise<string> {
  const drive = await initDriveClient();

  const buffer = Buffer.from(
    base64Data.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const media = { mimeType: "image/png", body: bufferToStream(buffer) };
  const fileMetadata = { name: fileName };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  const fileId = file.data.id!;
  // make it readable by anyone
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}
