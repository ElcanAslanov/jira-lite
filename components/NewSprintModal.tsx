"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function NewSprintModal({ token, onCreated }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    projectId: "",
    name: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []));
  }, [token]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!form.projectId || !form.name.trim())
      return toast.error("Project və Sprint adı daxil olunmalıdır!");

    setLoading(true);
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Yeni sprint yaradıldı ✅");
      setForm({ projectId: "", name: "", goal: "" });
      setOpen(false);
      onCreated?.();
    } else {
      toast.error("Sprint yaradılarkən xəta baş verdi ❌");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Yeni Sprint
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">Yeni Sprint</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <select
              value={form.projectId}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectId: e.target.value }))
              }
              className="border p-2 rounded"
              required
            >
              <option value="">Project seç</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Sprint adı"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border p-2 rounded"
              required
            />

            <textarea
              placeholder="Sprint məqsədi (ixtiyari)"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              className="border p-2 rounded min-h-[70px]"
            />

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
