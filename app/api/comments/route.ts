import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// 🟢 Şərh əlavə et
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const { issueId, body } = await req.json();
    const authorId = (decoded as any).id;

    if (!issueId || !body)
      return NextResponse.json({ error: "Boş məlumat göndərilə bilməz" }, { status: 400 });

    const comment = await prisma.issueComment.create({
      data: { issueId, body, authorId },
      include: { author: true },
    });

    return NextResponse.json({ message: "Şərh əlavə olundu ✅", comment });
  } catch (err) {
    console.error("POST /comments error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🟡 Şərh redaktə et
export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const { id, body } = await req.json();
    if (!id || !body)
      return NextResponse.json({ error: "Yanlış məlumat" }, { status: 400 });

    const updated = await prisma.issueComment.update({
      where: { id },
      data: { body },
    });

    return NextResponse.json({ message: "Yeniləndi ✅", updated });
  } catch (err) {
    console.error("PATCH /comments error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🔴 Şərh sil
export async function DELETE(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

    await prisma.issueComment.delete({ where: { id } });

    return NextResponse.json({ message: "Silindi ✅" });
  } catch (err) {
    console.error("DELETE /comments error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🔵 Müəyyən task-a aid şərhləri gətir
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get("issueId");

    if (!issueId)
      return NextResponse.json({ error: "issueId tələb olunur" }, { status: 400 });

    const comments = await prisma.issueComment.findMany({
      where: { issueId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error("GET /comments error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
