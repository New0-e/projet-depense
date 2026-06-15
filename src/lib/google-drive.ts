import { google } from "googleapis";
import { ExpenseData } from "@/types/expense";

const FILE_NAME = "depenses.json";

function getAuth() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const auth = getAuth();
  return auth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const auth = getAuth();
  const { tokens } = await auth.getToken(code);
  return tokens;
}

function getDriveClient(accessToken: string, refreshToken?: string) {
  const auth = getAuth();
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: "v3", auth });
}

async function findFile(drive: ReturnType<typeof google.drive>, name: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${name}' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });
  const files = res.data.files;
  if (files && files.length > 0 && files[0].id) {
    return files[0].id;
  }
  return null;
}

export async function loadFromDrive(accessToken: string, refreshToken?: string): Promise<ExpenseData | null> {
  const drive = getDriveClient(accessToken, refreshToken);
  const fileId = await findFile(drive, FILE_NAME);
  if (!fileId) return null;

  const res = await drive.files.get({
    fileId,
    alt: "media",
  });

  return res.data as ExpenseData;
}

export async function saveToDrive(
  data: ExpenseData,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const drive = getDriveClient(accessToken, refreshToken);
  const content = JSON.stringify(data, null, 2);
  const existingId = await findFile(drive, FILE_NAME);

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: {
        mimeType: "application/json",
        body: content,
      },
    });
  } else {
    await drive.files.create({
      requestBody: {
        name: FILE_NAME,
        mimeType: "application/json",
      },
      media: {
        mimeType: "application/json",
        body: content,
      },
    });
  }
}
