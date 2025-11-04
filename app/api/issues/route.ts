import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // 🧾 FormData alırıq (JSON yox!)
    const form = await req.formData();

    const title = form.get("title") as string;
    const description = form.get("description") as string | null;
    const priority = form.get("priority") as string | null;
    const type = form.get("type") as string | null;
    const projectId = form.get("projectId") as string | null;
    const sprintId = form.get("sprintId") as string | null;
    const assigneeId = form.get("assigneeId") as string | null;
    const dueDate = form.get("dueDate") as string | null;
    const file = form.get("file") as File | null;

    const reporterId = String((decoded as any).id);

    // 📁 Fayl yükləmə
    let attachmentUrl: string | null = null;
    if (file) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      attachmentUrl = `/uploads/${file.name}`;
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        projectId: projectId || undefined,
        sprintId: sprintId || undefined,
        priority: priority as any,
        type: (type as any) || "TASK",
        reporterId,
        assigneeId: assigneeId ? String(assigneeId) : reporterId,
        status: "TODO",
        dueDate: dueDate ? new Date(dueDate) : null,
        attachment: attachmentUrl,
      },
    });

    // 🔔 Bildiriş
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
  const userId = String((decoded as any).id);

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

  return NextResponse.json({ issues });
}

// 🔹 Task yenilənməsi
export async function PATCH(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth)
      return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

    const { id, status, priority, assigneeId } = await req.json();
    if (!id)
      return NextResponse.json({ error: "Task ID tələb olunur" }, { status: 400 });

    const userId = String((decoded as any).id);
    const role = (decoded as any).role;

    const task = await prisma.issue.findUnique({ where: { id } });
    if (!task)
      return NextResponse.json({ error: "Task tapılmadı" }, { status: 404 });

    if (role !== "ADMIN" && task.assigneeId !== userId)
      return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId && { assigneeId }),
      },
    });

    return NextResponse.json({ message: "Task yeniləndi ✅", updated });
  } catch (err) {
    console.error("PATCH /issues error:", err);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

