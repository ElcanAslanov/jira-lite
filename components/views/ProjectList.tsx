"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [form, setForm] = useState({ name: "", key: "" });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🔹 Proyektləri yüklə
  async function loadProjects() {
    if (!token) return;
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      toast.error("Proyektlər yüklənərkən xəta baş verdi ❌");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // 🔹 Yeni proyekt əlavə et
  async function createProject(e: any) {
    e.preventDefault();
    if (!form.name || !form.key) return toast.error("Ad və kod tələb olunur");
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
      toast.success("Proyekt əlavə olundu ✅");
      setForm({ name: "", key: "" });
      setOpen(false);
      loadProjects();
    } else {
      toast.error(data.error || "Proyekt əlavə olunmadı ❌");
    }
  }

  // 🔹 Proyekti redaktə et
  async function updateProject(e: any) {
    e.preventDefault();
    if (!selectedProject) return;
    const res = await fetch(`/api/projects?id=${selectedProject.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: selectedProject.name,
        key: selectedProject.key,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Proyekt yeniləndi ✅");
      setEditOpen(false);
      setSelectedProject(null);
      loadProjects();
    } else {
      toast.error(data.error || "Proyekt yenilənmədi ❌");
    }
  }

  // 🔹 İki mərhələli silmə funksiyası
  async function deleteProject(confirm = false) {
    if (!selectedProject) return;

    try {
      setLoadingDelete(true);
      const res = await fetch(
        `/api/projects?id=${selectedProject.id}${confirm ? "&confirm=true" : ""}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      // Əgər backend xəbərdarlıq göndərirsə
      if (data.warning) {
        setDeleteWarning(data.message);
        return;
      }

      if (res.ok) {
        toast.success("Proyekt silindi 🗑️");
        setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
        setDeleteOpen(false);
        setSelectedProject(null);
        setDeleteWarning(null);
      } else {
        toast.error(data.error || "Silinmə zamanı xəta baş verdi ❌");
      }
    } catch {
      toast.error("Serverə qoşulmaq alınmadı ❌");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">📁 Proyektlər</h1>

        {/* ✅ Yeni Proyekt Dialoqu */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-1">
              <Plus size={16} /> Yeni Proyekt
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[350px]">
              <Dialog.Title className="text-lg font-bold mb-3">
                Yeni Proyekt
              </Dialog.Title>
              <form onSubmit={createProject} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Proyekt adı"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Proyekt kodu (məs: CRM)"
                  value={form.key}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, key: e.target.value }))
                  }
                  className="border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                >
                  Əlavə et
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* ✅ Mövcud proyektlər */}
      {projects.length === 0 ? (
        <p className="text-gray-500 text-sm">Heç bir proyekt tapılmadı.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded-lg hover:bg-gray-50 transition flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">Kod: {p.key}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProject(p);
                    setEditOpen(true);
                  }}
                  className="p-2 rounded-md hover:bg-yellow-100 text-yellow-600"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(p);
                    setDeleteWarning(null);
                    setDeleteOpen(true);
                  }}
                  className="p-2 rounded-md hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 🗑️ Modern silmə Dialoqu */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg w-[360px] text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3 animate-pulse" />
            <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2">
              {deleteWarning
                ? "Əlaqəli məlumatlar aşkarlandı!"
                : "Proyekti silmək istədiyinizə əminsinizmi?"}
            </Dialog.Title>
            <p className="text-sm text-gray-500 mb-5">
              {deleteWarning ||
                "Bu əməliyyat geri alına bilməz. Proyekt və əlaqəli məlumatlar silinəcək."}
            </p>

            <div className="flex justify-center gap-3">
              <button
                disabled={loadingDelete}
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium disabled:opacity-50"
              >
                Ləğv et
              </button>
              <button
                disabled={loadingDelete}
                onClick={() => deleteProject(deleteWarning ? true : false)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  deleteWarning
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loadingDelete
                  ? "Silinir..."
                  : deleteWarning
                  ? "Bəli, yenə də sil"
                  : "Bəli, sil 🗑️"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
