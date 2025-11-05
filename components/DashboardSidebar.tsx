"use client";
import {
  LogOut,
  User,
  Folder,
  PlaySquare,
  Puzzle,
  Users,
  BarChart3,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import ProfileModal from "@/components/ProfileModal";

export default function DashboardSidebar({ activeView, setActiveView }: any) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      setUserRole(role);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("dashboard_active_view");
    window.location.href = "/login";
  }

  return (
    <aside className="glass w-64 h-screen flex flex-col justify-between p-5 text-white shadow-xl border-r border-white/10">
      <div>
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Jira Lite
        </h1>

        <nav className="flex flex-col gap-2">
          {/* 👑 ADMIN görünüşü */}
          {userRole === "ADMIN" && (
            <>
              <button
                onClick={() => setActiveView("projects")}
                className={`sidebar-btn ${
                  activeView === "projects"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Folder size={18} />
                Proyektlər
              </button>

              <button
                onClick={() => setActiveView("sprints")}
                className={`sidebar-btn ${
                  activeView === "sprints"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <PlaySquare size={18} />
                Sprintlər
              </button>
            </>
          )}

          {/* 👤 Bütün istifadəçilər görə bilər (yəni user və admin) */}
          <button
            onClick={() => setActiveView("tasks")}
            className={`sidebar-btn ${
              activeView === "tasks"
                ? "sidebar-btn-active"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <Puzzle size={18} />
            Tapşırıqlar
          </button>

          {/* 👑 Statistikalar yalnız admin üçün */}
          {userRole === "ADMIN" && (
            <button
              onClick={() => setActiveView("statistics")}
              className={`sidebar-btn ${
                activeView === "statistics"
                  ? "sidebar-btn-active"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <BarChart3 size={18} />
              Statistika
            </button>
          )}

          {/* 👑 Əlavə admin bölmələri */}
          {userRole === "ADMIN" && (
            <>
              <button
                onClick={() => setActiveView("companies")}
                className={`sidebar-btn ${
                  activeView === "companies"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                🏢 Şirkətlər
              </button>

              <button
                onClick={() => setActiveView("departments")}
                className={`sidebar-btn ${
                  activeView === "departments"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Building2 size={18} />
                Şöbələr
              </button>

              <button
                onClick={() => setActiveView("rehberGroups")}
                className={`sidebar-btn ${
                  activeView === "rehberGroups"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                👔 Rehber Qrupları
              </button>

              <button
                onClick={() => setActiveView("users")}
                className={`sidebar-btn ${
                  activeView === "users"
                    ? "sidebar-btn-active"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Users size={18} />
                İstifadəçilər
              </button>
            </>
          )}
        </nav>
      </div>

      {/* 🔻 Alt hissə */}
      <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <ProfileModal />
          <User className="text-gray-300 w-5 h-5" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white font-semibold py-2 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Çıxış et
        </button>
      </div>
    </aside>
  );
}
