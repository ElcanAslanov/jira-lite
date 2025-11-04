"use client";
import { useState, useEffect } from "react";

export default function IssuesPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [form, setForm] = useState({
    projectId: "",
    sprintId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Mövcud projectləri yüklə
  useEffect(() => {
    if (!token) return;
    fetch("/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []));
  }, [token]);

  // Sprintləri yüklə
  useEffect(() => {
    if (!token || !form.projectId) return;
    fetch("/api/sprints", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // yalnız seçilmiş project-in sprintlərini göstər
        const filtered = (data.sprints || []).filter(
          (s: any) => s.projectId === form.projectId
        );
        setSprints(filtered);
      });
  }, [token, form.projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Task yaradıldı!");
      setForm({
        projectId: "",
        sprintId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
      });
    } else alert(data.error || "Xəta baş verdi");
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Yeni Task / Issue Yarat</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <select
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Project seç</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.key})
            </option>
          ))}
        </select>

        <select
          value={form.sprintId}
          onChange={(e) => setForm({ ...form, sprintId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Sprint seç</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Task başlığı"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Qısa təsvir"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />

        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Yarat
        </button>
      </form>
    </div>
  );
}
