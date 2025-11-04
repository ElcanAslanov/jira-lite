import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// 🔹 Bildirişləri gətir
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  const userId = (decoded as any).id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notifications });
}

// 🔹 Bildirişi oxundu kimi işarələ
export async function PATCH(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  const { id } = await req.json();

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ updated });
}
