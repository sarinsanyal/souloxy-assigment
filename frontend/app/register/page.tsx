"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");

  const URL = process.env.NEXT_PUBLIC_API_BASE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push('/login');
    } else {
      alert(data.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Sign Up</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
          <option value="PATIENT">Patient</option>
          <option value="THERAPIST">Therapist</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      <p className="flex justify-center items-center">
        Already signed up? <Link href="/login" className="ml-1 text-blue-600 hover:underline">Login</Link>
      </p>
      </form>
    </div>
  );
}
