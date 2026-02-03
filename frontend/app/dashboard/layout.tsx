import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 transition-all duration-300 w-full">
                <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
