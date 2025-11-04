import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcrypt";

// 🔹 Bütün istifadəçiləri gətir (yalnız ADMIN)
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  if ((decoded as any).role !== "ADMIN")
    return NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 });

  // 🔸 İstifadəçiləri şöbə və rəhbərlə birlikdə gətiririk
  const users = await prisma.user.findMany({
    include: {
      department: { select: { id: true, name: true } },
      rehber: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// 🔹 Yeni istifadəçi əlavə et
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  if ((decoded as any).role !== "ADMIN")
    return NextResponse.json(
      { error: "Yalnız admin istifadəçi yarada bilər" },
      { status: 403 }
    );

  try {
    const { name, email, password, phone, departmentId, role, rehberId } =
      await req.json();

    if (!email || !password || !name)
      return NextResponse.json(
        { error: "Ad, Email və şifrə tələb olunur" },
        { status: 400 }
      );

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return NextResponse.json(
        { error: "Bu email artıq qeydiyyatdan keçib" },
        { status: 400 }
      );

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        departmentId: departmentId || null,
        passwordHash: hashed,
        role: role || "USER",
        rehberId: rehberId || null,
      },
      include: {
        department: { select: { name: true } },
        rehber: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ message: "İstifadəçi əlavə olundu ✅", user });
  } catch (error) {
    console.error("POST /users error:", error);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🔹 İstifadəçi redaktə et
export async function PATCH(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  if ((decoded as any).role !== "ADMIN")
    return NextResponse.json(
      { error: "Yalnız admin dəyişiklik edə bilər" },
      { status: 403 }
    );

  try {
    const { id, name, email, phone, departmentId, role, password, rehberId } =
      await req.json();
    if (!id)
      return NextResponse.json({ error: "ID tapılmadı" }, { status: 400 });

    const updateData: any = {
      name,
      email,
      phone,
      departmentId: departmentId || null,
      role,
      rehberId: rehberId || null,
    };

    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        department: { select: { id: true, name: true } },
        rehber: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      message: "İstifadəçi yeniləndi ✅",
      user: updated,
    });
  } catch (error) {
    console.error("PATCH /users error:", error);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}

// 🔹 İstifadəçi sil
export async function DELETE(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return NextResponse.json({ error: "Token tapılmadı" }, { status: 401 });

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 });

  if ((decoded as any).role !== "ADMIN")
    return NextResponse.json(
      { error: "Yalnız admin silə bilər" },
      { status: 403 }
    );

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID tapılmadı" }, { status: 400 });

    // ✅ rəhbər silindikdə, işçilərin rəhbər əlaqəsini null et
    await prisma.user.updateMany({
      where: { rehberId: id },
      data: { rehberId: null },
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "İstifadəçi silindi ✅" });
  } catch (error) {
    console.error("DELETE /users error:", error);
    return NextResponse.json({ error: "Silmək mümkün olmadı" }, { status: 500 });
  }
}
