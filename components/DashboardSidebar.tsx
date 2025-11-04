"use client";
import { LogOut, User, Folder, PlaySquare, Puzzle, Users, BarChart3, Building2 } from "lucide-react";
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
    window.location.href = "/login";
  }

  const menuItems = [
    { key: "projects", icon: <Folder size={18} />, label: "Proyektlər" },
    { key: "sprints", icon: <PlaySquare size={18} />, label: "Sprintlər" },
    { key: "tasks", icon: <Puzzle size={18} />, label: "Tapşırıqlar" },
    { key: "statistics", icon: <BarChart3 size={18} />, label: "Statistika" },
  ];

  return (
    <aside className="glass w-64 h-screen flex flex-col justify-between p-5 text-white shadow-xl border-r border-white/10">
      <div>
        <h1 className="text-2xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Jira Lite
        </h1>

        {/* 🔹 Naviqasiya */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={`sidebar-btn ${
                activeView === item.key
                  ? "sidebar-btn-active"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* 👑 ADMIN görünüşü */}
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

             {userRole === "ADMIN" && (
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
                )}

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
