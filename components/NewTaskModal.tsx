"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Paperclip, CalendarClock } from "lucide-react";

export default function NewTaskModal({ token, onCreated }: any) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [type, setType] = useState<"TASK" | "BUG" | "STORY">("TASK");
  const [projectId, setProjectId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Layihə, Sprint və İstifadəçiləri yüklə
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [pRes, sRes, uRes] = await Promise.all([
          fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/sprints", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [pData, sData, uData] = await Promise.all([
          pRes.json(),
          sRes.json(),
          uRes.json(),
        ]);

        if (pRes.ok) setProjects(pData.projects || []);
        if (sRes.ok) setSprints(sData.sprints || []);
        if (uRes.ok) setUsers(uData.users || []);
      } catch {
        toast.error("Məlumatlar yüklənmədi ❌");
      }
    })();
  }, [token]);

  // 📎 Fayl seçimi
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  }

  // ✅ Yeni Task yaradılması
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Başlıq boş ola bilməz!");

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description || "");
    formData.append("priority", priority.toUpperCase());
    formData.append("type", type.toUpperCase());
    formData.append("projectId", projectId);
    if (sprintId) formData.append("sprintId", sprintId);
    if (assigneeId) formData.append("assigneeId", assigneeId);
    if (dueDate) formData.append("dueDate", dueDate);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xəta baş verdi");

      toast.success("✅ Tapşırıq yaradıldı!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setType("TASK");
      setAssigneeId("");
      setDueDate("");
      setFile(null);
      onCreated?.();
    } catch (err: any) {
      toast.error(err.message || "Xəta baş verdi ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
          ➕ Yeni Task
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-2xl w-[420px] max-h-[85vh] overflow-y-auto border border-gray-200">
          <Dialog.Title className="text-xl font-semibold mb-3 text-gray-800">
            ✨ Yeni Tapşırıq
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Başlıq"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <textarea
              placeholder="Açıqlama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
                }
                required
                className="border p-2 rounded"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "TASK" | "BUG" | "STORY")
                }
                required
                className="border p-2 rounded"
              >
                <option value="TASK">TASK</option>
                <option value="BUG">BUG</option>
                <option value="STORY">STORY</option>
              </select>
            </div>

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

            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Tapşırığı kimə verirsən?</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>

            {/* 🕓 Bitmə tarixi */}
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4" /> Bitmə tarixi və vaxtı
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {/* 📎 Fayl əlavə et */}
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                <Paperclip className="w-4 h-4" /> Fayl əlavə et
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="border p-2 rounded w-full cursor-pointer"
              />
              {file && (
                <p className="text-xs text-gray-500 mt-1">
                  📁 Seçilmiş fayl: {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded-md mt-2`}
            >
              {loading ? "Yaradılır..." : "Yarat"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
