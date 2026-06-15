import { NextRequest, NextResponse } from "next/server";
import { loadFromDrive, saveToDrive } from "@/lib/google-drive";
import { ExpenseData } from "@/types/expense";

function getTokens(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  return { accessToken, refreshToken };
}

export async function GET(request: NextRequest) {
  const { accessToken, refreshToken } = getTokens(request);

  if (!accessToken) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const data = await loadFromDrive(accessToken, refreshToken);
    return NextResponse.json(data || { expenses: [], lastSaved: "" });
  } catch {
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = getTokens(request);

  if (!accessToken) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    const data: ExpenseData = await request.json();
    data.lastSaved = new Date().toISOString();
    await saveToDrive(data, accessToken, refreshToken);
    return NextResponse.json({ success: true, lastSaved: data.lastSaved });
  } catch {
    return NextResponse.json({ error: "Erreur de sauvegarde" }, { status: 500 });
  }
}
