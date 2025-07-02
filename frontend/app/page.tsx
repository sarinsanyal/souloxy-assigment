"use client"; 
import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4">
        Welcome to Therapist User Messaging System
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-xl text-lg mb-10">
        Emotional Self-Care, One Conversation at a Time. Connect securely with your assigned therapist.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium cursor-pointer"
        >
          Log In
        </button>
        <button
          onClick={() => router.push("/register")}
          className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition font-medium cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
