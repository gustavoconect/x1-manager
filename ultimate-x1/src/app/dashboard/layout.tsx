import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-dark-950 bg-radial-hextech">
            <Sidebar />
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {children}
                </div>
                {/* Background Texture Overlay */}
                <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[url('/bg-texture.png')] mix-blend-overlay" />
            </main>
        </div>
    );
}
