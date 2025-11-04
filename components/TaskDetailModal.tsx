"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { X, Pencil, Printer, Clock, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function TaskDetailModal({ issue, token, onClose }: any) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(issue?.comments ?? []);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(issue?.status ?? "TODO");
  const [priority, setPriority] = useState(issue?.priority ?? "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(issue?.assigneeId || "");
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

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
    if (token) loadUsers();
  }, [token]);

  useEffect(() => {
    async function loadComments() {
      if (!issue?.id) return;
      const res = await fetch(`/api/comments?issueId=${issue.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setComments(data.comments || []);
    }
    loadComments();
  }, [issue, token]);

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
        assigneeId: assigneeId || null,
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

  function handlePrint() {
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;

    const createdAt = issue?.createdAt
      ? new Date(issue.createdAt).toLocaleString("az-AZ")
      : "—";
    const dueDate = issue?.dueDate
      ? new Date(issue.dueDate).toLocaleString("az-AZ")
      : "—";

    win.document.write(`
      <html>
        <head>
          <title>${issue?.title || "Tapşırıq"}</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #222; }
            h1 { text-align: center; font-size: 24px; color: #333; margin-bottom: 10px; }
            .divider { border-top: 2px solid #007bff; margin: 10px 0 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #555; display:inline-block; width:160px; }
            .value { color:#222; }
            .comment { background:#f8f9fa; padding:10px; border-radius:6px; margin-bottom:8px; }
            footer { text-align:center; font-size:12px; color:#777; margin-top:30px; }
            a { color:#007bff; text-decoration:none; }
          </style>
        </head>
        <body>
          <h1>${issue?.title || "Tapşırıq hesabatı"}</h1>
          <div class="divider"></div>
          <div class="section">
            <div><span class="label">Açıqlama:</span><span class="value">${issue?.description || "—"}</span></div>
            <div><span class="label">Status:</span><span class="value">${status}</span></div>
            <div><span class="label">Prioritet:</span><span class="value">${priority}</span></div>
            <div><span class="label">Layihə:</span><span class="value">${issue?.project?.name || "—"}</span></div>
            <div><span class="label">Təyin edilən:</span><span class="value">${issue?.assignee?.name || "—"}</span></div>
            <div><span class="label">Bitmə tarixi:</span><span class="value">${dueDate}</span></div>
            <div><span class="label">Əlavə sənəd:</span><span class="value">${
              issue?.attachment
                ? `<a href="${issue.attachment}" target="_blank">${issue.attachment.split("/").pop()}</a>`
                : "—"
            }</span></div>
            <div><span class="label">Yaradılma tarixi:</span><span class="value">${createdAt}</span></div>
          </div>
          ${
            comments?.length
              ? `<h3>💬 Şərhlər</h3>` +
                comments
                  .map(
                    (c: any) =>
                      `<div class="comment"><b>${
                        c.author?.name || "İstifadəçi"
                      }:</b> ${c.body}</div>`
                  )
                  .join("")
              : `<p><i>Şərh yoxdur.</i></p>`
          }
          <footer>© ${new Date().getFullYear()} Task Management System</footer>
          <script>window.onload=()=>{window.print();window.close();}</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <Dialog.Root open={!!issue} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] overflow-y-auto border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              🧾 {issue?.title ?? "Tapşırıq"}
            </Dialog.Title>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                title="Çap et"
              >
                <Printer className="w-4 h-4" />
              </button>
              <Dialog.Close asChild>
                <button className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Məlumat hissəsi */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 shadow-sm">
            <p className="text-gray-700 leading-relaxed mb-3">
              {issue?.description ?? (
                <span className="text-gray-400 italic">
                  Açıqlama mövcud deyil.
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <b>Status:</b>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    status === "DONE"
                      ? "bg-green-100 text-green-700"
                      : status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div>
                <b>Prioritet:</b>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    priority === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : priority === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : priority === "LOW"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {priority}
                </span>
              </div>
              <div>
                <b>Layihə:</b> {issue?.project?.name ?? "—"}
              </div>
              <div>
                <b>Təyin edilən:</b>{" "}
                {issue?.assignee?.name || issue?.assignee?.email || "—"}
              </div>

              {/* 🕓 Bitmə tarixi */}
              <div className="flex items-center gap-1 col-span-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <b>Bitmə tarixi:</b>{" "}
                {issue?.dueDate
                  ? new Date(issue.dueDate).toLocaleString("az-AZ")
                  : "—"}
              </div>

              
{/* 📎 Əlavə sənəd */}
<div className="flex items-center gap-1 col-span-2">
  <LinkIcon className="w-4 h-4 text-gray-500" />
  <b>Əlavə sənəd:</b>{" "}
  {issue?.attachment ? (
    <div className="flex items-center gap-3">
      {/* Fayl adı */}
      <a
        href={issue.attachment}
        target="_blank"
        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
      >
        {issue.attachment.split("/").pop()}
      </a>

      {/* Yükləmə düyməsi */}
      <button
        onClick={() => {
          const link = document.createElement("a");
          link.href = issue.attachment!;
          link.download = issue.attachment.split("/").pop()!;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-all active:scale-95 shadow-sm"
        title="Faylı yüklə"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Yüklə
      </button>
    </div>
  ) : (
    <span className="text-gray-400 italic">—</span>
  )}
</div>


            </div>
          </div>

          {/* Şərhlər */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">💬 Şərhlər</h3>
            {comments.length ? (
              <div className="space-y-2 mb-3">
                {comments.map((c: any) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                  >
                    <p className="text-gray-800 text-sm">{c.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {c.author?.name || "Naməlum istifadəçi"} •{" "}
                      {new Date(c.createdAt).toLocaleString("az-AZ")}
                    </p>
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
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <button
                onClick={async () => {
                  if (!comment.trim())
                    return toast.error("Boş şərh göndərilə bilməz!");
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
                    setComments((p: any) => [...p, data.comment]);
                    setComment("");
                    toast.success("Şərh əlavə olundu ✅");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
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
