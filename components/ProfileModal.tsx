"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfileModal() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setForm({ name: data.user.name || "", email: data.user.email, password: "" });
      } else toast.error(data.error || "Profil yüklənmədi ❌");
    } catch {
      toast.error("Server xətası ❌");
    }
  }

  async function handleSave(e: any) {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profil yeniləndi ✅");
        setOpen(false);
        loadProfile();
      } else toast.error(data.error || "Yeniləmə xətası");
    } catch {
      toast.error("Server xətası ❌");
    }
  }

  useEffect(() => {
    if (open) loadProfile();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="text-blue-600 hover:underline font-medium">
          Profilim
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[400px]">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Profil məlumatları
          </Dialog.Title>

          {profile ? (
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ad"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Yeni şifrə (istəyə bağlı)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border p-2 rounded"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Yadda saxla
              </button>
            </form>
          ) : (
            <p>Yüklənir...</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
