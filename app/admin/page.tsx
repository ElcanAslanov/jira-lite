"use client";
import { useEffect, useState } from "react";
import {
  Trash2,
  FolderKanban,
  RefreshCw,
  ListChecks,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadData() {
    if (!token) return;
    const [pRes, sRes, iRes] = await Promise.all([
      fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/sprints", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/issues", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const pData = await pRes.json();
    const sData = await sRes.json();
    const iData = await iRes.json();

    setProjects(pData.projects || []);
    setSprints(sData.sprints || []);
    setIssues(iData.issues || []);
  }

  useEffect(() => {
    loadData();
  }, [token]);

  async function deleteItem(type: "project" | "sprint" | "issue", id: string) {
    const url = `/api/${type}s`;
    if (!confirm(`${type} silinsin?`)) return;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success(`${type} silindi ✅`);
      loadData();
    } else {
      toast.error(`${type} silinmədi ❌`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 🔹 Header */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          ⚙️ Admin Dashboard
        </h1>
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Yenilə
        </button>
      </div>

      {/* 🔸 Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white shadow-sm border rounded-xl p-4 flex items-center gap-3">
          <FolderKanban className="w-8 h-8 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Layihə sayı</p>
            <p className="text-xl font-bold">{projects.length}</p>
          </div>
        </div>
        <div className="bg-white shadow-sm border rounded-xl p-4 flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Sprint sayı</p>
            <p className="text-xl font-bold">{sprints.length}</p>
          </div>
        </div>
        <div className="bg-white shadow-sm border rounded-xl p-4 flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Task sayı</p>
            <p className="text-xl font-bold">{issues.length}</p>
          </div>
        </div>
      </div>

      {/* 🔹 Data Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🟦 Projects */}
        <div className="bg-white rounded-2xl shadow-md border p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-indigo-700">
            <FolderKanban className="w-5 h-5" /> Layihələr
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">Layihə yoxdur.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.key}</p>
                  </div>
                  <button
                    onClick={() => deleteItem("project", p.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🟣 Sprints */}
        <div className="bg-white rounded-2xl shadow-md border p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-purple-700">
            <RefreshCw className="w-5 h-5" /> Sprintlər
          </h2>
          {sprints.length === 0 ? (
            <p className="text-gray-500 text-sm">Sprint yoxdur.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {sprints.map((s) => (
                <li
                  key={s.id}
                  className="py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.project?.name || "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteItem("sprint", s.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 🟩 Tasks */}
        <div className="bg-white rounded-2xl shadow-md border p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-green-700">
            <ListChecks className="w-5 h-5" /> Tasklar
          </h2>
          {issues.length === 0 ? (
            <p className="text-gray-500 text-sm">Tapşırıq yoxdur.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {issues.map((i) => (
                <li
                  key={i.id}
                  className="py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium text-gray-800">{i.title}</p>
                    <p className="text-xs text-gray-500">
                      {i.status} • {i.priority}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteItem("issue", i.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
