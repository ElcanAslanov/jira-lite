import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // Bu gün və həftə başlanğıcı
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    // Ümumi statistikalar
    const total = await prisma.issue.count();
    const todo = await prisma.issue.count({ where: { status: "TODO" } });
    const inProgress = await prisma.issue.count({ where: { status: "IN_PROGRESS" } });
    const done = await prisma.issue.count({ where: { status: "DONE" } });

    // Günlük və həftəlik statistikalar
    const todayCreated = await prisma.issue.count({
      where: { createdAt: { gte: todayStart } },
    });

    const weekCreated = await prisma.issue.count({
      where: { createdAt: { gte: weekStart } },
    });

    const weekDone = await prisma.issue.count({
      where: {
        status: "DONE",
        updatedAt: { gte: weekStart },
      },
    });

    return NextResponse.json({
      total,
      todo,
      inProgress,
      done,
      todayCreated,
      weekCreated,
      weekDone,
    });
  } catch (error) {
    console.error("📊 Statistika API xətası:", error);
    return NextResponse.json({ error: "Server xətası baş verdi." }, { status: 500 });
  }
}
