"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X, Plus, Clock, Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";

export default function SprintDetailModal({ sprint, token, onClose }: any) {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sprint?.id) return;
    async function loadIssues() {
      try {
        const res = await fetch(`/api/issues?sprintId=${sprint.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setIssues(data.issues || []);
      } catch {
        toast.error("Tapşırıqlar yüklənmədi ❌");
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, [sprint]);

  if (!sprint) return null;

  return (
    <Dialog.Root open={!!sprint} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] overflow-y-auto border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              🏃 {sprint.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Sprint info */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
            <p className="text-gray-700 mb-2">
              <b>Layihə:</b> {sprint.project?.name ?? "—"}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Başlama tarixi:</b>{" "}
              {new Date(sprint.startDate).toLocaleDateString("az-AZ")}
            </p>
            <p className="text-gray-700 mb-2">
              <b>Bitmə tarixi:</b>{" "}
              {new Date(sprint.endDate).toLocaleDateString("az-AZ")}
            </p>
            <div className="mt-3 flex gap-2">
              <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
                <Edit className="w-4 h-4" /> Düzəlt
              </button>
              <button className="flex items-center gap-1 text-red-600 text-sm font-medium hover:underline">
                <Trash className="w-4 h-4" /> Sil
              </button>
            </div>
          </div>

          {/* Issues list */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
              🧩 Tapşırıqlar
              <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
                <Plus className="w-4 h-4" /> Əlavə et
              </button>
            </h3>

            {loading ? (
              <p className="text-gray-400 text-sm">Yüklənir...</p>
            ) : issues.length === 0 ? (
              <p className="text-gray-400 text-sm">Bu sprintdə tapşırıq yoxdur.</p>
            ) : (
              <ul className="space-y-2">
                {issues.map((i) => (
                  <li
                    key={i.id}
                    className="border border-gray-100 bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{i.title}</p>
                      <p className="text-xs text-gray-500">
                        {i.priority} • {i.status}
                      </p>
                    </div>
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() =>
                        toast(`Task: ${i.title}`, { icon: "📋" })
                      }
                    >
                      Bax
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
