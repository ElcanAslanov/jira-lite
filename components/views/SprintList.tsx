import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SprintList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
  projectId: "",
  name: "",
  startDate: "",
  endDate: "",
});


  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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


  const filteredSprints = selectedProject
    ? sprints.filter((s) => s.projectId === selectedProject)
    : sprints;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">🏃 Sprintlər</h1>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
              + Yeni Sprint
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg w-[350px]">
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
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
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

      {filteredSprints.length === 0 ? (
        <p className="text-gray-500 text-sm">Sprint tapılmadı.</p>
      ) : (
        <ul className="space-y-3">
          {filteredSprints.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-500">
                Status: {s.status} • {s.project?.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
