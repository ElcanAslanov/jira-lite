"use client";
import ProjectList from "@/components/views/ProjectList";
import SprintList from "@/components/views/SprintList";
import TaskBoard from "@/components/views/TaskBoard";
import UserList from "@/components/views/UserList";
import StatisticsPage from "@/components/views/StatisticsPage"; // ✅ düzəltdik
import CompanyList from "./views/CompanyList";
import DepartmentPage from "@/app/dashboard/departments/page";
import RehberGroupsPage from "@/app/dashboard/rehber-groups/page";


export default function DashboardView({ view }: any) {
  switch (view) {
    case "projects":
      return <ProjectList />;
    case "sprints":
      return <SprintList />;
    case "tasks":
      return <TaskBoard />;
    case "users":
      return <UserList />;
    case "statistics": // ✅ Statistik səhifə əlavə olundu
      return <StatisticsPage />;
      case "companies":
    return <CompanyList />;
      case "departments":
    return <DepartmentPage />;
    case "rehberGroups":
  return <RehberGroupsPage />;




    default:
      return <p>Seçilmiş bölmə tapılmadı.</p>;
  }
}
