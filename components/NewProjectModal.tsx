"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProjectModal({ token, onCreated }: any) {
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!form.name.trim() || !form.key.trim())
      return toast.error("Layihə adı və açar mütləq doldurulmalıdır!");

    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Yeni layihə yaradıldı ✅");
      setForm({ name: "", key: "", description: "" });
      setOpen(false);
      onCreated?.();
    } else {
      toast.error("Layihə yaradılarkən xəta baş verdi ❌");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Yeni Project
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">
              Yeni Layihə əlavə et
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Layihə adı (məs: CRM sistemi)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border p-2 rounded"
              required
            />

            <input
              type="text"
              placeholder="Layihə açarı (məs: CRM)"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              className="border p-2 rounded uppercase"
              required
            />

            <textarea
              placeholder="Qısa təsvir (ixtiyari)"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
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
