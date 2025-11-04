import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Bütün qrupları gətir
export async function GET() {
  try {
    const groups = await prisma.rehberGroup.findMany({
      include: {
        department: {
          include: { company: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("GET /rehber-groups error:", error);
    return NextResponse.json({ error: "Məlumat yüklənmədi" }, { status: 500 });
  }
}

// 🔹 Yeni qrup əlavə et
export async function POST(req: Request) {
  try {
    const { name, departmentId } = await req.json();

    if (!name || !departmentId) {
      return NextResponse.json(
        { error: "Qrup adı və şöbə tələb olunur" },
        { status: 400 }
      );
    }

    const exists = await prisma.rehberGroup.findFirst({
      where: { name, departmentId },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Bu adda qrup artıq bu şöbədə mövcuddur" },
        { status: 400 }
      );
    }

    const group = await prisma.rehberGroup.create({
      data: { name, departmentId },
      include: {
        department: { include: { company: true } },
      },
    });

    return NextResponse.json({ message: "Qrup əlavə olundu ✅", group });
  } catch (error) {
    console.error("POST /rehber-groups error:", error);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🔹 Qrupu redaktə et
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { name, departmentId } = await req.json();

    if (!id || !name || !departmentId) {
      return NextResponse.json(
        { error: "Məlumat natamamdır" },
        { status: 400 }
      );
    }

    const updated = await prisma.rehberGroup.update({
      where: { id },
      data: { name, departmentId },
      include: {
        department: { include: { company: true } },
      },
    });

    return NextResponse.json({ message: "Qrup yeniləndi ✅", group: updated });
  } catch (error) {
    console.error("PATCH /rehber-groups error:", error);
    return NextResponse.json(
      { error: "Yeniləmək mümkün olmadı" },
      { status: 500 }
    );
  }
}

// 🔹 Qrupu sil
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID tapılmadı" }, { status: 400 });
    }

    await prisma.rehberGroup.delete({ where: { id } });

    return NextResponse.json({ message: "Silindi ✅" });
  } catch (error) {
    console.error("DELETE /rehber-groups error:", error);
    return NextResponse.json(
      { error: "Silmək mümkün olmadı" },
      { status: 500 }
    );
  }
}
