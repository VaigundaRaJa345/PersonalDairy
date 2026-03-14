'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Book, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClientComponentClient();

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
                setSuccessMsg('Check your email for the confirmation link!');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-8">
            <div className="text-center mb-8">
                <Book className="w-10 h-10 text-[#111827] mx-auto mb-4" />
                <h2 className="text-2xl font-playfair font-semibold text-[#111827]">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                    {isLogin ? 'Enter your details to access your journal.' : 'Start your automated journaling journey.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                
                {successMsg && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg">
                        {successMsg}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E5E7EB] focus:ring-1 focus:ring-[#111827] focus:outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-[#E5E7EB] focus:ring-1 focus:ring-[#111827] focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#111827] hover:bg-gray-800 text-white rounded-lg font-medium transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                        setSuccessMsg(null);
                    }}
                    className="text-sm text-gray-500 hover:text-[#111827] transition-colors"
                >
                    {isLogin 
                        ? "Don't have an account? Sign up" 
                        : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    );
}
