import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", key: "" });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    if (res.ok) {
      toast.success("Proyekt əlavə olundu ✅");
      setForm({ name: "", key: "" });
      setOpen(false);
      loadProjects();
    } else {
      toast.error("Proyekt əlavə olunmadı ❌");
    }
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">📁 Proyektlər</h1>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
              + Yeni Proyekt
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg w-[350px]">
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

      {projects.length === 0 ? (
        <p className="text-gray-500 text-sm">Heç bir proyekt tapılmadı.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">Kod: {p.key}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
