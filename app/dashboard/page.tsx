import { fetchGroupedEntries } from '@/lib/supabase/queries';
import Timeline from '@/components/diary/timeline';
import { PenSquare } from 'lucide-react';

export default async function DashboardPage() {
    const initialGroupedEntries = await fetchGroupedEntries();

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center">
            <header className="w-full bg-white border-b border-[#E5E7EB] py-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <h1 className="font-playfair text-xl md:text-2xl font-bold text-[#111827]">
                    ZenStream
                </h1>
                <nav className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] hover:bg-gray-100 text-[#111827] text-sm font-medium rounded-full border border-[#E5E7EB] transition-colors">
                        <PenSquare size={16} /> New Entry
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 border border-[#E5E7EB] shadow-sm"></div>
                </nav>
            </header>

            <main className="w-full flex-grow pt-8">
                <Timeline initialGroupedEntries={initialGroupedEntries} />
            </main>
        </div>
    );
}
