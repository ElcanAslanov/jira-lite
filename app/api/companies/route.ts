import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 🔹 Bütün şirkətləri gətir
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ companies });
  } catch (err) {
    console.error("Şirkətlər gətirilərkən xəta:", err);
    return NextResponse.json({ error: "Şirkətləri gətirmək mümkün olmadı" }, { status: 500 });
  }
}

// 🔹 Faylı saxlamaq üçün helper funksiya
async function saveLogoAndReturnPath(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), "public/uploads/company-logos");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, fileName), buffer);
  return `/uploads/company-logos/${fileName}`;
}

// 🔹 Yeni şirkət əlavə et (logoUrl ilə)
export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const file = formData.get("logo") as File | null;

  if (!name) {
    return NextResponse.json({ error: "Ad tələb olunur" }, { status: 400 });
  }

  let logoUrl: string | null = null;
  if (file && file.size > 0) {
    logoUrl = await saveLogoAndReturnPath(file);
  }

  const company = await prisma.company.create({
    data: { name, logoUrl },
  });

  return NextResponse.json({ message: "Şirkət əlavə olundu ✅", company });
}

// 🔹 Şirkət sil
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
  }

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ message: "Şirkət silindi ✅" });
}

// 🔹 Şirkət redaktəsi (logoUrl ilə)
export async function PATCH(req: Request) {
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const file = formData.get("logo") as File | null;

  if (!id || !name) {
    return NextResponse.json({ error: "ID və ad tələb olunur" }, { status: 400 });
  }

  const updateData: any = { name };

  if (file && file.size > 0) {
    updateData.logoUrl = await saveLogoAndReturnPath(file);
  }

  const updated = await prisma.company.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ message: "Şirkət yeniləndi ✅", company: updated });
}
