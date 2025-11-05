"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { X, Printer, Clock, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function TaskDetailModal({ issue, token, onClose, onUpdated }: any) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(issue?.comments ?? []);
  const [status, setStatus] = useState(issue?.status ?? "TODO");
  const [priority, setPriority] = useState(issue?.priority ?? "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(issue?.assigneeId || "");
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [decoded, setDecoded] = useState<any>(null);

  // ✅ Token decode — icazə və user ID tapmaq
  useEffect(() => {
    try {
      const d: any = jwtDecode(token);
      setDecoded(d);
      if (
        d.role === "ADMIN" ||
        d.id === issue?.reporterId ||
        d.id === issue?.assigneeId
      ) {
        setCanEdit(true);
      } else {
        setCanEdit(false);
      }
    } catch {
      console.warn("Token decode edilə bilmədi ❌");
    }
  }, [token, issue]);

  // ✅ Vaxt keçibsə tapşırıq dondurulsun
  useEffect(() => {
    if (issue?.dueDate) {
      setIsExpired(new Date(issue.dueDate) < new Date());
    }
  }, [issue]);

  // ✅ İstifadəçiləri yüklə
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

  // ✅ Şərhləri yüklə
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

  // ✅ Task yenilə və dərhal UI-da göstər
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
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      toast.success("Tapşırıq yeniləndi ✅");
      if (data.updated) {
        issue.status = data.updated.status;
        issue.priority = data.updated.priority;
        setStatus(data.updated.status);
        setPriority(data.updated.priority);
      }
      onUpdated?.(data.updated);
    } else {
      toast.error(data.error || "Tapşırıq yenilənmədi ❌");
    }
  }

 function handlePrint() {
  if (!issue) return;

  const createdAt = issue.createdAt
    ? new Date(issue.createdAt).toLocaleString("az-AZ")
    : "—";
  const dueDate = issue.dueDate
    ? new Date(issue.dueDate).toLocaleString("az-AZ")
    : "—";
  const assignee =
    issue?.assignee?.name || issue?.assignee?.email || "—";
  const project = issue?.project?.name || "—";
  const description =
    issue?.description?.trim() || "Açıqlama mövcud deyil.";

  const printContent = `
    <html>
      <head>
        <title>${issue.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
          h1 { font-size: 24px; color: #1f2937; margin-bottom: 10px; }
          p, td { font-size: 14px; line-height: 1.6; }
          .meta { margin-top: 20px; border-collapse: collapse; width: 100%; }
          .meta td { border: 1px solid #ddd; padding: 8px; }
          .meta tr:nth-child(even) { background-color: #f9f9f9; }
          .meta tr:hover { background-color: #f1f1f1; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          a { color: #2563eb; text-decoration: none; }
          img.logo { height: 40px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
      <img src="/Cahan-logo.jpg" class="logo" alt="Şirkət Loqosu" />

        <h1>🧾 ${issue.title}</h1>
        <p>${description}</p>

        <table class="meta">
          <tr><td><b>Status</b></td><td>${issue.status}</td></tr>
          <tr><td><b>Prioritet</b></td><td>${issue.priority}</td></tr>
          <tr><td><b>Layihə</b></td><td>${project}</td></tr>
          <tr><td><b>Təyin edilən</b></td><td>${assignee}</td></tr>
          <tr><td><b>Yaradılma tarixi</b></td><td>${createdAt}</td></tr>
          <tr><td><b>Bitmə tarixi</b></td><td>${dueDate}</td></tr>
          ${
            issue.attachment
              ? `<tr><td><b>Əlavə sənəd</b></td><td><a href="${issue.attachment}" target="_blank">${issue.attachment
                  .split("/")
                  .pop()}</a></td></tr>`
              : ""
          }
        </table>

        <div class="footer">
          <p>Bu sənəd ${new Date().toLocaleString(
            "az-AZ"
          )} tarixində sistem tərəfindən yaradılmışdır.</p>
          <p>© ${new Date().getFullYear()} Task Manager System</p>
        </div>
      </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=850,height=700");
  if (!win) return;
  win.document.open();
  win.document.write(printContent);
  win.document.close();
  win.print();
}


  return (
    <Dialog.Root open={!!issue} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-2xl w-[520px] max-h-[85vh] overflow-y-auto border border-gray-200">
          {/* Header */}
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
              {issue?.description || (
                <span className="text-gray-400 italic">Açıqlama mövcud deyil.</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* STATUS */}
              <div>
                <b>Status:</b>{" "}
                {canEdit ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={
                      isExpired && decoded?.id === issue?.assigneeId && decoded?.role !== "ADMIN"
                    }
                    className={`border rounded-md px-2 py-1 text-sm bg-white ${
                      isExpired && decoded?.id === issue?.assigneeId
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }`}
                    title={
                      isExpired && decoded?.id === issue?.assigneeId
                        ? "Tapşırığın bitmə vaxtı keçib, dəyişiklik icazəniz yoxdur."
                        : ""
                    }
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                ) : (
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
                )}
              </div>

              {/* PRIORITY */}
              <div>
                <b>Prioritet:</b>{" "}
                {canEdit ? (
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={
                      isExpired && decoded?.id === issue?.assigneeId && decoded?.role !== "ADMIN"
                    }
                    className={`border rounded-md px-2 py-1 text-sm bg-white ${
                      isExpired && decoded?.id === issue?.assigneeId
                        ? "cursor-not-allowed opacity-70"
                        : ""
                    }`}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                ) : (
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
                )}
              </div>

              <div>
                <b>Layihə:</b> {issue?.project?.name ?? "—"}
              </div>
              <div>
                <b>Təyin edilən:</b>{" "}
                {issue?.assignee?.name || issue?.assignee?.email || "—"}
              </div>

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
                    <a
                      href={issue.attachment}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                    >
                      {issue.attachment.split("/").pop()}
                    </a>
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
                      ⬇ Yüklə
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </div>
            </div>

            {/* ✅ Yenilə düyməsi */}
            {canEdit && (
              <button
                onClick={saveChanges}
                disabled={
                  saving || (isExpired && decoded?.id === issue?.assigneeId && decoded?.role !== "ADMIN")
                }
                title={
                  isExpired && decoded?.id === issue?.assigneeId
                    ? "Tapşırığın bitmə vaxtı keçib, dəyişiklik edə bilməzsiniz."
                    : ""
                }
                className={`mt-4 px-4 py-2 rounded-md text-sm font-medium text-white ${
                  saving
                    ? "bg-gray-400"
                    : isExpired && decoded?.id === issue?.assigneeId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 active:scale-95 transition"
                }`}
              >
                {saving ? "Yenilənir..." : "Yenilə ✅"}
              </button>
            )}
          </div>

          {/* 💬 Şərhlər */}
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
