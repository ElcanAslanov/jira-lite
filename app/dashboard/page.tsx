"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardView from "@/components/DashboardView";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("projects");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Zəhmət olmasa, əvvəlcə daxil olun 🔐");
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Yüklənir...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <DashboardSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-6 overflow-y-auto">
        <DashboardView view={activeView} />
      </main>
    </div>
  );
}
