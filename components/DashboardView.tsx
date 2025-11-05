"use client";
import { useEffect, useState } from "react";
import ProjectList from "@/components/views/ProjectList";
import SprintList from "@/components/views/SprintList";
import TaskBoard from "@/components/views/TaskBoard";
import UserList from "@/components/views/UserList";
import StatisticsPage from "@/components/views/StatisticsPage";
import CompanyList from "./views/CompanyList";
import DepartmentPage from "@/app/dashboard/departments/page";
import RehberGroupsPage from "@/app/dashboard/rehber-groups/page";

export default function DashboardView({ view }: { view: string }) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-20 text-lg">
        Yüklənir...
      </div>
    );
  }

  // 👤 User yalnız "tasks" bölməsini görə bilər
  if (role !== "ADMIN" && view !== "tasks") {
    return (
      <div className="text-center text-gray-600 py-20 text-lg">
        🔒 Bu bölməni görmək üçün icazəniz yoxdur.
      </div>
    );
  }

  // 👑 Admin bütün bölmələri görə bilər
  switch (view) {
    case "projects":
      return <ProjectList />;
    case "sprints":
      return <SprintList />;
    case "tasks":
      return <TaskBoard />;
    case "users":
      return <UserList />;
    case "statistics":
      return <StatisticsPage />;
    case "companies":
      return <CompanyList />;
    case "departments":
      return <DepartmentPage />;
    case "rehberGroups":
      return <RehberGroupsPage />;
    default:
      return (
        <div className="text-center text-gray-600 py-20">
          Seçilmiş bölmə tapılmadı.
        </div>
      );
  }
}
