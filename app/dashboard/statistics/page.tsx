"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/statistics");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Statistika alınmadı:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Yüklənir...
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-400 text-lg">
        Məlumat tapılmadı 📭
      </div>
    );
  }

  const pieData = [
    { name: "Todo", value: stats.todo || 0, color: "#f59e0b" },
    { name: "In Progress", value: stats.inProgress || 0, color: "#3b82f6" },
    { name: "Done", value: stats.done || 0, color: "#10b981" },
  ];

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8 text-indigo-600">
        📊 Statistika Paneli
      </h1>

      {/* Ümumi göstəricilər */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<ClipboardList />}
          title="Todo"
          color="yellow"
          value={stats.todo}
        />
        <StatCard
          icon={<Clock />}
          title="In Progress"
          color="blue"
          value={stats.inProgress}
        />
        <StatCard
          icon={<CheckCircle />}
          title="Done"
          color="green"
          value={stats.done}
        />
      </div>

      {/* Günlük və həftəlik məlumatlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <ExtraCard
          icon={<Calendar />}
          title="Bugün yaradılan"
          color="purple"
          value={stats.todayCreated || 0}
        />
        <ExtraCard
          icon={<TrendingUp />}
          title="Bu həftə yaradılan"
          color="pink"
          value={stats.weekCreated || 0}
        />
        <ExtraCard
          icon={<CheckCircle />}
          title="Bu həftə tamamlanan"
          color="emerald"
          value={stats.weekDone || 0}
        />
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Tapşırıqların statusa görə paylanması
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => {
                  const safeValue = typeof value === "number" ? value : 0;
                  const total = pieData.reduce(
                    (sum, entry) => sum + entry.value,
                    0
                  );
                  const percent =
                    total > 0 ? ((safeValue / total) * 100).toFixed(0) : "0";
                  return `${name}: ${percent}%`;
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable kart komponentləri */
function StatCard({ icon, title, color, value }: any) {
  const colors: any = {
    yellow: "bg-yellow-50 border-yellow-400 text-yellow-600",
    blue: "bg-blue-50 border-blue-500 text-blue-600",
    green: "bg-green-50 border-green-500 text-green-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`border-l-4 p-6 rounded-xl shadow ${colors[color]}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}

function ExtraCard({ icon, title, color, value }: any) {
  const colors: any = {
    purple: "bg-purple-50 border-purple-400 text-purple-600",
    pink: "bg-pink-50 border-pink-400 text-pink-600",
    emerald: "bg-emerald-50 border-emerald-400 text-emerald-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`border-l-4 p-6 rounded-xl shadow ${colors[color]}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}
