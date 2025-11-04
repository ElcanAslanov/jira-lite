"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  ClipboardList,
  Loader2,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("📊 FRONT DATA:", data);
        setStats(data);
      } catch (err) {
        console.error("❌ Statistika alınmadı:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );

  if (!stats)
    return (
      <p className="text-center text-gray-500 text-lg mt-10">
        Məlumat tapılmadı 📭
      </p>
    );

  // 🔹 Kart məlumatları
  const cards = [
    {
      label: "Ümumi tapşırıqlar",
      value: stats.total ?? 0,
      icon: <ClipboardList className="text-blue-500 w-7 h-7" />,
      color: "bg-blue-50",
    },
    {
      label: "Gözləyən (To Do)",
      value: stats.todo ?? 0,
      icon: <Clock className="text-yellow-500 w-7 h-7" />,
      color: "bg-yellow-50",
    },
    {
      label: "İcrada (In Progress)",
      value: stats.inProgress ?? 0,
      icon: <Loader2 className="text-purple-500 w-7 h-7" />,
      color: "bg-purple-50",
    },
    {
      label: "Bitmiş (Done)",
      value: stats.done ?? 0,
      icon: <CheckCircle className="text-green-500 w-7 h-7" />,
      color: "bg-green-50",
    },
    {
      label: "Bugün yaradılan",
      value: stats.todayCreated ?? 0,
      icon: <Calendar className="text-indigo-500 w-7 h-7" />,
      color: "bg-indigo-50",
    },
    {
      label: "Bu həftə yaradılan",
      value: stats.weekCreated ?? 0,
      icon: <TrendingUp className="text-pink-500 w-7 h-7" />,
      color: "bg-pink-50",
    },
    {
      label: "Bu həftə tamamlanan",
      value: stats.weekDone ?? 0,
      icon: <CheckCircle className="text-emerald-500 w-7 h-7" />,
      color: "bg-emerald-50",
    },
  ];

  // 🔹 Pie Chart məlumatı
  const pieData = [
    { name: "To Do", value: stats.todo ?? 0, color: "#FACC15" },
    { name: "In Progress", value: stats.inProgress ?? 0, color: "#A855F7" },
    { name: "Done", value: stats.done ?? 0, color: "#22C55E" },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📊 Ümumi Statistika Paneli
      </h1>

      {/* 🟦 Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-2xl shadow-md ${card.color} border-l-4 border-white/60 hover:border-blue-400 transition-transform`}
          >
            <div className="flex items-center justify-between mb-3">
              {card.icon}
              <span className="text-3xl font-bold text-gray-800">
                {card.value}
              </span>
            </div>
            <p className="text-sm text-gray-700 font-medium">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* 🟣 Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
          Tapşırıqların statusa görə paylanması
        </h2>

        <div className="w-full h-80 flex justify-center">
          <ResponsiveContainer width="80%" height="100%">
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
      </motion.div>
    </div>
  );
}
