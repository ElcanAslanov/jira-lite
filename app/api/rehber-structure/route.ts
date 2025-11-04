import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Bütün rəhbər–işçi strukturu
export async function GET() {
  try {
    const rehbers = await prisma.user.findMany({
      where: { role: "REHBER" },
      include: {
        department: {
          include: { company: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // hər rəhbərin alt işçilərini gətir
    const rehberWithWorkers = await Promise.all(
      rehbers.map(async (r) => {
        const workers = await prisma.user.findMany({
          where: { role: "ISCI", departmentId: r.departmentId },
          select: { id: true, name: true, email: true, phone: true },
        });
        return { ...r, workers };
      })
    );

    return NextResponse.json({ rehbers: rehberWithWorkers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Struktur yüklənmədi" }, { status: 500 });
  }
}
