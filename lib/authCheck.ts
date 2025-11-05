import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

/**
 * 🔐 Token və rol yoxlaması funksiyası
 * 
 * - Token yoxdursa → 401
 * - Token etibarsızdırsa → 403
 * - İcazə verilən rollarda deyilsə → 403
 * 
 * @param req - Request obyekti (Next.js API)
 * @param allowedRoles - İcazə verilən rollar (məs: ["ADMIN"], ["ADMIN", "USER"])
 * 
 * @returns { decoded } obyekt qaytarır (id, email, role)
 * Əgər icazə yoxdur → { error: NextResponse.json(..., { status }) }
 */
export function authorize(req: Request, allowedRoles: string[]) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return { error: NextResponse.json({ error: "Token tapılmadı" }, { status: 401 }) };

  const token = auth.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded)
    return { error: NextResponse.json({ error: "Token etibarsızdır" }, { status: 403 }) };

  if (!allowedRoles.includes(decoded.role))
    return { error: NextResponse.json({ error: "İcazə yoxdur" }, { status: 403 }) };

  return { decoded };
}


