"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

    if (res.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("userId", data.user.id);

  // 🔹 View-u sıfırla
  localStorage.removeItem("dashboard_active_view");

  toast.success("Giriş uğurlu ✅");

  // ✅ Rol əsasında yönləndirmə
if (data.user.role === "ADMIN") {
  localStorage.setItem("dashboard_active_view", "projects");
} else {
  localStorage.setItem("dashboard_active_view", "tasks");
}
window.location.href = "/dashboard";

}
 else {
        toast.error(data.message || "Yanlış email və ya şifrə ❌");
      }
    } catch {
      toast.error("Serverə qoşulmaq mümkün olmadı ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px]">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Jira Lite Giriş
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600">E-mail</label>
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Şifrə</label>
            <input
              type="password"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2 rounded-md outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 py-2 rounded-md text-white font-medium transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Daxil olunur..." : "Daxil ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
