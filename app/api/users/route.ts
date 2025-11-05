import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authCheck";
import bcrypt from "bcrypt";

// 🔹 Bütün istifadəçiləri gətir (yalnız ADMIN)
export async function GET(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

  try {
    const users = await prisma.user.findMany({
      include: {
        department: { select: { id: true, name: true } },
        rehber: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /users error:", error);
    return NextResponse.json(
      { error: "İstifadəçilər alınarkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// 🔹 Yeni istifadəçi əlavə et (yalnız ADMIN)
export async function POST(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

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
        { error: "Bu email artıq qeydiyyatdan keçib ❌" },
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

    return NextResponse.json({
      message: "İstifadəçi əlavə olundu ✅",
      user,
    });
  } catch (error) {
    console.error("POST /users error:", error);
    return NextResponse.json({ error: "Server xətası ❌" }, { status: 500 });
  }
}

// 🔹 İstifadəçi redaktə et (yalnız ADMIN)
export async function PATCH(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

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
    return NextResponse.json(
      { error: "İstifadəçi yenilənərkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}

// 🔹 İstifadəçi sil (yalnız ADMIN)
export async function DELETE(req: Request) {
  const auth = authorize(req, ["ADMIN"]);
  if ("error" in auth) return auth.error;

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

    return NextResponse.json({
      message: "İstifadəçi silindi ✅",
    });
  } catch (error) {
    console.error("DELETE /users error:", error);
    return NextResponse.json(
      { error: "İstifadəçi silinərkən xəta baş verdi ❌" },
      { status: 500 }
    );
  }
}
