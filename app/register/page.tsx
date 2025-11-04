// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       router.push("/dashboard"); // artıq login olubsa dashboard-a keç
//     }
//   }, [router]);

//   async function handleRegister(e: any) {
//     e.preventDefault();

//     const res = await fetch("/api/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });

//     const data = await res.json();

//     if (res.ok) {
//       toast.success("Qeydiyyat uğurludur ✅");
//       router.push("/login");
//     } else {
//       toast.error(data.error || "Xəta baş verdi ❌");
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
//       <div className="bg-white p-8 rounded-2xl shadow-md w-[380px]">
//         <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
//           Jira Lite Qeydiyyat
//         </h1>

//         <form onSubmit={handleRegister} className="flex flex-col gap-4">
//           <input
//             type="text"
//             placeholder="Ad"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />

//           <input
//             type="email"
//             placeholder="E-mail"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />

//           <input
//             type="password"
//             placeholder="Şifrə"
//             value={form.password}
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//             className="border p-2 rounded"
//             required
//           />

//           <button
//             type="submit"
//             className="bg-blue-600 text-white rounded py-2 hover:bg-blue-700 transition"
//           >
//             Qeydiyyatdan keç
//           </button>
//         </form>

//         <p className="text-sm text-gray-500 text-center mt-3">
//           Artıq hesabın var?{" "}
//           <a href="/login" className="text-blue-600 hover:underline">
//             Daxil ol
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }
