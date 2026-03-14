import AuthForm from "@/components/auth/auth-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
            <main className="w-full flex justify-center">
                <AuthForm />
            </main>
            <footer className="mt-12 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} ZenStream
            </footer>
        </div>
    );
}
