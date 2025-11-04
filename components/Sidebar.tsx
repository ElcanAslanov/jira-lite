"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  UserCog,
} from "lucide-react";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role"));
    }
  }, []);

  return (
    <aside className="w-64 h-screen bg-gray-800 text-gray-100 p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-6">🧩 Jira Lite</h2>

      <nav className="flex flex-col gap-2">
        {/* Bütün rollar üçün ümumi olanlar */}
        <Link
          href="/tasks"
          className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
        >
          <ClipboardList size={18} />
          <span>Tasks</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
        >
          <UserCog size={18} />
          <span>Profile</span>
        </Link>

        {/* 👑 Yalnız admin görür */}
        {role === "ADMIN" && (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/projects"
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </Link>

            <Link
              href="/sprints"
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
            >
              <ClipboardList size={18} />
              <span>Sprints</span>
            </Link>

            <Link
              href="/users"
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded transition"
            >
              <Users size={18} />
              <span>Users</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
