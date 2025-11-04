"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function NewTaskModal({ token, onCreated }: any) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [type, setType] = useState("TASK");
  const [projectId, setProjectId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [assigneeId, setAssigneeId] = useState(""); // ✅ yeni sahə
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // ✅ istifadəçilər siyahısı
  const [loading, setLoading] = useState(false);

  // 🔹 Bütün proyektləri gətir
  async function loadProjects() {
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch {
      toast.error("Proyektlər yüklənmədi ❌");
    }
  }

  // 🔹 Sprintləri gətir
  async function loadSprints() {
    try {
      const res = await fetch("/api/sprints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSprints(data.sprints || []);
    } catch {
      toast.error("Sprintlər yüklənmədi ❌");
    }
  }

  // 🔹 İstifadəçiləri gətir (Assignee üçün)
  async function loadUsers() {
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch {
      console.warn("İstifadəçilər yüklənmədi ❌");
    }
  }

  useEffect(() => {
    if (token) {
      loadProjects();
      loadSprints();
      loadUsers(); // ✅ assignee üçün userləri yüklə
    }
  }, [token]);

  // 🔹 Yeni Task yaradılması
  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        type,
        projectId,
        sprintId,
        assigneeId: assigneeId || null, // ✅ əlavə olundu
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Tapşırıq yaradıldı ✅");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setType("TASK");
      setAssigneeId("");
      onCreated && onCreated();
    } else {
      toast.error(data.error || "Xəta baş verdi ❌");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          ➕ Yeni Task
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <Dialog.Title className="text-lg font-semibold mb-3">
            Yeni Tapşırıq Yarat
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Başlıq"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border p-2 rounded"
            />

            <textarea
              placeholder="Açıqlama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border p-2 rounded"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="TASK">TASK</option>
              <option value="BUG">BUG</option>
              <option value="STORY">STORY</option>
            </select>

            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="">Proyekt seç</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Sprint seç</option>
              {sprints
                .filter((s) => !projectId || s.projectId === projectId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {/* ✅ Yeni əlavə olunan hissə */}
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Assignee (Tapşırığı kimə verirsən)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Yaradılır..." : "Yarat"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
