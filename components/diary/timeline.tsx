'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import QuickEditModal from './edit-modal';
import { Search } from 'lucide-react';

export default function Timeline({ initialGroupedEntries }: { initialGroupedEntries: Record<string, any[]> }) {
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(initialGroupedEntries);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

    const filteredEntries = useMemo(() => {
        if (!search.trim()) return entries;
        const lowerSearch = search.toLowerCase();

        const filtered: Record<string, any[]> = {};
        Object.keys(entries).forEach(dateGrp => {
            const matched = entries[dateGrp].filter(e =>
                e.content.toLowerCase().includes(lowerSearch) ||
                (e.tags && e.tags.some((tag: string) => tag.toLowerCase().includes(lowerSearch)))
            );
            if (matched.length > 0) {
                filtered[dateGrp] = matched;
            }
        });
        return filtered;
    }, [entries, search]);

    const handleSave = (updatedEntry: any) => {
        // Optimistic UI Update locally
        const newEntries = { ...entries };

        // Simplistic handling: map through all dates, finding entry, and replacing it.
        // If date changed significantly, we would realistically need to regroup. 
        // This assumes they are mostly fixing typos for simplicity.
        Object.keys(newEntries).forEach(dateGrp => {
            newEntries[dateGrp] = newEntries[dateGrp].map(e =>
                e.id === updatedEntry.id ? updatedEntry : e
            );
        });

        setEntries(newEntries);
        // TODO: Queue patch request asynchronously to Supabase
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#111827] p-4 md:p-8">

            {/* Search Input Filter */}
            <div className="max-w-2xl mx-auto mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search journal..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-1 focus:ring-[#111827] shadow-sm transition-all text-sm font-medium"
                />
            </div>

            {/* Main Journal Feed */}
            <div className="max-w-2xl mx-auto space-y-12">
                <AnimatePresence>
                    {Object.entries(filteredEntries).map(([dateLabel, dayEntries]) => (
                        <motion.div
                            key={dateLabel}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="relative"
                        >
                            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-[#111827] font-playfair border-b border-[#E5E7EB] pb-2">
                                {dateLabel}
                            </h2>

                            <div className="space-y-4 border-l-2 border-[#E5E7EB] pl-4 md:pl-6 ml-2 md:ml-4">
                                {dayEntries.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        layout
                                        onClick={() => setSelectedEntry(entry)}
                                        className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs text-gray-400 font-medium font-mono uppercase tracking-wider">
                                                {format(new Date(entry.entry_date), 'h:mm a')} • {entry.source}
                                            </span>
                                        </div>

                                        <p className="text-[#111827] leading-relaxed whitespace-pre-wrap font-light">
                                            {entry.content}
                                        </p>

                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="mt-4 flex gap-2 flex-wrap">
                                                {entry.tags.map((tag: string) => (
                                                    <span key={tag} className="text-xs px-2.5 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-gray-500 rounded-md font-medium tracking-wide">
                                                        #{tag.replace('#', '')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {Object.keys(filteredEntries).length === 0 && (
                        <div className="text-center py-20 text-gray-400 font-medium">
                            No entries found matching "{search}"
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {selectedEntry && (
                <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm">
                    <QuickEditModal
                        entry={selectedEntry}
                        onClose={() => setSelectedEntry(null)}
                        onSave={handleSave}
                    />
                </div>
            )}
        </div>
    );
}
