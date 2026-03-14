import Link from "next/link";
import { ArrowRight, Book } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Book className="w-16 h-16 text-[#111827] mb-8" />
        <h1 className="text-4xl md:text-6xl font-serif text-[#111827] mb-6 font-playfair tracking-tight">
          Your Digital Moleskine.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg font-light">
          An automated personal diary that syncs your life seamlessly via Telegram. Minimalist, secure, and always with you.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-full font-medium tracking-wide hover:bg-gray-800 transition-colors shadow-sm"
        >
          Open Journal <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <footer className="py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} ZenStream
      </footer>
    </div>
  );
}
