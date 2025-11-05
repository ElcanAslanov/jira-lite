"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function SprintList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [open, setOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<any>(null);
  const [deleteSprint, setDeleteSprint] = useState<any>(null);
  const [forceDelete, setForceDelete] = useState<any>(null); // ⚠️ yeni modal üçün
  const [form, setForm] = useState({
    projectId: "",
    name: "",
    startDate: "",
    endDate: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🔹 Sprint və layihələri yüklə
  async function loadProjects() {
    const res = await fetch("/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProjects(data.projects || []);
  }

  async function loadSprints() {
    const res = await fetch("/api/sprints", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSprints(data.sprints || []);
  }

  useEffect(() => {
    loadProjects();
    loadSprints();
  }, []);

  // 🔹 Yeni Sprint yarat
  async function createSprint(e: any) {
    e.preventDefault();
    if (!form.projectId || !form.name)
      return toast.error("Proyekt və sprint adı tələb olunur");

    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Sprint əlavə olundu ✅");
      setForm({ projectId: "", name: "", startDate: "", endDate: "" });
      setOpen(false);
      loadSprints();
    } else {
      toast.error("Sprint əlavə olunmadı ❌");
    }
  }

  // 🔹 Sprint redaktə et
  async function updateSprint() {
    if (!editSprint) return;
    const res = await fetch(`/api/sprints?id=${editSprint.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editSprint),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Sprint yeniləndi ✅");
      setEditSprint(null);
      loadSprints();
    } else {
      toast.error(data.error || "Yenilənmə zamanı xəta");
    }
  }

  // 🔹 Sprint sil (warning + force dəstəyi ilə)
  async function confirmDelete(force = false) {
    if (!deleteSprint) return;

    const url = `/api/sprints?id=${deleteSprint.id}${force ? "&force=true" : ""}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // ⚠️ Əgər warning gəlirsə — Radix modal aç
    if (data.warning && !force) {
      setForceDelete({
        sprint: deleteSprint,
        message: data.message,
        count: data.count,
      });
      return;
    }

    if (res.ok) {
      toast.success(data.message || "Sprint silindi ✅");
      setDeleteSprint(null);
      setForceDelete(null);
      loadSprints();
    } else {
      toast.error(data.error || "Silinmə zamanı xəta");
    }
  }

  const filteredSprints = selectedProject
    ? sprints.filter((s) => s.projectId === selectedProject)
    : sprints;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      {/* Başlıq */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">🏃 Sprintlər</h1>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 active:scale-95 transition">
              + Yeni Sprint
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-[350px] border border-gray-200">
              <Dialog.Title className="text-lg font-bold mb-3">
                Yeni Sprint
              </Dialog.Title>
              <form onSubmit={createSprint} className="flex flex-col gap-3">
                <select
                  value={form.projectId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, projectId: e.target.value }))
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Proyekt seç</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Sprint adı"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="border p-2 rounded"
                />

                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="border p-2 rounded"
                />

                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="border p-2 rounded"
                />

                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 active:scale-95 transition"
                >
                  Əlavə et
                </button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Filtr */}
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      >
        <option value="">Bütün proyektlər</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Sprint siyahısı */}
      {filteredSprints.length === 0 ? (
        <p className="text-gray-500 text-sm">Sprint tapılmadı.</p>
      ) : (
        <ul className="space-y-3">
          {filteredSprints.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded-lg hover:bg-gray-50 transition flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.project?.name ?? "—"} •{" "}
                  {new Date(s.startDate).toLocaleDateString()} -{" "}
                  {new Date(s.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditSprint(s)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  Düzəlt
                </button>
                <button
                  onClick={() => setDeleteSprint(s)}
                  className="text-red-600 hover:text-red-800 font-medium transition"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ✏️ Düzəlt Modal */}
      <Dialog.Root open={!!editSprint} onOpenChange={() => setEditSprint(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-[350px] border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <Dialog.Title className="text-lg font-bold">
                Sprint Düzəlişi
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-black">
                  <X />
                </button>
              </Dialog.Close>
            </div>

            <input
              type="text"
              className="border p-2 rounded w-full mb-3"
              value={editSprint?.name || ""}
              onChange={(e) =>
                setEditSprint((p: any) => ({ ...p, name: e.target.value }))
              }
            />

            <input
              type="date"
              className="border p-2 rounded w-full mb-3"
              value={editSprint?.startDate?.split("T")[0] || ""}
              onChange={(e) =>
                setEditSprint((p: any) => ({ ...p, startDate: e.target.value }))
              }
            />

            <input
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={editSprint?.endDate?.split("T")[0] || ""}
              onChange={(e) =>
                setEditSprint((p: any) => ({ ...p, endDate: e.target.value }))
              }
            />

            <button
              onClick={updateSprint}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 w-full active:scale-95 transition"
            >
              Yenilə ✅
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 🗑️ Silmə təsdiqi */}
      <Dialog.Root open={!!deleteSprint} onOpenChange={() => setDeleteSprint(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-[320px] text-center border border-gray-200">
            <Dialog.Title className="text-lg font-bold mb-3 text-gray-800">
              Sprint silinsinmi?
            </Dialog.Title>
            <p className="text-gray-600 mb-4">
              <b>{deleteSprint?.name}</b> adlı sprinti silmək istədiyinizə əminsiniz?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteSprint(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 active:scale-95 transition"
              >
                Ləğv et
              </button>
              <button
                onClick={() => confirmDelete()}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 active:scale-95 transition"
              >
                Bəli, sil
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ⚠️ Tapşırıq xəbərdarlığı (force delete modal) */}
      <Dialog.Root open={!!forceDelete} onOpenChange={() => setForceDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl w-[360px] text-center border border-red-300">
            <Dialog.Title className="text-lg font-bold text-red-700 mb-2">
              ⚠️ Sprintdə tapşırıqlar var
            </Dialog.Title>
            <p className="text-gray-600 mb-4">
              Bu sprintdə <b>{forceDelete?.count}</b> tapşırıq var.
              <br />
              <span className="text-sm">{forceDelete?.message}</span>
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setForceDelete(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 active:scale-95 transition"
              >
                Ləğv et
              </button>
              <button
                onClick={() => confirmDelete(true)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 active:scale-95 transition"
              >
                Bəli, hamısını sil
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
