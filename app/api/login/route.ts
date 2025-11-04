import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 🔍 İstifadəçini tap
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "İstifadəçi tapılmadı." },
        { status: 404 }
      );
    }

    // 🔐 Şifrəni yoxla
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Şifrə yanlışdır." },
        { status: 401 }
      );
    }

    // 🔑 Token yaradılır
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 🕒 Son daxil olma tarixini yenilə (yalnız varsa)
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
        } as any, // ✅ TypeScript səhvini keçici olaraq düzəldir
      });
    } catch (err) {
      console.warn("⚠️ lastLogin yenilənmədi:", err);
      updatedUser = user; // fallback
    }

    // ✅ Token və istifadəçi məlumatı göndər
    return NextResponse.json(
      {
        message: "Giriş uğurludur ✅",
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          lastLogin: updatedUser.lastLogin ?? null, // 🔹 əlavə etdik
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  }
}
