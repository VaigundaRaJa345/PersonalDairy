'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Search, Filter, Trash2, Download, FileText, Package, CheckSquare, Square, Share2, ArrowLeft, Archive, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import EntryCard from './entry-card';
import EntryDetailModal from './entry-detail-modal';
import { DiaryEntry } from '@/types/diary';
import { exportToPDF, exportToZIP } from '@/lib/export-utils';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';


export default function Timeline({ initialGroupedEntries }: { initialGroupedEntries: Record<string, DiaryEntry[]> }) {
    const [entries, setEntries] = useState<DiaryEntry[]>(Object.values(initialGroupedEntries).flat());
    const [search, setSearch] = useState('');
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isTrashView, setIsTrashView] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start?: Date, end?: Date }>({});

    const supabase = createClient();

    // Grouping helper
    const groupedData = useMemo(() => {
        let filtered = entries.filter(e => {
            const matchesSearch = e.content.toLowerCase().includes(search.toLowerCase()) || 
                                 e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
            const matchesTrash = isTrashView ? !!e.deleted_at : !e.deleted_at;
            
            let matchesDate = true;
            if (dateFilter.start && dateFilter.end) {
                const entryDate = new Date(e.entry_date);
                matchesDate = isWithinInterval(entryDate, { start: startOfDay(dateFilter.start), end: endOfDay(dateFilter.end) });
            }

            return matchesSearch && matchesTrash && matchesDate;
        });

        return filtered.reduce((acc, entry) => {
            const dateObj = new Date(entry.entry_date);
            let dateKey = format(dateObj, 'MMMM d, yyyy');
            if (isToday(dateObj)) dateKey = 'Today';
            else if (isYesterday(dateObj)) dateKey = 'Yesterday';

            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(entry);
            return acc;
        }, {} as Record<string, DiaryEntry[]>);
    }, [entries, search, isTrashView, dateFilter]);

    const handleSoftDelete = async (id: string) => {
        const deletedAt = new Date().toISOString();
        
        // Optimistic UI
        setEntries(prev => prev.map(e => e.id === id ? { ...e, deleted_at: deletedAt } : e));
        
        const { error } = await supabase
            .from('diary_entries')
            .update({ deleted_at: deletedAt })
            .eq('id', id);

        if (error) {
            alert('Failed to delete entry');
            // Revert on error?
        } else {
            confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
        }
    };

    const handleRestore = async (id: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, deleted_at: null } : e));
        await supabase.from('diary_entries').update({ deleted_at: null }).eq('id', id);
    };

    const toggleSelect = (id: string) => {
        if (!isSelectionMode) {
            setViewingEntry(entries.find(e => e.id === id) || null);
            return;
        }
        const next = new Set(selectedEntries);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedEntries(next);
    };

    const handleExport = (type: 'pdf' | 'zip') => {
        const toExport = entries.filter(e => selectedEntries.has(e.id));
        if (toExport.length === 0) return alert('Select entries first');
        
        if (type === 'pdf') exportToPDF(toExport);
        else exportToZIP(toExport);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-24 z-40 bg-[#F9FAFB]/80 backdrop-blur-md py-4 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search thoughts, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-3xl border border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/5 transition-all font-medium text-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        className={cn(
                            "p-4 rounded-2xl border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all",
                            isSelectionMode ? "bg-[#111827] text-white border-transparent" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                        )}
                    >
                        {isSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                        {isSelectionMode ? 'Selection ON' : 'Multi-Select'}
                    </button>
                    
                    <button 
                        onClick={() => setIsTrashView(!isTrashView)}
                        className={cn(
                            "p-4 rounded-2xl border flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all",
                            isTrashView ? "bg-red-50 text-red-600 border-red-100" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                        )}
                    >
                        {isTrashView ? <Archive size={16} /> : <Trash2 size={16} />}
                        {isTrashView ? 'Exit Trash' : 'Trash'}
                    </button>
                </div>
            </div>

            {/* Selection Toolbar (Floating) */}
            <AnimatePresence>
                {selectedEntries.size > 0 && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-white/10"
                    >
                        <span className="text-xs font-bold uppercase tracking-[0.2em] border-r border-white/20 pr-6 mr-2">
                            {selectedEntries.size} SELECTED
                        </span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleExport('pdf')} className="p-2 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center gap-1">
                                <FileText size={18} />
                                <span className="text-[8px] font-bold">PDF</span>
                            </button>
                            <button onClick={() => handleExport('zip')} className="p-2 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center gap-1">
                                <Package size={18} />
                                <span className="text-[8px] font-bold">ZIP</span>
                            </button>
                            <button onClick={() => setSelectedEntries(new Set())} className="p-2 hover:bg-white/10 rounded-xl transition-colors flex flex-col items-center gap-1">
                                <X size={18} />
                                <span className="text-[8px] font-bold">CLEAR</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeline Sections */}
            <div className="space-y-16">
                {Object.entries(groupedData).map(([date, dayEntries]) => (
                    <section key={date} className="relative">
                        <div className="sticky top-44 z-30 mb-8 bg-[#F9FAFB]/40 backdrop-blur-sm">
                            <h3 className="text-2xl font-playfair font-bold text-[#111827] flex items-center gap-4">
                                {date}
                                <div className="h-[1px] flex-1 bg-gray-100" />
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {dayEntries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    isSelected={selectedEntries.has(entry.id)}
                                    onSelect={toggleSelect}
                                    onView={setViewingEntry}
                                    onDelete={handleSoftDelete}
                                    onShare={(e) => alert(`Share link: ${window.location.origin}/share/${e.id}`)}
                                />
                            ))}
                        </div>
                    </section>
                ))}

                {Object.keys(groupedData).length === 0 && (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-gray-200" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-300 uppercase tracking-widest">No entries found</h4>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            <EntryDetailModal 
                entry={viewingEntry} 
                onClose={() => setViewingEntry(null)} 
            />
        </div>
    );
}

