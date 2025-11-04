"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 🔹 Şirkət və şöbələri yüklə
  async function loadData() {
    try {
      const [companiesRes, departmentsRes] = await Promise.all([
        fetch("/api/companies"),
        fetch("/api/departments"),
      ]);

      const companiesData = await companiesRes.json();
      const departmentsData = await departmentsRes.json();

      setCompanies(companiesData.companies || []);
      setDepartments(departmentsData.departments || []);
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

    if (!name || !companyId) {
      toast.error("Şöbə adı və şirkət seçin ❗");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // EDIT
        const res = await fetch(`/api/departments?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyId }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Yeniləmə xətası");
        } else {
          toast.success("Şöbə yeniləndi ✅");
          // siyahını lokal yenilə
          setDepartments((prev) =>
            prev.map((d) => (d.id === editingId ? data.department : d))
          );
          // formu sıfırla
          setEditingId(null);
          setName("");
          setCompanyId("");
        }
      } else {
        // CREATE
        const res = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyId }),
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Yaratmaq mümkün olmadı");
        } else {
          toast.success("Şöbə əlavə olundu ✅");
          setDepartments((prev) => [...prev, data.department]);
          setName("");
          setCompanyId("");
        }
      }
    } catch {
      toast.error("Serverə qoşulmaq mümkün olmadı ❌");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Redaktə düyməsi
  function startEdit(dep: any) {
    setEditingId(dep.id);
    setName(dep.name);
    setCompanyId(dep.companyId);
  }

  // 🔹 Silmə axını (modal)
  function askDelete(id: string) {
    setDeleteId(id);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/departments?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Silmək mümkün olmadı");
      } else {
        toast.success("Şöbə silindi ✅");
        setDepartments((prev) => prev.filter((d) => d.id !== deleteId));
      }
    } catch {
      toast.error("Serverə qoşulmaq mümkün olmadı ❌");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">🏢 Şöbələrin idarə olunması</h1>

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
      {editingId ? "📝 Redaktə rejimindəsiniz" : "🆕 Yeni şöbə əlavə et"}
    </h2>

    <input
      type="text"
      placeholder="Şöbə adı..."
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
    />

    <select
      value={companyId}
      onChange={(e) => setCompanyId(e.target.value)}
      className="border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">Şirkət seç</option>
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
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
            setCompanyId("");
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
        <h2 className="text-lg font-semibold mb-4">📋 Mövcud şöbələr</h2>

        {departments.length === 0 ? (
          <p className="text-gray-500">Hələ şöbə əlavə olunmayıb.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">#</th>
                <th className="p-2">Şöbə adı</th>
                <th className="p-2">Şirkət</th>
                <th className="p-2 text-center">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, i) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{d.name}</td>
                  <td className="p-2 text-gray-600">{d.company?.name || "-"}</td>
                  <td className="p-2 flex justify-center gap-3">
                    <button
                      onClick={() => startEdit(d)}
                      className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm font-medium transition"
                    >
                      Redaktə
                    </button>
                    <button
                      onClick={() => askDelete(d.id)}
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
            <p className="text-gray-600 mb-6">Bu şöbə silinəcək. Əminsiniz?</p>
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
