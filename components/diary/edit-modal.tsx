'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type EditModalProps = {
    entry: any;
    onClose: () => void;
    onSave: (updatedEntry: any) => void;
};

export default function QuickEditModal({ entry, onClose, onSave }: EditModalProps) {
    const [content, setContent] = useState(entry.content);
    // Basic date handling for the sake of demo (in a real app, use a date picker library)
    const [dateStr, setDateStr] = useState(format(new Date(entry.entry_date), 'yyyy-MM-dd'));

    const handleSave = () => {
        onSave({
            ...entry,
            content,
            entry_date: new Date(dateStr).toISOString()
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E5E7EB]"
                >
                    <div className="flex justify-between items-center p-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <h3 className="font-playfair font-semibold text-lg text-[#111827]">Edit Entry</h3>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 transition">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon size={16} className="text-gray-400" />
                            <input
                                type="date"
                                value={dateStr}
                                onChange={(e) => setDateStr(e.target.value)}
                                className="text-sm border border-[#E5E7EB] rounded-md px-3 py-1.5 focus:ring-1 focus:ring-[#111827] focus:outline-none"
                            />
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-40 p-4 border border-[#E5E7EB] rounded-xl resize-none focus:ring-1 focus:ring-[#111827] focus:outline-none placeholder-gray-400 text-[#111827] whitespace-pre-wrap"
                            placeholder="Write your thoughts..."
                        />
                    </div>

                    <div className="p-4 border-t border-[#E5E7EB] flex justify-end">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-full font-medium hover:bg-gray-800 transition shadow-sm"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
