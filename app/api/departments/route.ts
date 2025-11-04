import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bu route-u SSR cache-dən çıxart
export const dynamic = "force-dynamic";

/** 🔹 Şöbələri gətir (şirkət adı ilə) */
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        company: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ departments });
  } catch (e) {
    console.error("GET /api/departments error:", e);
    return NextResponse.json({ error: "Məlumat yüklənmədi" }, { status: 500 });
  }
}

/** 🔹 Şöbə əlavə et: body = { name, companyId } */
export async function POST(req: Request) {
  try {
    const { name, companyId } = await req.json();

    if (!name || !companyId) {
      return NextResponse.json(
        { error: "Şöbə adı və şirkət tələb olunur" },
        { status: 400 }
      );
    }

    // company mövcuddurmu?
    const exists = await prisma.company.findUnique({ where: { id: companyId } });
    if (!exists) {
      return NextResponse.json(
        { error: "Seçilən şirkət tapılmadı" },
        { status: 404 }
      );
    }

    const department = await prisma.department.create({
      data: { name, companyId },
      include: { company: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ department }, { status: 201 });
  } catch (e) {
    console.error("POST /api/departments error:", e);
    return NextResponse.json({ error: "Yaratmaq mümkün olmadı" }, { status: 500 });
  }
}

/** 🔹 Şöbə redaktə et: 
 *  - ya query ?id=... 
 *  - ya da body-də { id, name, companyId }
*/
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");
    const body = await req.json().catch(() => ({}));
    const id = idFromQuery || body?.id;

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    const updateData: any = {};
    if (body?.name) updateData.name = body.name;
    if (body?.companyId) {
      // company mövcudluğunu yoxla
      const company = await prisma.company.findUnique({ where: { id: body.companyId } });
      if (!company) {
        return NextResponse.json({ error: "Seçilən şirkət tapılmadı" }, { status: 404 });
      }
      updateData.companyId = body.companyId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Dəyişiklik məlumatı verilmir" }, { status: 400 });
    }

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
      include: { company: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ department });
  } catch (e) {
    console.error("PATCH /api/departments error:", e);
    return NextResponse.json({ error: "Yeniləmək mümkün olmadı" }, { status: 500 });
  }
}

/** 🔹 Şöbə sil: 
 *  - ya query ?id=...
 *  - ya da body-də { id }
*/
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");
    let id = idFromQuery;

    if (!idFromQuery) {
      const body = await req.json().catch(() => ({}));
      id = body?.id || null;
    }

    if (!id) {
      return NextResponse.json({ error: "ID tələb olunur" }, { status: 400 });
    }

    // Əvvəl mövcudmu?
    const exists = await prisma.department.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Şöbə tapılmadı" }, { status: 404 });
    }

    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: "Şöbə silindi ✅" });
  } catch (e: any) {
    console.error("DELETE /api/departments error:", e);
    return NextResponse.json({ error: "Silmək mümkün olmadı" }, { status: 500 });
  }
}
