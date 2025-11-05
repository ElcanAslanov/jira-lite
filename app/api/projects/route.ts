import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authCheck";

// ✅ Yeni project yarat (yalnız ADMIN)
export async function POST(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { name, key, description } = await req.json();
    if (!name || !key)
      return NextResponse.json(
        { error: "Ad və açar (key) tələb olunur." },
        { status: 400 }
      );

    const ownerId = (auth.decoded as any).id;

    const project = await prisma.project.create({
      data: { name, key, description, ownerId },
    });

    return NextResponse.json({
      message: "Proyekt yaradıldı ✅",
      project,
    });
  } catch (err) {
    console.error("POST /projects error:", err);
    return NextResponse.json(
      { error: "Proyekt yaradılarkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Bütün project-ləri siyahıla (yalnız ADMIN)
export async function GET(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const projects = await prisma.project.findMany({
      include: {
        sprints: { select: { id: true, name: true, startDate: true, endDate: true } },
        issues: { select: { id: true, title: true, priority: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (err) {
    console.error("GET /projects error:", err);
    return NextResponse.json(
      { error: "Proyektlər alınarkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Project-i yenilə (yalnız ADMIN)
export async function PATCH(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

  try {
    const { name, key, description } = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: { name, key, description },
    });

    return NextResponse.json({
      message: "Proyekt yeniləndi ✅",
      updated,
    });
  } catch (err) {
    console.error("PATCH /projects error:", err);
    return NextResponse.json(
      { error: "Yenilənmə zamanı xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Project-i sil (yalnız ADMIN)
export async function DELETE(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const confirm = searchParams.get("confirm") === "true";

  if (!id)
    return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });

  try {
    // 🔹 Bağlı sprint və issue-ların sayı
    const sprintCount = await prisma.sprint.count({ where: { projectId: id } });
    const issueCount = await prisma.issue.count({ where: { projectId: id } });

    // 🟡 Əgər təsdiq gəlməyibsə — xəbərdarlıq qaytar
    if (!confirm && (sprintCount > 0 || issueCount > 0)) {
      return NextResponse.json({
        warning: true,
        sprintCount,
        issueCount,
        message: `Bu proyektin ${sprintCount} sprint və ${issueCount} tapşırığı var. Silmək istədiyinizə əminsinizmi?`,
      });
    }

    // 🔴 Əgər təsdiqlənibsə — bağlı obyektləri də sil
    await prisma.issue.deleteMany({ where: { projectId: id } });
    await prisma.sprint.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({
      message: "Proyekt və əlaqəli məlumatlar silindi ✅",
    });
  } catch (err) {
    console.error("DELETE /projects error:", err);
    return NextResponse.json(
      { error: "Silinmə zamanı xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}
