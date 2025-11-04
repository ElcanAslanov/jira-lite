import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// 🧩 Yeni Task yaratmaq
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const {
      projectId,
      sprintId,
      title,
      description,
      priority,
      startDate,
      endDate,
      type,
      assigneeId,
    } = await req.json();

    const reporterId = String((decoded as any).id);

    const issue = await prisma.issue.create({
      data: {
        projectId,
        sprintId,
        title,
        description,
        priority,
        reporterId,
        assigneeId: assigneeId ? String(assigneeId) : reporterId, // ✅ hər iki tərəf String
        type: type || "TASK",
        status: "TODO",
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });

    // ✅ Bildiriş (assignee varsa)
    if (issue.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: issue.assigneeId,
          message: `Sizə yeni tapşırıq təyin olundu: "${title}"`,
          issueId: issue.id,
        },
      });
    }

    return NextResponse.json({ message: "Task yaradıldı ✅", issue });
  } catch (err) {
    console.error("POST /issues error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🧾 Bütün task-ləri gətir
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  const userRole = (decoded as any).role;
  const userId = String((decoded as any).id); // ✅ id-ni String-ə çeviririk

  const whereCondition =
    userRole === "ADMIN"
      ? {}
      : {
          OR: [{ assigneeId: userId }, { reporterId: userId }],
        };

  const issues = await prisma.issue.findMany({
    where: whereCondition,
    include: {
      project: true,
      sprint: true,
      assignee: true,
      reporter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("🧩 userId:", userId, "issues:", issues.length);

  return NextResponse.json({ issues });
}

// 🔹 Mövcud task yenilənməsi (admin və assignee görə bilər)
export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const { id, status, priority } = await req.json();
    if (!id)
      return NextResponse.json(
        { error: "Task ID tələb olunur" },
        { status: 400 }
      );

    const userId = String((decoded as any).id); // ✅ string çevrilməsi
    const role = (decoded as any).role;

    const task = await prisma.issue.findUnique({ where: { id } });
    if (!task)
      return NextResponse.json({ error: "Task tapılmadı" }, { status: 404 });

    if (role !== "ADMIN" && task.assigneeId !== userId)
      return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

    const updated = await prisma.issue.update({
      where: { id },
      data: { ...(status && { status }), ...(priority && { priority }) },
    });

    return NextResponse.json({ message: "Task yeniləndi ✅", updated });
  } catch (err) {
    console.error("PATCH /issues error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
