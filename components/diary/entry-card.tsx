'use client';

import { DiaryEntry } from '@/types/diary';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Share2, Eye, FileAudio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntryCardProps {
    entry: DiaryEntry;
    onView: (entry: DiaryEntry) => void;
    onDelete: (id: string) => void;
    onShare: (entry: DiaryEntry) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function EntryCard({ entry, onView, onDelete, onShare, isSelected, onSelect }: EntryCardProps) {
    const x = useMotionValue(0);
    const background = useTransform(x, [-100, 0], ['#fee2e2', '#ffffff']);
    const opacity = useTransform(x, [-100, -50], [1, 0]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x < -100) {
            if (confirm('Move this entry to trash?')) {
                onDelete(entry.id);
            } else {
                x.set(0);
            }
        } else {
            x.set(0);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl group">
            {/* Delete Background Action */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-8 text-white">
                <div className="flex flex-col items-center gap-1">
                    <Trash2 size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Trash</span>
                </div>
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                style={{ x, background }}
                onDragEnd={handleDragEnd}
                className={cn(
                    "relative z-10 p-6 bg-white border border-[#E5E7EB] cursor-pointer transition-all duration-300",
                    isSelected ? "ring-2 ring-[#111827] border-transparent shadow-lg" : "hover:shadow-md"
                )}
                onClick={() => onSelect(entry.id)}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            entry.source === 'telegram' ? "bg-blue-400" : entry.source === 'voice' ? "bg-purple-400" : "bg-emerald-400"
                        )} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {format(new Date(entry.entry_date), 'HH:mm')} • {entry.source}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onShare(entry); }}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Share2 size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onView(entry); }}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Eye size={14} />
                        </button>
                    </div>
                </div>

                {entry.source === 'voice' && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-2xl flex items-center gap-3 border border-purple-100">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm">
                            <FileAudio size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-purple-500" />
                            </div>
                            <span className="text-[10px] text-purple-400 font-bold mt-1 inline-block">VOICE MESSAGE</span>
                        </div>
                    </div>
                )}

                <p className="text-[#111827] leading-relaxed text-sm font-medium whitespace-pre-wrap line-clamp-4">
                    {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                    <div className="mt-5 flex gap-2 flex-wrap">
                        {entry.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg font-bold border border-gray-100 uppercase tracking-wider">
                                #{tag.replace('#', '')}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
