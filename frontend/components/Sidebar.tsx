'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    CheckCircleIcon,
    CalendarIcon,
    TagIcon,
    ArrowLeftOnRectangleIcon,
    SunIcon,
    MoonIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const menuItems = [
    { name: 'All Tasks', icon: HomeIcon, href: '/dashboard' },
    { name: 'Completed', icon: CheckCircleIcon, href: '/dashboard?filter=completed' },
    { name: 'Today', icon: CalendarIcon, href: '/dashboard?filter=today' },
    { name: 'Priority', icon: TagIcon, href: '/dashboard?filter=priority' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    if (!mounted) return null;

    return (
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r border-border/50 shadow-sm transition-all duration-300">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                        >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">TaskFlow</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-2">
                    Overview
                </div>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${isActive(item.href)
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                        {isActive(item.href) && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full my-1.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Profile & Settings */}
            <div className="p-4 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium">Dark Mode</span>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                        {theme === 'dark' ? (
                            <SunIcon className="w-5 h-5" />
                        ) : (
                            <MoonIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-muted/50">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Logout"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
