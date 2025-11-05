import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authCheck";

// ✅ Sprint yaratmaq (yalnız ADMIN)
export async function POST(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const { projectId, name, startDate, endDate } = await req.json();

    if (!projectId || !name) {
      return NextResponse.json(
        { error: "Proyekt və sprint adı tələb olunur." },
        { status: 400 }
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        name,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
      },
    });

    return NextResponse.json({
      message: "Sprint yaradıldı ✅",
      sprint,
    });
  } catch (error) {
    console.error("POST /sprints error:", error);
    return NextResponse.json(
      { error: "Sprint yaradılarkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Sprintləri siyahıla (yalnız ADMIN)
export async function GET(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const sprints = await prisma.sprint.findMany({
      include: {
        project: { select: { id: true, name: true, key: true } },
        issues: { select: { id: true, title: true, status: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error("GET /sprints error:", error);
    return NextResponse.json(
      { error: "Sprintlər alınarkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Sprint yeniləmək (yalnız ADMIN)
export async function PATCH(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Sprint ID tələb olunur" }, { status: 400 });

  try {
    const { name, startDate, endDate, isActive } = await req.json();

    const updated = await prisma.sprint.update({
      where: { id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    return NextResponse.json({
      message: "Sprint yeniləndi ✅",
      updated,
    });
  } catch (error) {
    console.error("PATCH /sprints error:", error);
    return NextResponse.json(
      { error: "Sprint yenilənərkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// ✅ Sprint silmək (yalnız ADMIN)
export async function DELETE(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const force = searchParams.get("force") === "true";

  if (!id)
    return NextResponse.json({ error: "Sprint ID tələb olunur" }, { status: 400 });

  try {
    // 🔹 Bu sprintə bağlı tapşırıqlar
    const issues = await prisma.issue.findMany({
      where: { sprintId: id },
      select: { id: true },
    });

    // 🟡 Əgər tapşırıq varsa və FORCE yoxdursa — xəbərdarlıq et
    if (issues.length > 0 && !force) {
      return NextResponse.json({
        warning: true,
        count: issues.length,
        message: `Bu sprintdə ${issues.length} tapşırıq var. Yenə də silmək istəyirsiniz?`,
      });
    }

    // 🔴 FORCE və ya tapşırıq yoxdursa — sil
    if (issues.length > 0) {
      await prisma.issue.deleteMany({ where: { sprintId: id } });
    }

    await prisma.sprint.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message:
        issues.length > 0
          ? `Sprint və ona bağlı ${issues.length} tapşırıq silindi ✅`
          : "Sprint silindi ✅",
    });
  } catch (error) {
    console.error("DELETE /sprints error:", error);
    return NextResponse.json(
      { error: "Sprint silinərkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}
