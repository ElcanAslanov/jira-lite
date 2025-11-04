import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// ✅ Sprint yaratmaq
export async function POST(req: Request) {
  try {
    const { projectId, name, startDate, endDate } = await req.json();

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        name,
        startDate: startDate ? new Date(startDate) : new Date(), // ⚡ default bu gün
        endDate: endDate ? new Date(endDate) : new Date(),       // ⚡ default bu gün
      },
    });

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error("Sprint create error:", error);
    return NextResponse.json({ error: "Sprint yaradılarkən xəta" }, { status: 500 });
  }
}


// ✅ Sprintləri siyahıla (GET)
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  const sprints = await prisma.sprint.findMany({
    include: { project: true, issues: true },
    orderBy: { startDate: "desc" }, // <-- burada startDate kullandık
  });

  return NextResponse.json({ sprints });
}

