"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { X, Pencil } from "lucide-react";
import toast from "react-hot-toast";

export default function TaskDetailModal({ issue, token, onClose }: any) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(issue?.comments ?? []);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(issue?.status ?? "TODO");
  const [priority, setPriority] = useState(issue?.priority ?? "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(issue?.assigneeId || "");
  const [users, setUsers] = useState<any[]>([]); // ✅ istifadəçilər siyahısı
  const [saving, setSaving] = useState(false);

  // 🔹 İstifadəçiləri gətir (admin və ya user fərqi yoxdur)
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setUsers(data.users || []);
      } catch {
        console.warn("İstifadəçilər yüklənmədi ❌");
      }
    }
    loadUsers();
  }, [token]);

  // Modal daxilində
async function addComment() {
  if (!comment.trim()) return toast.error("Boş şərh göndərilə bilməz!");
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      issueId: issue.id,
      body: comment,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    setComments((prev: any[]) => [...prev, data.comment]); // 🔹 Dərhal göstər
    setComment("");
    toast.success("Şərh əlavə olundu ✅");
  } else {
    toast.error(data.error || "Şərh əlavə edilərkən xəta baş verdi ❌");
  }
}


  async function deleteComment(id: string) {
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) return toast.error("Silinmə uğursuz oldu ❌");

      setComments((prev: any[]) => prev.filter((c: any) => c?.id !== id));
      toast.success("Şərh silindi 🗑️");
    } catch {
      toast.error("Şərh silinərkən xəta baş verdi ❌");
    }
  }

  async function editComment(id: string, oldText: string) {
    const newText = prompt("Yeni mətni daxil et:", oldText);
    if (!newText || newText.trim() === oldText.trim()) return;

    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, body: newText }),
    });

    if (res.ok) {
      const { updated } = await res.json();
      setComments((prev: any[]) =>
        (prev ?? []).map((c) =>
          c?.id === id ? { ...c, body: updated?.body ?? newText } : c
        )
      );
      toast.success("Şərh yeniləndi ✏️");
    } else {
      toast.error("Redaktə zamanı xəta baş verdi ❌");
    }
  }

  // 🔹 Mövcud şərhləri yüklə
async function loadComments() {
  const res = await fetch(`/api/comments?issueId=${issue.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (res.ok) setComments(data.comments || []);
}

useEffect(() => {
  if (issue?.id) loadComments();
}, [issue]);

  async function saveChanges() {
    setSaving(true);
    const res = await fetch("/api/issues", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: issue.id,
        status,
        priority,
        assigneeId: assigneeId || null, // ✅ yeni əlavə
      }),
    });
    setSaving(false);
    if (res.ok) {
      setEditMode(false);
      toast.success("Tapşırıq yeniləndi ✅");
    } else {
      toast.error("Tapşırıq yenilənmədi ❌");
    }
  }

  return (
    <Dialog.Root open={!!issue} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              🧾 {issue?.title ?? "Tapşırıq"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <p className="text-gray-700 mb-3">
            {issue?.description ?? "Açıqlama mövcud deyil."}
          </p>

          {/* 🔧 Redaktə sahəsi */}
          <div className="mb-4 border-t pt-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Detallar</h3>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-3 h-3" /> Düzəlt
                </button>
              )}
            </div>

            {editMode ? (
              <div className="space-y-3">
                {/* STATUS */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                {/* PRIORITY */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                {/* ✅ ASSIGNEE */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">
                    Təyin edilən (Assignee)
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Heç kim</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  {saving ? "Yadda saxlanır..." : "Yadda saxla"}
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <b>Status:</b> {status}
                </p>
                <p>
                  <b>Priority:</b> {priority}
                </p>
                <p>
                  <b>Type:</b> {issue?.type ?? "TASK"}
                </p>
                <p>
                  <b>Project:</b> {issue?.project?.name ?? "—"}
                </p>
                <p>
                  <b>Assignee:</b>{" "}
                  {issue?.assignee?.name || issue?.assignee?.email || "—"}
                </p>
              </div>
            )}
          </div>

          {/* 💬 Şərhlər */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">Şərhlər</h3>

           {comments && comments.length > 0 ? (
              <div className="space-y-2 mb-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-2 bg-gray-50 p-2 rounded border">
                    <div className="bg-blue-100 w-7 h-7 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {c.author?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{c.body}</p>
                      <p className="text-xs text-gray-400">
                        {c.author?.name || c.author?.email || "Naməlum istifadəçi"} •{" "}
                        {new Date(c.createdAt).toLocaleString("az-AZ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editComment(c.id, c.body)}
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-3">Hələ şərh yoxdur.</p>
            )}


            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Şərh yaz..."
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={addComment}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Göndər
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
