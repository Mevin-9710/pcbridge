import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "setup.sh");
    const content = await readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/x-sh",
        "Content-Disposition": "attachment; filename=setup.sh",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "setup.sh not found" },
      { status: 404 }
    );
  }
}
