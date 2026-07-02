// SPEC: Image upload endpoint for article featured images
// DEP-MAP: News Management > API > uploadImage
import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/db/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    await requireTeam();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "CB-API-001", message: "No file provided" } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "CB-API-002", message: "File must be JPEG, PNG, or WebP" } },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "CB-API-002", message: "File must be under 5MB" } },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `articles/${fileName}`;

    const supabase = createSupabaseAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[CB-INT-001] Upload failed:", uploadError);
      return NextResponse.json(
        { success: false, error: { code: "CB-INT-001", message: "Upload failed" } },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: { url: urlData.publicUrl },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "CB-API-001", message: "Unauthorized" } },
      { status: 401 }
    );
  }
}
