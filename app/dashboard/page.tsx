import { fetchGroupedEntries } from '@/lib/supabase/queries';
import Timeline from '@/components/diary/timeline';
import { PenSquare, LogOut, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import LogoutButton from '@/components/auth/logout-button';

export default async function DashboardPage() {
    const initialGroupedEntries = await fetchGroupedEntries();
    const currentDate = format(new Date(), 'dd-MM-yyyy');

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center">
            <header className="w-full bg-white border-b border-[#E5E7EB] py-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <h1 className="font-playfair text-xl md:text-2xl font-bold text-[#111827]">
                        Vaigunaraja - Personal dairy
                    </h1>
                    <span className="text-xs text-gray-400 font-mono tracking-widest mt-0.5">
                        {currentDate}
                    </span>
                </div>
                <nav className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] hover:bg-gray-100 text-[#111827] text-sm font-medium rounded-full border border-[#E5E7EB] transition-colors">
                        <PenSquare size={16} /> New Entry
                    </button>
                    <LogoutButton />
                </nav>
            </header>

            <main className="w-full flex-grow pt-8">
                <Timeline initialGroupedEntries={initialGroupedEntries} />
            </main>
        </div>
    );
}
