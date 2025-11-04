import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey123";

export function generateToken(user: any) {
  return jwt.sign(
    {
      id: String(user.id), // ✅ Tip fərqini düzəldir
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch (err) {
    return null;
  }
}
