import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// ✅ Yeni project yarat
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  const { name, key, description } = await req.json();
  if (!name || !key) {
    return NextResponse.json({ error: "Ad və açar (key) tələb olunur." }, { status: 400 });
  }

  const ownerId = (decoded as any).id;

  const project = await prisma.project.create({
    data: {
      name,
      key,
      description,
      ownerId,
    },
  });

  return NextResponse.json({ message: "Project yaradıldı", project });
}

// ✅ Bütün project-ləri siyahıla
export async function GET() {
  const projects = await prisma.project.findMany({
    include: { sprints: true, issues: true },
  });

  return NextResponse.json({ projects });
}
