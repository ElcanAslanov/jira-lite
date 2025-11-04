"use client";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [loading, setLoading] = useState(false);
  const [rehberFilter, setRehberFilter] = useState("ALL");


  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🔹 İstifadəçiləri və şöbələri yüklə
  async function loadData() {
    try {
      const [userRes, depRes] = await Promise.all([
        fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/departments"),
      ]);
      const userData = await userRes.json();
      const depData = await depRes.json();

      setUsers(userData.users || []);
      setFilteredUsers(userData.users || []);
      setDepartments(depData.departments || []);
    } catch {
      toast.error("Məlumat yüklənmədi ❌");
    }
  }

  // 🔹 Modal açmaq
  function openCreateModal() {
    setEditUser({
      name: "",
      email: "",
      phone: "",
      password: "",
      departmentId: "",
      rehberId: "",
      role: "USER",
    });
    setMode("create");
    setModalOpen(true);
  }

  function openEditModal(u: any) {
    setEditUser({
      ...u,
      password: "",
      rehberId: u.rehberId || "",
    });
    setMode("edit");
    setModalOpen(true);
  }

  // 🔹 Əlavə / Redaktə əməliyyatı
  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch("/api/users", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editUser),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success(
        mode === "create"
          ? "Yeni istifadəçi əlavə olundu ✅"
          : "İstifadəçi yeniləndi ✅"
      );
      setModalOpen(false);
      loadData();
    } else toast.error(data.error || "Əməliyyat zamanı xəta ❌");

    setLoading(false);
  }

  // 🔹 Silmək
  async function handleDelete(id: string) {
    if (!confirm("Bu istifadəçini silmək istədiyinizə əminsiniz?")) return;
    const res = await fetch(`/api/users?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("İstifadəçi silindi 🗑️");
      loadData();
    } else toast.error(data.error || "Silinmə xətası ❌");
  }

  // 🔍 Axtarış və filtr
useEffect(() => {
  let filtered = users;

  // 🔍 Ad və email üzrə axtarış
  if (search.trim() !== "") {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name?.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    );
  }

  // 🎭 Rol filteri
  if (roleFilter !== "ALL") {
    filtered = filtered.filter((u) => u.role === roleFilter);
  }

  // 👔 Rəhbər filteri
  if (rehberFilter !== "ALL") {
    filtered = filtered.filter((u) => u.rehberId === rehberFilter);
  }

  setFilteredUsers(filtered);
}, [search, roleFilter, rehberFilter, users]);


  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Yalnız rəhbərləri ayırırıq (işçi üçün dropdownda lazım olacaq)
  const rehbers = users.filter((u) => u.role === "REHBER");

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">👥 İstifadəçilər</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          ➕ Yeni istifadəçi
        </button>
      </div>

      {/* 🔍 Filtrlər */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Ad və ya email ilə axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 flex-1"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border rounded p-2 w-40"
        >
          <option value="ALL">Bütün rollar</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">İstifadəçi</option>
          <option value="REHBER">Rəhbər</option>
          <option value="ISCI">İşçi</option>
        </select>

        <select
          value={rehberFilter}
          onChange={(e) => setRehberFilter(e.target.value)}
          className="border rounded p-2 w-52"
        >
          <option value="ALL">Bütün rəhbərlər</option>
          {rehbers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || r.email}
            </option>
          ))}
        </select>


        <button
          onClick={() => {
            setSearch("");
            setRoleFilter("ALL");
            setRehberFilter("ALL");
          }}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
        >
          🔄 Sıfırla
        </button>

      </div>

      {/* 🧾 Cədvəl */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b bg-gray-50">
            <th className="py-2 px-3">Ad</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Mobil</th>
            <th className="py-2 px-3">Rol</th>
            <th className="py-2 px-3">Rəhbər</th>
            <th className="py-2 px-3">Şöbə</th>
            <th className="py-2 px-3">Son daxil olma</th>
            <th className="py-2 px-3 text-right">Əməliyyatlar</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{u.name || "—"}</td>
              <td className="py-2 px-3">{u.email}</td>
              <td className="py-2 px-3">{u.phone || "—"}</td>
              <td className="py-2 px-3">{u.role}</td>
              <td className="py-2 px-3">{u.rehber?.name || "—"}</td>
              <td className="py-2 px-3">{u.department?.name || "—"}</td>
              <td className="py-2 px-3 text-sm text-gray-600">
                {u.lastLogin
                  ? formatDistanceToNow(new Date(u.lastLogin), {
                      addSuffix: true,
                      locale: az,
                    })
                  : "—"}
              </td>
              <td className="py-2 px-3 flex gap-2 justify-end">
                <button
                  onClick={() => openEditModal(u)}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  ✏️ Redaktə et
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  🗑️ Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🧩 Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <Dialog.Title className="text-lg font-semibold mb-3">
              {mode === "create"
                ? "➕ Yeni istifadəçi əlavə et"
                : "✏️ İstifadəçini redaktə et"}
            </Dialog.Title>

            {editUser && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={editUser.name || ""}
                  onChange={(e) =>
                    setEditUser((f: any) => ({ ...f, name: e.target.value }))
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser((f: any) => ({ ...f, email: e.target.value }))
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Mobil nömrə"
                  value={editUser.phone || ""}
                  onChange={(e) =>
                    setEditUser((f: any) => ({ ...f, phone: e.target.value }))
                  }
                  className="border p-2 rounded"
                />
                <select
                  value={editUser.departmentId || ""}
                  onChange={(e) =>
                    setEditUser((f: any) => ({
                      ...f,
                      departmentId: e.target.value,
                    }))
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Şöbə seç</option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>

                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser((f: any) => ({
                      ...f,
                      role: e.target.value,
                      rehberId: "",
                    }))
                  }
                  className="border p-2 rounded"
                >
                  <option value="USER">İstifadəçi</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REHBER">Rəhbər</option>
                  <option value="ISCI">İşçi</option>
                </select>

                {/* 🔹 Rəhbər seçimi (artıq hər zaman görünür) */}
                      {rehbers.length > 0 ? (
                        <select
                          value={editUser.rehberId || ""}
                          onChange={(e) =>
                            setEditUser((f: any) => ({
                              ...f,
                              rehberId: e.target.value,
                            }))
                          }
                          className="border p-2 rounded"
                        >
                          <option value="">Rəhbər seç</option>
                          {rehbers.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name || r.email}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-red-600 text-sm">
                          ⚠️ Sistemdə rəhbər yoxdur. Əvvəl rəhbər əlavə edin.
                        </p>
                      )}


                <input
                  type="password"
                  placeholder={
                    mode === "create"
                      ? "Şifrə daxil edin"
                      : "Yeni şifrə (istəyə bağlı)"
                  }
                  value={editUser.password}
                  onChange={(e) =>
                    setEditUser((f: any) => ({
                      ...f,
                      password: e.target.value,
                    }))
                  }
                  className="border p-2 rounded"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    mode === "create"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white px-3 py-2 rounded transition`}
                >
                  {loading
                    ? "Yüklənir..."
                    : mode === "create"
                    ? "Əlavə et"
                    : "Yadda saxla"}
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
