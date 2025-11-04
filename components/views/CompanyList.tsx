"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

export default function CompanyList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const dropRef = useRef<HTMLDivElement>(null);

  async function loadCompanies() {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data.companies || []);
  }

  async function addCompany(e: any) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    if (logo) formData.append("logo", logo);

    const res = await fetch("/api/companies", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Şirkət əlavə olundu ✅");
      setName("");
      setLogo(null);
      setLogoPreview(null);
      loadCompanies();
    } else toast.error(data.error || "Xəta baş verdi");
  }

  async function deleteCompany(id: string) {
    const res = await fetch(`/api/companies?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Şirkət silindi 🗑️");
      loadCompanies();
      setConfirmDelete(null);
    } else toast.error("Silmə alınmadı");
  }

  async function updateCompany() {
    const formData = new FormData();
    formData.append("id", editing.id);
    formData.append("name", editing.name);
    if (editing.logoFile) formData.append("logo", editing.logoFile);

    const res = await fetch("/api/companies", {
      method: "PATCH",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Şirkət yeniləndi ✏️");
      setEditing(null);
      loadCompanies();
    } else toast.error(data.error || "Yeniləmə alınmadı");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Şəkil uğurla əlavə olundu ✅");
    } else {
      toast.error("Yalnız şəkil faylı seçin!");
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🏢 Şirkətlər</h1>

      {/* Yeni şirkət formu (vertical layout) */}
      <form onSubmit={addCompany} className="mb-8 flex flex-col gap-4 max-w-md">
        {/* Şirkət adı */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni şirkət adı..."
          className="border border-gray-300 p-2 rounded-md w-full outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Drag & Drop zonası inputun altında */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-md p-5 flex flex-col items-center justify-center cursor-pointer text-center text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
        >
          <Upload size={22} className="mb-2" />
          <span className="text-sm font-medium">Drag & drop və ya kliklə loqo seç</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogo(file);
                setLogoPreview(URL.createObjectURL(file));
              }
            }}
            className="hidden"
          />
        </div>

        {/* Seçilmiş loqo burada göstərilir */}
        {logoPreview && (
          <div className="flex flex-col items-start mt-1">
            <p className="text-sm text-gray-600 mb-2">Seçilən loqo:</p>
           <Image
                src={logoPreview}
                alt="preview"
                width={90}
                height={90}
                className="rounded-md border transition-transform duration-300 hover:scale-110 hover:shadow-md"
                />

          </div>
        )}

        {/* Əlavə et düyməsi */}
        <button
          type="submit"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md transition self-start"
        >
          Əlavə et
        </button>
      </form>

      {/* Şirkət siyahısı */}
      <div className="border rounded-md shadow-sm bg-white">
        {companies.length > 0 ? (
          <ul>
            {companies.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center p-3 border-b last:border-none hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  {c.logo && (
                    <div className="relative group">
                    <Image
                        src={c.logo}
                        alt={c.name}
                        width={40}
                        height={40}
                        className="rounded-md border transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                        {c.name}
                    </span>
                    </div>


                  )}
                  <span className="font-medium text-gray-700">{c.name}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(c)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Düzəlt
                  </button>
                  <button
                    onClick={() => setConfirmDelete(c)}
                    className="text-red-500 hover:underline text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 p-4">
            Heç bir şirkət əlavə edilməyib.
          </p>
        )}
      </div>

      {/* ✏️ Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white p-6 rounded-2xl shadow-xl w-[400px]"
            >
              <h2 className="text-lg font-semibold mb-4">✏️ Şirkəti redaktə et</h2>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="border border-gray-300 p-2 rounded-md w-full outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md border border-blue-300 transition mb-4">
                <Upload size={18} />
                <span>Yeni loqo yüklə</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      logoFile: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
              </label>

              {editing.logo && !editing.logoFile && (
                <Image
                  src={editing.logo}
                  alt="current logo"
                  width={80}
                  height={80}
                  className="rounded-md border mb-4"
                />
              )}

              {editing.logoFile && (
                <Image
                  src={URL.createObjectURL(editing.logoFile)}
                  alt="new logo"
                  width={80}
                  height={80}
                  className="rounded-md border mb-4"
                />
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                >
                  Ləğv et
                </button>
                <button
                  onClick={updateCompany}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  Saxla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🗑️ Silmə təsdiq modalı */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg text-center w-[380px]"
            >
              <Trash2 className="text-red-500 w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                {confirmDelete.name} şirkətini silmək istədiyinə əminsən?
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Bu əməliyyatı geri qaytarmaq mümkün deyil.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                >
                  Ləğv et
                </button>
                <button
                  onClick={() => deleteCompany(confirmDelete.id)}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
