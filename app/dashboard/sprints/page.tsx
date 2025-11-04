"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SprintsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [newSprint, setNewSprint] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadData() {
    const [pRes, sRes] = await Promise.all([
      fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/sprints", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const pData = await pRes.json();
    const sData = await sRes.json();
    setProjects(pData.projects || []);
    setSprints(sData.sprints || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addSprint() {
    if (!selectedProject || !newSprint.trim()) return toast.error("Boş dəyərlər olmaz!");
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ projectId: selectedProject, name: newSprint }),
    });
    if (res.ok) {
      toast.success("Sprint əlavə olundu ✅");
      setNewSprint("");
      loadData();
    } else toast.error("Xəta baş verdi ❌");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 text-gray-800">🚀 Sprintlər</h1>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Project seç</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          value={newSprint}
          onChange={(e) => setNewSprint(e.target.value)}
          placeholder="Sprint adı"
          className="border p-2 rounded"
        />
        <button
          onClick={addSprint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Əlavə et
        </button>
      </div>

      <ul className="space-y-2">
        {sprints.map((s) => (
          <li
            key={s.id}
            className="bg-white p-3 rounded-lg shadow border hover:shadow-md transition"
          >
            {s.name} <span className="text-gray-500">({s.project?.name ?? "—"})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
