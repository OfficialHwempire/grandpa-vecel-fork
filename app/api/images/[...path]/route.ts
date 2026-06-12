import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(process.cwd(), "images", ...segments)

  if (!filePath.startsWith(path.join(process.cwd(), "images"))) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const ext = path.extname(filePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  }
  const contentType = mimeMap[ext] ?? "application/octet-stream"

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
  })
}
