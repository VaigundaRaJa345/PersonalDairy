'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Book, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                });
                if (error) throw error;
                setSuccessMsg('Magical link sent! Check your inbox.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 p-10 relative overflow-hidden"
        >
            {/* Ambient Background Elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />

            <div className="text-center mb-10 relative">
                <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-16 h-16 bg-[#111827] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                >
                    <Book className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-playfair font-bold text-[#111827] tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-500 text-sm mt-3 font-medium">
                    {isLogin ? 'Secure access to your personal sanctuary.' : 'Join the most aesthetic journaling experience.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 text-xs font-medium text-red-600 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    
                    {successMsg && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 text-xs font-medium text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    <div className="group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/50 focus:outline-none transition-all duration-300 text-sm font-medium"
                            placeholder="hello@sanctuary.com"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Secure Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100/50 focus:outline-none transition-all duration-300 text-sm font-medium"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#111827] hover:bg-black text-white rounded-2xl font-semibold tracking-wide transition-all duration-300 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isLogin ? 'Unlock Journal' : 'Create Sanctuary'}
                            <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </>
                    )}
                </motion.button>
            </form>

            <div className="mt-8 text-center relative pt-6 border-t border-gray-100">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                        setSuccessMsg(null);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-[#111827] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    {isLogin 
                        ? (<span>No account? <span className="text-[#111827]">Sign Up</span></span>)
                        : (<span>Already joined? <span className="text-[#111827]">Log In</span></span>)}
                </button>
            </div>
        </motion.div>
    );
}
