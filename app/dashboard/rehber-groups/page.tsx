"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RehberGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔹 Məlumatları yüklə
  async function loadData() {
    try {
      const [departmentsRes, groupsRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/rehber-groups"),
      ]);

      const depData = await departmentsRes.json();
      const groupData = await groupsRes.json();

      setDepartments(depData.departments || []);
      setGroups(groupData.groups || []);
    } catch {
      toast.error("Məlumat yüklənmədi ❌");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Əlavə və ya redaktə
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !departmentId) {
      toast.error("Qrup adı və şöbə seçin ❗");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/rehber-groups?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, departmentId }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Yeniləmə xətası");
        } else {
          toast.success("Qrup yeniləndi ✅");
          setGroups((prev) =>
            prev.map((g) => (g.id === editingId ? data.group : g))
          );
          setEditingId(null);
          setName("");
          setDepartmentId("");
        }
      } else {
        const res = await fetch("/api/rehber-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, departmentId }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Yaratmaq mümkün olmadı");
        } else {
          toast.success("Qrup əlavə olundu ✅");
          setGroups((prev) => [...prev, data.group]);
          setName("");
          setDepartmentId("");
        }
      }
    } catch {
      toast.error("Serverə qoşulmaq mümkün olmadı ❌");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Redaktə
  function startEdit(group: any) {
    setEditingId(group.id);
    setName(group.name);
    setDepartmentId(group.departmentId);
  }

  // 🔹 Silmə
  function askDelete(id: string) {
    setDeleteId(id);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/rehber-groups?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Silmək mümkün olmadı");
      } else {
        toast.success("Silindi ✅");
        setGroups((prev) => prev.filter((g) => g.id !== deleteId));
      }
    } catch {
      toast.error("Server xətası ❌");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">👥 Rehber Qrupları</h1>

      {/* 🔹 Form */}
      <form
        onSubmit={handleSubmit}
        className={`${
          editingId ? "bg-yellow-50 border border-yellow-300" : "bg-white"
        } p-6 rounded-2xl shadow-md w-full max-w-lg transition-all`}
      >
        <div className="flex flex-col gap-4">
          <h2
            className={`text-lg font-semibold mb-2 ${
              editingId ? "text-yellow-700" : "text-gray-800"
            }`}
          >
            {editingId ? "📝 Redaktə rejimindəsiniz" : "🆕 Yeni qrup əlavə et"}
          </h2>

          <input
            type="text"
            placeholder="Qrup adı..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Şöbə seç</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.company?.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-semibold transition ${
                loading
                  ? "bg-blue-400"
                  : editingId
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Yüklənir..."
                : editingId
                ? "✅ Yenilə"
                : "➕ Əlavə et"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setDepartmentId("");
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
              >
                Ləğv et
              </button>
            )}
          </div>
        </div>
      </form>

      {/* 🔹 Siyahı */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">📋 Mövcud qruplar</h2>

        {groups.length === 0 ? (
          <p className="text-gray-500">Hələ heç bir qrup əlavə olunmayıb.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">#</th>
                <th className="p-2">Qrup adı</th>
                <th className="p-2">Şöbə</th>
                <th className="p-2">Şirkət</th>
                <th className="p-2 text-center">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr key={g.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{g.name}</td>
                  <td className="p-2">{g.department?.name || "-"}</td>
                  <td className="p-2 text-gray-600">
                    {g.department?.company?.name || "-"}
                  </td>
                  <td className="p-2 flex justify-center gap-3">
                    <button
                      onClick={() => startEdit(g)}
                      className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm font-medium transition"
                    >
                      Redaktə
                    </button>
                    <button
                      onClick={() => askDelete(g.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔹 Silmə modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[350px] text-center">
            <h3 className="text-lg font-semibold mb-3">Silinsin?</h3>
            <p className="text-gray-600 mb-6">Bu qrup silinəcək. Əminsiniz?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
              >
                Ləğv et
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Bəli, sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
