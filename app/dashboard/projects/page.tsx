"use client";
import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", key: "", description: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    fetch("/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Project yaradıldı!");
      setProjects((prev) => [...prev, data.project]);
      setForm({ name: "", key: "", description: "" });
    } else alert(data.error || "Xəta baş verdi");
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Yeni Project Yarat</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6 w-64">
        <input
          type="text"
          placeholder="Project adı"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Project açarı (KEY)"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Qısa təsvir"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Yarat
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Mövcud Projectlər:</h2>
      <ul className="list-disc pl-5">
        {projects.map((p) => (
          <li key={p.id}>
            <b>{p.name}</b> ({p.key})
          </li>
        ))}
      </ul>
    </div>
  );
}
