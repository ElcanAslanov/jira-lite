"use client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Bug, CheckCircle, ClipboardList, User } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import NewTaskModal from "@/components/NewTaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import NotificationBell from "@/components/NotificationBell";
import toast from "react-hot-toast";

export default function TaskBoard() {
  const [issues, setIssues] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null); // 📊 Statistik məlumat
  const [filters, setFilters] = useState({
    projectId: "",
    sprintId: "",
    assigneeId: "",
  });
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : "USER";
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // 🔹 Taskları gətir
  async function loadIssues() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Tapşırıqlar yüklənmədi");
      const data = await res.json();
      setIssues(data.issues || []);
    } catch {
      toast.error("Tapşırıqlar yüklənərkən xəta baş verdi ❌");
    } finally {
      setLoading(false);
    }
  }

  // // 📊 Dashboard statistikası
  // async function loadStats() {
  //   if (role !== "ADMIN" || !token) return;
  //   try {
  //     const res = await fetch("/api/dashboard", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();
  //     if (res.ok) setStats(data);
  //   } catch {
  //     toast.error("Statistika yüklənmədi ❌");
  //   }
  // }

  // 🔹 Digər məlumatlar (yalnız admin)
  async function loadProjects() {
    if (!token) return;
    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      toast.error("Proyektlər yüklənərkən xəta baş verdi ❌");
    }
  }

  async function loadSprints() {
    if (!token) return;
    try {
      const res = await fetch("/api/sprints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSprints(data.sprints || []);
    } catch {
      toast.error("Sprintlər yüklənərkən xəta baş verdi ❌");
    }
  }

  async function loadUsers() {
    if (!token) return;
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch {
      toast.error("İstifadəçilər yüklənmədi ❌");
    }
  }

  // 🔹 İlk yüklənmə
  useEffect(() => {
    if (token) {
      loadIssues();
      if (role === "ADMIN") {
        loadProjects();
        loadSprints();
        loadUsers();
        // loadStats(); // 📊 statistik məlumatı da yüklə
      }
    } else {
      toast.error("Token tapılmadı. Yenidən daxil olun.");
    }
  }, [token, role]);

  // 🔹 Status dəyişiklikləri (drag & drop)
  async function updateStatus(id: string, status: string) {
    if (!token) return;
    try {
      await fetch("/api/issues", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      await loadIssues();
      // if (role === "ADMIN") loadStats(); // 🔄 status dəyişdikdə statistikanı yenilə
      toast.success("Tapşırıq statusu dəyişdi ✅");
    } catch {
      toast.error("Status dəyişdirilərkən xəta baş verdi ❌");
    }
  }

  function onDragEnd(result: any) {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    updateStatus(draggableId, destination.droppableId);
  }

  // 🔹 Task-ı Notification-dan açmaq
  function handleOpenFromNotification(issueId: string) {
    const issue = issues.find((i) => i.id === issueId);
    if (issue) setSelectedIssue(issue);
    else toast.error("Tapşırıq tapılmadı ❌");
  }

  const columns = ["TODO", "IN_PROGRESS", "DONE"];
  const statusStyles: Record<string, string> = {
    TODO: "border-red-500",
    IN_PROGRESS: "border-yellow-500",
    DONE: "border-green-500",
  };

  // 🔍 Admin bütün tapşırıqları, user isə yalnız özünə aid olanları görür
  const visibleIssues =
    role === "ADMIN"
      ? issues
      : issues.filter(
          (i) =>
            String(i.assigneeId) === String(userId) ||
            String(i.reporterId) === String(userId)
        );

  // 🔍 Filtrləmə (yalnız admin)
  const filteredIssues = visibleIssues.filter((i) => {
    const matchProject = filters.projectId
      ? i.projectId === filters.projectId
      : true;
    const matchSprint = filters.sprintId
      ? i.sprintId === filters.sprintId
      : true;
    const matchAssignee = filters.assigneeId
      ? i.assigneeId === filters.assigneeId
      : true;
    return matchProject && matchSprint && matchAssignee;
  });

  function getIcon(type: string) {
    switch (type) {
      case "BUG":
        return <Bug className="text-red-500 w-4 h-4" />;
      case "STORY":
        return <CheckCircle className="text-green-600 w-4 h-4" />;
      default:
        return <ClipboardList className="text-blue-500 w-4 h-4" />;
    }
  }

  return (
    <div className="p-6">
      {/* Başlıq */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🧩 Jira Lite Board</h1>

        <div className="flex items-center gap-4">
          {/* 🔔 Bildirişlər */}
          <NotificationBell onTaskOpen={handleOpenFromNotification} />

          {/* Yeni task yalnız admin görə bilər */}
          {role === "ADMIN" && (
                    <NewTaskModal
            token={token}
            onCreated={loadIssues}
            className="btn-modern btn-modern-primary"
            />

          )}
        </div>
      </div>

      {/* 📊 Admin statistikası */}
      {role === "ADMIN" && stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold">{stats.total}</h2>
            <p className="text-gray-500 text-sm">Ümumi tapşırıqlar</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-red-600">{stats.todo}</h2>
            <p className="text-gray-500 text-sm">TODO</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-yellow-600">
              {stats.inProgress}
            </h2>
            <p className="text-gray-500 text-sm">In Progress</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow text-center">
            <h2 className="text-xl font-bold text-green-600">{stats.done}</h2>
            <p className="text-gray-500 text-sm">
              Done ({stats.completionRate}%)
            </p>
          </div>
        </div>
      )}

      {/* Admin üçün filtrlər */}
      {role === "ADMIN" && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filters.projectId}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                projectId: e.target.value,
                sprintId: "",
              }))
            }
            className="border p-2 rounded"
          >
            <option value="">Project seç</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          <select
            value={filters.sprintId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sprintId: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">Sprint seç</option>
            {sprints
              .filter(
                (s) => !filters.projectId || s.projectId === filters.projectId
              )
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>

          <select
            value={filters.assigneeId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, assigneeId: e.target.value }))
            }
            className="border p-2 rounded"
          >
            <option value="">Assignee seç</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>

         <button
          onClick={() =>
            setFilters({ projectId: "", sprintId: "", assigneeId: "" })
          }
          className="btn-modern btn-modern-secondary"
        >
          🔄 Sıfırla
        </button>

        </div>
      )}

      {role !== "ADMIN" && (
        <p className="text-gray-500 text-sm mb-4">
          Sizə təyin olunmuş tapşırıqlar aşağıda göstərilib.
        </p>
      )}

      {/* Tapşırıqların board-u */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 p-4 rounded-md shadow-sm min-h-[450px]"
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                  {col === "TODO" && <ClipboardList className="text-red-500 w-4 h-4" />}
                  {col === "IN_PROGRESS" && <Bug className="text-yellow-500 w-4 h-4" />}
                  {col === "DONE" && <CheckCircle className="text-green-600 w-4 h-4" />}
                  {col.replace("_", " ")}
                </h2>


                  {filteredIssues
                    .filter((i) => i.status === col)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={String(issue.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedIssue(issue)}
                        className={`glass p-4 rounded-2xl mb-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer border-l-4 ${statusStyles[issue.status]}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="flex items-center gap-2">
                                {getIcon(issue.type)}
                                <h3 className="font-semibold text-gray-800">
                                  {issue.title}
                                </h3>
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-1">
                              {issue.priority} • {issue.project?.key ?? "—"}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {issue.description || "Açıqlama yoxdur."}
                            </p>

                            <div className="mt-2 flex items-center text-xs text-gray-600 gap-2">
                              <User className="w-3 h-3 text-gray-500" />
                              {issue.assignee ? (
                                <span>
                                  {issue.assignee.name || issue.assignee.email}
                                </span>
                              ) : (
                                <span className="italic text-gray-400">
                                  Təyin olunmayıb
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {selectedIssue && (
        <TaskDetailModal
          issue={selectedIssue}
          token={token}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
