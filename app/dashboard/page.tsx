"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardView from "@/components/DashboardView";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Login yoxlaması
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Zəhmət olmasa, əvvəlcə daxil olun 🔐");
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  // 🔹 View-i localStorage və role-a görə bərpa et
  useEffect(() => {
    const savedView = localStorage.getItem("dashboard_active_view");
    const role = localStorage.getItem("role");

    if (savedView) {
      setActiveView(savedView);
    } else {
      if (role === "ADMIN") setActiveView("projects");
      else setActiveView("tasks");
    }
  }, []);

  // 🔹 View dəyişəndə yadda saxla
  useEffect(() => {
    if (activeView) {
      localStorage.setItem("dashboard_active_view", activeView);
    }
  }, [activeView]);

  if (loading || !activeView) {
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
