'use client';

import { DiaryEntry } from '@/types/diary';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MessageSquare, Share2, Printer, Edit3, Save, Check, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface EntryDetailModalProps {
    entry: DiaryEntry | null;
    onClose: () => void;
}

export default function EntryDetailModal({ entry, onClose }: EntryDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(entry?.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    if (!entry) return null;

    const daysSinceCreation = differenceInDays(new Date(), new Date(entry.created_at));
    const isEditable = daysSinceCreation < 7;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('diary_entries')
                .update({ content: editedContent })
                .eq('id', entry.id);

            if (error) throw error;
            setIsEditing(false);
            router.refresh(); // Refresh to show new data
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Failed to update entry. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex items-center justify-between p-8 border-b border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Entry Timestamp</span>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-[#111827]" />
                                <h3 className="text-xl font-playfair font-bold text-[#111827]">
                                    {format(new Date(entry.entry_date), 'dd-MM-yyyy')}
                                </h3>
                                <span className="text-gray-300 mx-1">/</span>
                                <span className="text-sm font-medium text-gray-500">
                                    {format(new Date(entry.entry_date), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isEditable && !isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider"
                                >
                                    <Edit3 size={14} /> Edit Entry
                                </button>
                            )}
                            <button 
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-500 hover:text-gray-900"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {isEditing ? (
                            <textarea
                                className="w-full h-full min-h-[300px] p-6 rounded-3xl border-2 border-gray-100 focus:border-black outline-none transition-all text-gray-800 font-handwritten text-xl leading-relaxed resize-none"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                placeholder="Write your thoughts..."
                            />
                        ) : (
                            <div className="prose prose-sm max-w-none prose-p:leading-loose prose-p:text-gray-800 prose-p:font-medium font-handwritten text-xl">
                                <ReactMarkdown>{isSaving ? editedContent : entry.content}</ReactMarkdown>
                            </div>
                        )}

                        {entry.tags && entry.tags.length > 0 && (
                            <div className="mt-12 flex gap-2 flex-wrap">
                                {entry.tags.map((tag) => (
                                    <span key={tag} className="text-[11px] px-4 py-2 bg-gray-50 text-gray-400 rounded-full font-bold border border-gray-100 uppercase tracking-widest">
                                        #{tag.replace('#', '')}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-8 py-4 bg-[#111827] hover:bg-black text-white rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSaving}
                                        className="px-8 py-4 bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        CANCEL
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 border border-gray-200 text-[#111827] rounded-2xl text-xs font-bold transition-all shadow-sm">
                                        <Share2 size={14} /> SHARE LINK
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 border border-gray-200 text-[#111827] rounded-2xl text-xs font-bold transition-all shadow-sm">
                                        <Printer size={14} /> PRINT
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <MessageSquare size={12} />
                            SOURCE: {entry.source}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
